# Security Setup Guide - Agent Key Management

## Quick Start

### 1. Generate Master Encryption Key

```bash
# Generate a secure 32-byte (256-bit) random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

### 2. Configure Environment Variables

Add the generated key to both `.env` files:

**backend/.env**
```bash
ENCRYPTION_MASTER_KEY=YOUR_GENERATED_KEY_HERE
```

**executor/.env**
```bash
ENCRYPTION_MASTER_KEY=YOUR_GENERATED_KEY_HERE
```

**IMPORTANT**: Both files must use the SAME key!

### 3. Verify Setup

```bash
cd backend
npm run test:security
```

You should see all tests pass:
```
✓ [PASS] Encryption Setup Validation
✓ [PASS] Keys Encrypted at Rest
✓ [PASS] No Keys in Logs
✓ [PASS] Encryption/Decryption Roundtrip
✓ [PASS] Master Key Required
✓ [PASS] Key Rotation
✓ [PASS] Secure Deletion
✓ [PASS] Public Key Verification

🎉 All security tests passed!
```

## Migration from Old System

If you have existing unencrypted keys (`.json` files), migrate them:

### Step 1: Check for Old Keys

```bash
ls backend/.keys/*.json
```

If you see `.json` files, you need to migrate.

### Step 2: Run Migration

```bash
cd backend
npm run migrate:keys
```

This will:
- Find all `.json` key files
- Encrypt them with your master key
- Save as `.enc` files
- Keep old `.json` files (for safety)

### Step 3: Verify Migration

```bash
npm run verify:keys
```

### Step 4: Delete Old Keys (Optional)

After verifying migration works:

```bash
npm run migrate:keys -- --delete-old
```

This will permanently delete the old unencrypted `.json` files.

## File Structure

After setup, your `.keys` directory should look like:

```
backend/.keys/
├── <agent1-pubkey>.enc
├── <agent2-pubkey>.enc
├── <agent3-pubkey>.enc
└── .rotation_log.json
```

- `.enc` files are encrypted private keys (AES-256-GCM)
- `.rotation_log.json` tracks key rotation history
- No `.json` files should remain

## How It Works

### Encryption Process

1. **Key Derivation**: Master key + random salt → encryption key (PBKDF2, 100k iterations)
2. **Encryption**: AES-256-GCM with random IV
3. **Authentication**: 16-byte auth tag prevents tampering
4. **Storage**: Base64-encoded (salt + IV + tag + ciphertext)

### Decryption Process

1. **Read**: Load encrypted file
2. **Parse**: Extract salt, IV, auth tag, ciphertext
3. **Derive**: Recreate encryption key from master key + salt
4. **Decrypt**: AES-256-GCM decryption
5. **Verify**: Check auth tag and public key match
6. **Return**: Keypair object (in-memory only)

## Security Features

### Encryption at Rest

- All private keys encrypted with AES-256-GCM
- Each encryption uses unique salt and IV
- Cannot be decrypted without master key

### Secure Logging

- Private keys NEVER logged
- Public keys truncated (first 8 chars only)
- No sensitive data in error messages

### Key Verification

- Public key verified on every load
- Prevents using wrong key file
- Detects tampering

### Key Rotation

```bash
# Rotate a specific agent's encryption
# (Re-encrypts with new salt/IV)
```

In code:
```typescript
import { rotateAgentKeyEncryption } from './services/keyManager';

await rotateAgentKeyEncryption(agentPubkey);
```

### Secure Deletion

```bash
# Overwrites file 3 times before deletion (DoD 5220.22-M)
```

In code:
```typescript
import { deleteAgentKeypair } from './services/keyManager';

await deleteAgentKeypair(agentPubkey);
```

## Production Deployment

### Option 1: AWS Secrets Manager (Recommended)

Instead of storing `ENCRYPTION_MASTER_KEY` in `.env`:

1. **Create Secret in AWS Secrets Manager**
   ```bash
   aws secretsmanager create-secret \
     --name agent-fun/encryption-master-key \
     --secret-string "$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")"
   ```

2. **Update Code to Fetch Secret**
   ```typescript
   // backend/src/services/keyManager.ts
   import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

   async function getMasterKey(): Promise<string> {
     const client = new SecretsManagerClient({ region: 'us-east-1' });
     const response = await client.send(
       new GetSecretValueCommand({
         SecretId: 'agent-fun/encryption-master-key'
       })
     );
     return response.SecretString!;
   }
   ```

3. **Configure IAM Permissions**
   ```json
   {
     "Effect": "Allow",
     "Action": [
       "secretsmanager:GetSecretValue"
     ],
     "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:agent-fun/encryption-master-key-*"
   }
   ```

### Option 2: AWS KMS (Alternative)

Use AWS Key Management Service for encryption:

1. **Create KMS Key**
   ```bash
   aws kms create-key --description "Agent.fun agent key encryption"
   ```

2. **Uncomment KMS Code**
   - See commented sections in `keyManager.ts` and `keyService.ts`
   - Switch to KMS-based encryption/decryption

3. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-kms
   ```

4. **Update Environment**
   ```bash
   AWS_REGION=us-east-1
   AWS_KMS_KEY_ID=arn:aws:kms:us-east-1:123456789012:key/abc123...
   ```

### Production Checklist

- [ ] Master key stored in secrets manager (not `.env`)
- [ ] `.env` files not committed to git
- [ ] File permissions set correctly (`.keys` = 0700)
- [ ] Security tests passing
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented
- [ ] Key rotation schedule defined
- [ ] Incident response plan documented

## Monitoring and Alerts

### CloudWatch Metrics (AWS)

```typescript
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

// Track key access
await cloudwatch.send(new PutMetricDataCommand({
  Namespace: 'AgentFun/Security',
  MetricData: [{
    MetricName: 'KeyAccessSuccess',
    Value: 1,
    Unit: 'Count'
  }]
}));
```

### Alert on Failures

Set up CloudWatch alarms for:
- Failed decryption attempts > 5/min
- Missing master key errors
- File permission errors
- Unusual key access patterns

## Troubleshooting

### Error: ENCRYPTION_MASTER_KEY not set

**Problem**: Master key not in environment

**Solution**:
```bash
# Add to .env file
echo "ENCRYPTION_MASTER_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> backend/.env
echo "ENCRYPTION_MASTER_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")" >> executor/.env
```

### Error: Agent keypair not found

**Problem**: Key file doesn't exist or wrong format

**Solution**:
```bash
# Check if file exists
ls backend/.keys/<agent-pubkey>.enc

# If .json file exists, migrate it
npm run migrate:keys
```

### Error: Key verification failed

**Problem**: File renamed or corrupted

**Solution**:
- Filename must match public key
- File must not be modified
- Re-create agent if key is lost

### Error: Bad decrypt

**Problem**: Wrong master key or corrupted file

**Solution**:
```bash
# Verify master key is correct
echo $ENCRYPTION_MASTER_KEY

# Test with security tests
npm run test:security
```

## Backup and Recovery

### Backup Strategy

**What to Backup**:
- Encrypted `.enc` files
- Master encryption key (separately)
- `.rotation_log.json`

**Where to Store**:
- AWS S3 with encryption
- Different region than primary
- Versioning enabled

**Backup Script**:
```bash
#!/bin/bash
# backup-keys.sh

BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
mkdir -p $BACKUP_DIR

# Backup encrypted keys
cp -r backend/.keys/*.enc $BACKUP_DIR/

# Upload to S3 (encrypted at rest)
aws s3 sync $BACKUP_DIR s3://agent-fun-backups/keys/ \
  --sse AES256 \
  --storage-class STANDARD_IA
```

### Recovery Process

1. **Restore Encrypted Keys**
   ```bash
   aws s3 sync s3://agent-fun-backups/keys/YYYYMMDD-HHMMSS/ backend/.keys/
   ```

2. **Verify Master Key**
   ```bash
   # Ensure ENCRYPTION_MASTER_KEY matches backup
   npm run verify:keys
   ```

3. **Test Decryption**
   ```bash
   npm run test:security
   ```

## Key Rotation Schedule

### When to Rotate

- **Encryption Rotation**: Every 30 days (re-encrypt with new salt/IV)
- **Master Key Rotation**: Every 90 days (need to re-encrypt all keys)
- **After Incident**: Immediately

### Automated Rotation

```typescript
// backend/src/cron/keyRotation.ts
import cron from 'node-cron';
import { getAllAgentKeys, rotateAgentKeyEncryption } from '../services/keyManager';

// Run every 30 days at 2am
cron.schedule('0 2 1 * *', async () => {
  const keys = await getAllAgentKeys();

  for (const key of keys) {
    await rotateAgentKeyEncryption(key);
  }

  console.log(`[KEY-ROTATION] Rotated ${keys.length} agent keys`);
});
```

## Support

For security issues or questions:
- Email: security@agent.fun
- Responsible Disclosure: security-reports@agent.fun

See full documentation: [SECURITY.md](./SECURITY.md)
