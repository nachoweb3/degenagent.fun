import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { Keypair } from '@solana/web3.js';

// Secure key storage with AES-256-GCM encryption
const KEYS_DIR = path.join(__dirname, '../../.keys');
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;

// Key rotation tracking
const ROTATION_FILE = path.join(KEYS_DIR, '.rotation_log.json');

interface RotationLog {
  lastRotation: string;
  rotationCount: number;
  keyVersion: number;
}

/**
 * Derives encryption key from master password using PBKDF2
 * Uses 100,000 iterations for strong key derivation
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Gets the master encryption key from environment
 * In production, this should be retrieved from AWS Secrets Manager or similar
 */
function getMasterKey(): string {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY not set in environment. Keys cannot be encrypted/decrypted.');
  }

  if (masterKey.length < 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters long for security');
  }

  return masterKey;
}

/**
 * Encrypts data using AES-256-GCM with authenticated encryption
 */
function encryptData(plaintext: Buffer, masterKey: string): string {
  // Generate random salt and IV for each encryption
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Encrypt with authenticated encryption
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Combine: salt + iv + authTag + encrypted data
  const result = Buffer.concat([salt, iv, authTag, encrypted]);

  return result.toString('base64');
}

/**
 * Decrypts data using AES-256-GCM
 */
function decryptData(encryptedData: string, masterKey: string): Buffer {
  const data = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key
  const key = deriveKey(masterKey, salt);

  // Decrypt and verify authenticity
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Securely saves an agent keypair with encryption
 * Never logs the actual private key
 */
export async function saveAgentKeypair(agentPubkey: string, secretKey: Uint8Array): Promise<void> {
  try {
    const masterKey = getMasterKey();

    // Ensure directory exists with restricted permissions
    await fs.mkdir(KEYS_DIR, { recursive: true, mode: 0o700 });

    const keyPath = path.join(KEYS_DIR, `${agentPubkey}.enc`);

    // Encrypt the private key
    const encryptedKey = encryptData(Buffer.from(secretKey), masterKey);

    // Write encrypted key to file
    await fs.writeFile(keyPath, encryptedKey, { mode: 0o600 });

    // Verify we can decrypt it
    const testDecrypt = decryptData(encryptedKey, masterKey);
    if (!Buffer.from(secretKey).equals(testDecrypt)) {
      throw new Error('Encryption verification failed');
    }

    // Log success without exposing key material
    console.log(`[KEY-SAVE] Agent keypair encrypted and saved (wallet: ${agentPubkey.slice(0, 8)}...)`);
    console.log(`[KEY-SAVE] Encryption: AES-256-GCM with PBKDF2 key derivation`);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[KEY-SAVE-ERROR] Failed to save agent keypair (wallet: ${agentPubkey.slice(0, 8)}...): ${errorMessage}`);
    throw new Error('Failed to save agent keypair securely');
  }
}

/**
 * Securely retrieves and decrypts an agent keypair
 * Never logs the actual private key
 */
export async function getAgentKeypair(agentPubkey: string): Promise<Keypair> {
  try {
    const masterKey = getMasterKey();
    const keyPath = path.join(KEYS_DIR, `${agentPubkey}.enc`);

    // Read encrypted key file
    const encryptedData = await fs.readFile(keyPath, 'utf-8');

    // Decrypt the key
    const decryptedKey = decryptData(encryptedData, masterKey);
    const secretKey = new Uint8Array(decryptedKey);

    // Create keypair
    const keypair = Keypair.fromSecretKey(secretKey);

    // Verify public key matches
    if (keypair.publicKey.toBase58() !== agentPubkey) {
      throw new Error('Key verification failed: public key mismatch');
    }

    console.log(`[KEY-RETRIEVE] Agent keypair decrypted successfully (wallet: ${agentPubkey.slice(0, 8)}...)`);

    return keypair;

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[KEY-RETRIEVE-ERROR] Failed to retrieve agent keypair (wallet: ${agentPubkey.slice(0, 8)}...): ${errorMessage}`);
    throw new Error('Agent keypair not found or decryption failed');
  }
}

/**
 * Lists all agent public keys (without decrypting)
 */
export async function getAllAgentKeys(): Promise<string[]> {
  try {
    await fs.mkdir(KEYS_DIR, { recursive: true });
    const files = await fs.readdir(KEYS_DIR);

    const keys = files
      .filter(f => f.endsWith('.enc'))
      .map(f => f.replace('.enc', ''));

    console.log(`[KEY-LIST] Found ${keys.length} encrypted agent keys`);

    return keys;

  } catch (error) {
    console.error('[KEY-LIST-ERROR] Error listing agent keys:', error instanceof Error ? error.message : 'Unknown error');
    return [];
  }
}

/**
 * Rotates encryption for an agent keypair (re-encrypts with new salt/IV)
 */
export async function rotateAgentKeyEncryption(agentPubkey: string): Promise<void> {
  try {
    // Retrieve current keypair
    const keypair = await getAgentKeypair(agentPubkey);

    // Re-save with new encryption (new salt and IV)
    await saveAgentKeypair(agentPubkey, keypair.secretKey);

    // Update rotation log
    await updateRotationLog(agentPubkey);

    console.log(`[KEY-ROTATION] Successfully rotated encryption for agent (wallet: ${agentPubkey.slice(0, 8)}...)`);

  } catch (error) {
    console.error(`[KEY-ROTATION-ERROR] Failed to rotate encryption for agent (wallet: ${agentPubkey.slice(0, 8)}...)`);
    throw error;
  }
}

/**
 * Updates the rotation log
 */
async function updateRotationLog(agentPubkey: string): Promise<void> {
  try {
    let log: Record<string, RotationLog> = {};

    try {
      const logData = await fs.readFile(ROTATION_FILE, 'utf-8');
      log = JSON.parse(logData);
    } catch {
      // File doesn't exist yet
    }

    const current = log[agentPubkey] || { rotationCount: 0, keyVersion: 1 };

    log[agentPubkey] = {
      lastRotation: new Date().toISOString(),
      rotationCount: current.rotationCount + 1,
      keyVersion: current.keyVersion + 1,
    };

    await fs.writeFile(ROTATION_FILE, JSON.stringify(log, null, 2));

  } catch (error) {
    console.error('[ROTATION-LOG-ERROR] Failed to update rotation log');
  }
}

/**
 * Deletes an agent keypair securely (overwrites before deletion)
 */
export async function deleteAgentKeypair(agentPubkey: string): Promise<void> {
  try {
    const keyPath = path.join(KEYS_DIR, `${agentPubkey}.enc`);

    // Get file size
    const stats = await fs.stat(keyPath);

    // Overwrite with random data multiple times (DoD 5220.22-M standard)
    for (let i = 0; i < 3; i++) {
      const randomData = crypto.randomBytes(stats.size);
      await fs.writeFile(keyPath, randomData);
    }

    // Finally delete the file
    await fs.unlink(keyPath);

    console.log(`[KEY-DELETE] Agent keypair securely deleted (wallet: ${agentPubkey.slice(0, 8)}...)`);

  } catch (error) {
    console.error(`[KEY-DELETE-ERROR] Failed to delete agent keypair (wallet: ${agentPubkey.slice(0, 8)}...)`);
    throw error;
  }
}

/**
 * Validates encryption setup is working correctly
 */
export async function validateEncryptionSetup(): Promise<boolean> {
  try {
    const masterKey = getMasterKey();

    // Test encryption/decryption
    const testData = Buffer.from('test-validation-data-12345');
    const encrypted = encryptData(testData, masterKey);
    const decrypted = decryptData(encrypted, masterKey);

    const isValid = testData.equals(decrypted);

    if (isValid) {
      console.log('[ENCRYPTION-VALIDATION] Encryption system validated successfully');
    }

    return isValid;
  } catch (error) {
    console.error('[ENCRYPTION-VALIDATION-ERROR] Setup validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// AWS KMS integration for production (alternative to local encryption)
/*
import { KMSClient, EncryptCommand, DecryptCommand, GenerateDataKeyCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({ region: process.env.AWS_REGION || 'us-east-1' });

export async function saveAgentKeypairKMS(agentPubkey: string, secretKey: Uint8Array): Promise<void> {
  try {
    // Encrypt with KMS
    const command = new EncryptCommand({
      KeyId: process.env.AWS_KMS_KEY_ID,
      Plaintext: secretKey,
    });

    const response = await kmsClient.send(command);
    const encryptedKey = Buffer.from(response.CiphertextBlob!).toString('base64');

    // Save encrypted key
    await fs.mkdir(KEYS_DIR, { recursive: true });
    const keyPath = path.join(KEYS_DIR, `${agentPubkey}.kms`);
    await fs.writeFile(keyPath, encryptedKey);

    console.log(`[KMS-KEY-SAVE] Agent keypair encrypted with AWS KMS (wallet: ${agentPubkey.slice(0, 8)}...)`);

  } catch (error) {
    console.error(`[KMS-KEY-SAVE-ERROR] Failed to encrypt with KMS (wallet: ${agentPubkey.slice(0, 8)}...)`);
    throw error;
  }
}

export async function getAgentKeypairKMS(agentPubkey: string): Promise<Keypair> {
  try {
    const keyPath = path.join(KEYS_DIR, `${agentPubkey}.kms`);
    const encryptedKey = await fs.readFile(keyPath, 'utf-8');

    // Decrypt with KMS
    const command = new DecryptCommand({
      CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
      KeyId: process.env.AWS_KMS_KEY_ID,
    });

    const response = await kmsClient.send(command);
    const secretKey = new Uint8Array(response.Plaintext!);

    const keypair = Keypair.fromSecretKey(secretKey);

    // Verify public key matches
    if (keypair.publicKey.toBase58() !== agentPubkey) {
      throw new Error('Key verification failed');
    }

    console.log(`[KMS-KEY-RETRIEVE] Keypair decrypted with AWS KMS (wallet: ${agentPubkey.slice(0, 8)}...)`);

    return keypair;
  } catch (error) {
    console.error(`[KMS-KEY-RETRIEVE-ERROR] Failed to decrypt with KMS (wallet: ${agentPubkey.slice(0, 8)}...)`);
    throw new Error('Agent keypair not found or KMS decryption failed');
  }
}
*/
