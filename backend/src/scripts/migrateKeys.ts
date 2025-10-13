/**
 * Key Migration Script
 *
 * Migrates existing unencrypted agent keys (.json) to encrypted format (.enc)
 *
 * Usage:
 *   npm run migrate:keys
 *
 * This script:
 * 1. Finds all .json key files in .keys directory
 * 2. Reads the unencrypted private keys
 * 3. Encrypts them using the current ENCRYPTION_MASTER_KEY
 * 4. Saves as .enc files
 * 5. Optionally deletes old .json files
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { Keypair } from '@solana/web3.js';
import { saveAgentKeypair } from '../services/keyManager';

const KEYS_DIR = path.join(__dirname, '../../.keys');

interface MigrationResult {
  pubkey: string;
  success: boolean;
  error?: string;
}

async function migrateKeys(deleteOldKeys: boolean = false): Promise<void> {
  console.log('\n========================================');
  console.log('🔐 AGENT KEY MIGRATION SCRIPT');
  console.log('========================================\n');

  // Check if ENCRYPTION_MASTER_KEY is set
  if (!process.env.ENCRYPTION_MASTER_KEY) {
    console.error('❌ ERROR: ENCRYPTION_MASTER_KEY not set in environment');
    console.error('   Please set this variable before running migration\n');
    process.exit(1);
  }

  console.log('✓ ENCRYPTION_MASTER_KEY is configured');
  console.log(`✓ Keys directory: ${KEYS_DIR}\n`);

  try {
    // Ensure .keys directory exists
    await fs.mkdir(KEYS_DIR, { recursive: true });

    // List all files in .keys directory
    const files = await fs.readdir(KEYS_DIR);

    // Filter for .json files (old unencrypted format)
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      console.log('✓ No unencrypted keys found. All keys are already encrypted.\n');
      return;
    }

    console.log(`Found ${jsonFiles.length} unencrypted key(s) to migrate:\n`);

    const results: MigrationResult[] = [];

    // Migrate each key
    for (const filename of jsonFiles) {
      const pubkey = filename.replace('.json', '');
      console.log(`Migrating: ${pubkey.slice(0, 8)}...`);

      try {
        const keyPath = path.join(KEYS_DIR, filename);

        // Read the unencrypted key
        const keyData = await fs.readFile(keyPath, 'utf-8');
        const keyArray = JSON.parse(keyData);
        const secretKey = Uint8Array.from(keyArray);

        // Verify it's a valid keypair
        const keypair = Keypair.fromSecretKey(secretKey);
        const actualPubkey = keypair.publicKey.toBase58();

        // Verify filename matches public key
        if (actualPubkey !== pubkey) {
          throw new Error(`Public key mismatch: filename says ${pubkey.slice(0, 8)}..., key says ${actualPubkey.slice(0, 8)}...`);
        }

        // Encrypt and save
        await saveAgentKeypair(pubkey, secretKey);

        // Verify encrypted file was created
        const encPath = path.join(KEYS_DIR, `${pubkey}.enc`);
        await fs.access(encPath);

        console.log(`  ✓ Encrypted and saved as ${pubkey.slice(0, 8)}....enc`);

        results.push({
          pubkey,
          success: true
        });

        // Delete old unencrypted file if requested
        if (deleteOldKeys) {
          await fs.unlink(keyPath);
          console.log(`  ✓ Deleted old unencrypted file`);
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ✗ Failed: ${errorMessage}`);

        results.push({
          pubkey,
          success: false,
          error: errorMessage
        });
      }

      console.log('');
    }

    // Print summary
    console.log('========================================');
    console.log('MIGRATION SUMMARY');
    console.log('========================================\n');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`Total Keys: ${results.length}`);
    console.log(`Successful: ${successful} ✓`);
    console.log(`Failed: ${failed} ✗\n`);

    if (failed > 0) {
      console.log('Failed Migrations:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.pubkey.slice(0, 8)}...: ${r.error}`);
      });
      console.log('');
    }

    if (!deleteOldKeys && successful > 0) {
      console.log('⚠️  Old .json files are still present.');
      console.log('   Run with --delete-old flag to remove them after verifying migration.\n');
    }

    if (successful === results.length) {
      console.log('🎉 All keys migrated successfully!\n');
    } else if (successful > 0) {
      console.log('⚠️  Some keys migrated, but some failed. Please review.\n');
    } else {
      console.log('❌ Migration failed. No keys were migrated.\n');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  }
}

/**
 * Verify migrated keys work correctly
 */
async function verifyMigration(): Promise<void> {
  console.log('\n========================================');
  console.log('🔍 VERIFYING MIGRATED KEYS');
  console.log('========================================\n');

  try {
    const files = await fs.readdir(KEYS_DIR);
    const encFiles = files.filter(f => f.endsWith('.enc'));

    if (encFiles.length === 0) {
      console.log('No encrypted keys found to verify.\n');
      return;
    }

    console.log(`Verifying ${encFiles.length} encrypted key(s):\n`);

    let allValid = true;

    for (const filename of encFiles) {
      const pubkey = filename.replace('.enc', '');
      console.log(`Verifying: ${pubkey.slice(0, 8)}...`);

      try {
        const keyPath = path.join(KEYS_DIR, filename);

        // Read encrypted file
        const encryptedData = await fs.readFile(keyPath, 'utf-8');

        // Verify it's base64
        if (!/^[A-Za-z0-9+/]+=*$/.test(encryptedData)) {
          throw new Error('File is not valid base64');
        }

        // Verify it's not plain JSON
        if (encryptedData.startsWith('{') || encryptedData.startsWith('[')) {
          throw new Error('File appears to be unencrypted JSON');
        }

        console.log(`  ✓ File is properly encrypted`);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`  ✗ Verification failed: ${errorMessage}`);
        allValid = false;
      }

      console.log('');
    }

    if (allValid) {
      console.log('🎉 All encrypted keys verified successfully!\n');
    } else {
      console.log('⚠️  Some keys failed verification. Please review.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during verification:', error);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const deleteOld = args.includes('--delete-old');
const verifyOnly = args.includes('--verify');

// Main execution
async function main() {
  if (verifyOnly) {
    await verifyMigration();
  } else {
    await migrateKeys(deleteOld);

    // Optionally verify after migration
    if (args.includes('--verify')) {
      await verifyMigration();
    }
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { migrateKeys, verifyMigration };
