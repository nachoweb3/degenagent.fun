import { Keypair } from '@solana/web3.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:3001';

// Secure key storage with AES-256-GCM encryption
const KEYS_DIR = path.join(__dirname, '../../../backend/.keys');
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const AUTH_TAG_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32;

/**
 * Derives encryption key from master password using PBKDF2
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(masterKey, salt, 100000, KEY_LENGTH, 'sha256');
}

/**
 * Gets the master encryption key from environment
 * In production, this should be retrieved from secure storage (e.g., AWS Secrets Manager)
 */
function getMasterKey(): string {
  const masterKey = process.env.ENCRYPTION_MASTER_KEY;

  if (!masterKey) {
    throw new Error('ENCRYPTION_MASTER_KEY not set in environment. Keys cannot be decrypted.');
  }

  if (masterKey.length < 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be at least 32 characters long');
  }

  return masterKey;
}

/**
 * Encrypts data using AES-256-GCM
 */
export function encryptData(plaintext: Buffer, masterKey: string): string {
  // Generate random salt and IV
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);

  // Derive key from master key and salt
  const key = deriveKey(masterKey, salt);

  // Encrypt
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
export function decryptData(encryptedData: string, masterKey: string): Buffer {
  const data = Buffer.from(encryptedData, 'base64');

  // Extract components
  const salt = data.subarray(0, SALT_LENGTH);
  const iv = data.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = data.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  // Derive key
  const key = deriveKey(masterKey, salt);

  // Decrypt
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]);
}

/**
 * Securely loads and decrypts an agent keypair
 * Never logs or exposes the private key
 */
export async function getAgentKeypair(agentWallet: string): Promise<Keypair> {
  let keyPath: string | undefined;

  try {
    const masterKey = getMasterKey();
    keyPath = path.join(KEYS_DIR, `${agentWallet}.enc`);

    // Read encrypted key file
    const encryptedData = await fs.readFile(keyPath, 'utf-8');

    // Decrypt the key
    const decryptedKey = decryptData(encryptedData, masterKey);
    const secretKey = new Uint8Array(decryptedKey);

    // Create keypair
    const keypair = Keypair.fromSecretKey(secretKey);

    // Verify the public key matches
    if (keypair.publicKey.toBase58() !== agentWallet) {
      // Mask the actual wallet address in error to avoid information leakage
      throw new Error('Key verification failed: public key mismatch');
    }

    // Log access without exposing sensitive data
    console.log(`[KEY-ACCESS] Agent keypair loaded successfully (wallet: ${agentWallet.slice(0, 8)}...)`);

    return keypair;

  } catch (error) {
    // Secure error logging - never expose key material
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[KEY-ACCESS-ERROR] Failed to load agent keypair (wallet: ${agentWallet.slice(0, 8)}...): ${errorMessage}`);

    if (errorMessage.includes('ENCRYPTION_MASTER_KEY')) {
      throw new Error('Encryption configuration error');
    }

    throw new Error('Agent keypair not found or decryption failed');
  }
}

/**
 * Validates that the encryption system is properly configured
 */
export async function validateEncryptionSetup(): Promise<boolean> {
  try {
    const masterKey = getMasterKey();

    // Test encryption/decryption
    const testData = Buffer.from('test-data-12345');
    const encrypted = encryptData(testData, masterKey);
    const decrypted = decryptData(encrypted, masterKey);

    return testData.equals(decrypted);
  } catch (error) {
    console.error('[ENCRYPTION-VALIDATION] Setup validation failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

// AWS KMS integration for production (alternative to local encryption)
/*
import { KMSClient, DecryptCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({ region: process.env.AWS_REGION });

export async function getAgentKeypair(agentWallet: string): Promise<Keypair> {
  try {
    // Fetch encrypted key from secure storage
    const keyPath = path.join(KEYS_DIR, `${agentWallet}.kms`);
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
    if (keypair.publicKey.toBase58() !== agentWallet) {
      throw new Error('Key verification failed');
    }

    console.log(`[KMS-KEY-ACCESS] Keypair decrypted successfully (wallet: ${agentWallet.slice(0, 8)}...)`);

    return keypair;
  } catch (error) {
    console.error(`[KMS-KEY-ACCESS-ERROR] Failed to decrypt keypair (wallet: ${agentWallet.slice(0, 8)}...)`);
    throw new Error('Agent keypair not found or KMS decryption failed');
  }
}
*/
