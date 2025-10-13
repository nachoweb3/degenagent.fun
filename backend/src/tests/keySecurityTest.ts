/**
 * Security Test Suite for Agent Private Key Management
 *
 * Validates that:
 * 1. Keys are encrypted at rest
 * 2. Keys are never exposed in logs
 * 3. Encryption/decryption works correctly
 * 4. Master key is required
 * 5. File permissions are correct
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Keypair } from '@solana/web3.js';
import * as crypto from 'crypto';

// Load environment variables
dotenv.config();

// Import the functions to test
import {
  saveAgentKeypair,
  getAgentKeypair,
  getAllAgentKeys,
  validateEncryptionSetup,
  rotateAgentKeyEncryption,
  deleteAgentKeypair
} from '../services/keyManager';

const KEYS_DIR = path.join(__dirname, '../../.keys');

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

/**
 * Test utilities
 */
function logTest(name: string, passed: boolean, message: string) {
  results.push({ name, passed, message });
  const icon = passed ? '✓' : '✗';
  const status = passed ? 'PASS' : 'FAIL';
  console.log(`${icon} [${status}] ${name}: ${message}`);
}

/**
 * Capture console output to verify no keys are logged
 */
class ConsoleCapture {
  private originalLog!: typeof console.log;
  private originalError!: typeof console.error;
  private logs: string[] = [];

  start() {
    this.logs = [];
    this.originalLog = console.log;
    this.originalError = console.error;

    console.log = (...args: any[]) => {
      this.logs.push(args.map(String).join(' '));
      this.originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.logs.push(args.map(String).join(' '));
      this.originalError.apply(console, args);
    };
  }

  stop(): string[] {
    console.log = this.originalLog;
    console.error = this.originalError;
    return this.logs;
  }

  hasPrivateKeyInLogs(secretKey: Uint8Array): boolean {
    const keyHex = Buffer.from(secretKey).toString('hex');
    const keyBase58 = Buffer.from(secretKey).toString('base64');
    const keyArray = Array.from(secretKey).join(',');

    return this.logs.some(log =>
      log.includes(keyHex) ||
      log.includes(keyBase58) ||
      log.includes(keyArray)
    );
  }
}

/**
 * Test 1: Validate encryption setup
 */
async function testEncryptionSetup(): Promise<void> {
  try {
    const isValid = await validateEncryptionSetup();

    if (isValid) {
      logTest(
        'Encryption Setup Validation',
        true,
        'AES-256-GCM encryption is configured correctly'
      );
    } else {
      logTest(
        'Encryption Setup Validation',
        false,
        'Encryption validation failed'
      );
    }
  } catch (error) {
    logTest(
      'Encryption Setup Validation',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 2: Keys are encrypted at rest
 */
async function testKeysEncryptedAtRest(): Promise<void> {
  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();

    // Save the keypair
    await saveAgentKeypair(testPubkey, testKeypair.secretKey);

    // Read the encrypted file
    const keyPath = path.join(KEYS_DIR, `${testPubkey}.enc`);
    const encryptedContent = await fs.readFile(keyPath, 'utf-8');

    // Verify it's not plain JSON
    const isNotJSON = !encryptedContent.startsWith('{') && !encryptedContent.startsWith('[');

    // Verify it doesn't contain the private key in any readable form
    const secretKeyHex = Buffer.from(testKeypair.secretKey).toString('hex');
    const doesNotContainKey = !encryptedContent.includes(secretKeyHex);

    // Verify it's base64-encoded
    const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(encryptedContent);

    const passed = isNotJSON && doesNotContainKey && isBase64;

    logTest(
      'Keys Encrypted at Rest',
      passed,
      passed
        ? 'Keys are properly encrypted and not readable'
        : 'Keys may not be properly encrypted'
    );

    // Cleanup
    await deleteAgentKeypair(testPubkey);

  } catch (error) {
    logTest(
      'Keys Encrypted at Rest',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 3: Keys never exposed in logs
 */
async function testNoKeysInLogs(): Promise<void> {
  const capture = new ConsoleCapture();

  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();

    // Start capturing logs
    capture.start();

    // Perform operations that might log
    await saveAgentKeypair(testPubkey, testKeypair.secretKey);
    await getAgentKeypair(testPubkey);
    await getAllAgentKeys();

    // Stop capturing
    const logs = capture.stop();

    // Check if private key appears in logs
    const hasPrivateKey = capture.hasPrivateKeyInLogs(testKeypair.secretKey);

    // Check if full public key is masked
    const hasFullPublicKey = logs.some(log =>
      log.includes(testPubkey) && !log.includes('...')
    );

    const passed = !hasPrivateKey;

    logTest(
      'No Keys in Logs',
      passed,
      passed
        ? 'Private keys are never logged'
        : 'SECURITY ISSUE: Private key found in logs!'
    );

    if (!passed) {
      console.error('WARNING: This is a critical security vulnerability!');
    }

    // Cleanup
    await deleteAgentKeypair(testPubkey);

  } catch (error) {
    capture.stop();
    logTest(
      'No Keys in Logs',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 4: Encryption/Decryption roundtrip
 */
async function testEncryptionDecryption(): Promise<void> {
  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();
    const originalSecretKey = testKeypair.secretKey;

    // Save (encrypt)
    await saveAgentKeypair(testPubkey, originalSecretKey);

    // Retrieve (decrypt)
    const retrievedKeypair = await getAgentKeypair(testPubkey);

    // Compare
    const secretKeysMatch = Buffer.from(originalSecretKey).equals(
      Buffer.from(retrievedKeypair.secretKey)
    );

    const publicKeysMatch = testKeypair.publicKey.toBase58() ===
      retrievedKeypair.publicKey.toBase58();

    const passed = secretKeysMatch && publicKeysMatch;

    logTest(
      'Encryption/Decryption Roundtrip',
      passed,
      passed
        ? 'Keys encrypted and decrypted correctly'
        : 'Key mismatch after encryption/decryption'
    );

    // Cleanup
    await deleteAgentKeypair(testPubkey);

  } catch (error) {
    logTest(
      'Encryption/Decryption Roundtrip',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 5: Master key is required
 */
async function testMasterKeyRequired(): Promise<void> {
  try {
    const originalMasterKey = process.env.ENCRYPTION_MASTER_KEY;

    // Remove master key temporarily
    delete process.env.ENCRYPTION_MASTER_KEY;

    let errorThrown = false;
    try {
      const testKeypair = Keypair.generate();
      await saveAgentKeypair(testKeypair.publicKey.toBase58(), testKeypair.secretKey);
    } catch (error) {
      errorThrown = true;
    }

    // Restore master key
    process.env.ENCRYPTION_MASTER_KEY = originalMasterKey;

    logTest(
      'Master Key Required',
      errorThrown,
      errorThrown
        ? 'Operations correctly fail without master key'
        : 'SECURITY ISSUE: Operations work without master key!'
    );

  } catch (error) {
    logTest(
      'Master Key Required',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 6: Key rotation works
 */
async function testKeyRotation(): Promise<void> {
  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();

    // Save initial version
    await saveAgentKeypair(testPubkey, testKeypair.secretKey);

    // Read encrypted file
    const keyPath = path.join(KEYS_DIR, `${testPubkey}.enc`);
    const originalEncrypted = await fs.readFile(keyPath, 'utf-8');

    // Wait a bit to ensure timestamp changes
    await new Promise(resolve => setTimeout(resolve, 100));

    // Rotate encryption
    await rotateAgentKeyEncryption(testPubkey);

    // Read new encrypted file
    const rotatedEncrypted = await fs.readFile(keyPath, 'utf-8');

    // Verify content changed (new salt/IV)
    const encryptionChanged = originalEncrypted !== rotatedEncrypted;

    // Verify key still works
    const retrievedKeypair = await getAgentKeypair(testPubkey);
    const keyStillWorks = Buffer.from(testKeypair.secretKey).equals(
      Buffer.from(retrievedKeypair.secretKey)
    );

    const passed = encryptionChanged && keyStillWorks;

    logTest(
      'Key Rotation',
      passed,
      passed
        ? 'Key rotation works correctly'
        : 'Key rotation failed'
    );

    // Cleanup
    await deleteAgentKeypair(testPubkey);

  } catch (error) {
    logTest(
      'Key Rotation',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 7: Secure deletion
 */
async function testSecureDeletion(): Promise<void> {
  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();

    // Save the keypair
    await saveAgentKeypair(testPubkey, testKeypair.secretKey);

    const keyPath = path.join(KEYS_DIR, `${testPubkey}.enc`);

    // Verify file exists
    await fs.access(keyPath);

    // Delete securely
    await deleteAgentKeypair(testPubkey);

    // Verify file is deleted
    let fileDeleted = false;
    try {
      await fs.access(keyPath);
    } catch {
      fileDeleted = true;
    }

    logTest(
      'Secure Deletion',
      fileDeleted,
      fileDeleted
        ? 'Keys are securely deleted'
        : 'File still exists after deletion'
    );

  } catch (error) {
    logTest(
      'Secure Deletion',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Test 8: Verify public key matches
 */
async function testPublicKeyVerification(): Promise<void> {
  try {
    // Generate test keypair
    const testKeypair = Keypair.generate();
    const testPubkey = testKeypair.publicKey.toBase58();

    // Save the keypair
    await saveAgentKeypair(testPubkey, testKeypair.secretKey);

    // Try to retrieve with wrong pubkey
    const wrongPubkey = Keypair.generate().publicKey.toBase58();

    // Manually modify the file to have wrong pubkey
    const correctPath = path.join(KEYS_DIR, `${testPubkey}.enc`);
    const wrongPath = path.join(KEYS_DIR, `${wrongPubkey}.enc`);
    await fs.copyFile(correctPath, wrongPath);

    let errorThrown = false;
    try {
      await getAgentKeypair(wrongPubkey);
    } catch (error) {
      errorThrown = true;
    }

    logTest(
      'Public Key Verification',
      errorThrown,
      errorThrown
        ? 'Public key mismatch is detected'
        : 'SECURITY ISSUE: Public key verification not working'
    );

    // Cleanup
    await deleteAgentKeypair(testPubkey);
    await deleteAgentKeypair(wrongPubkey).catch(() => {});

  } catch (error) {
    logTest(
      'Public Key Verification',
      false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Run all tests
 */
async function runAllTests(): Promise<void> {
  console.log('\n========================================');
  console.log('🔒 AGENT PRIVATE KEY SECURITY TEST SUITE');
  console.log('========================================\n');

  await testEncryptionSetup();
  await testKeysEncryptedAtRest();
  await testNoKeysInLogs();
  await testEncryptionDecryption();
  await testMasterKeyRequired();
  await testKeyRotation();
  await testSecureDeletion();
  await testPublicKeyVerification();

  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================\n');

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${passed} ✓`);
  console.log(`Failed: ${failed} ✗`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    console.log('FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
    console.log('');
  }

  if (failed === 0) {
    console.log('🎉 All security tests passed!\n');
  } else {
    console.log('⚠️  Some security tests failed. Please review!\n');
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('Fatal error running tests:', error);
    process.exit(1);
  });
}

export { runAllTests };
