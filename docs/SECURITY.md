# Security Documentation - Agent Private Key Management

## Overview

This document describes the security measures implemented for managing agent private keys in the AGENT.FUN platform.

## Encryption Architecture

### Current Implementation: Local AES-256-GCM Encryption

For the MVP, we use **AES-256-GCM** (Galois/Counter Mode) encryption with PBKDF2 key derivation for secure local storage of agent private keys.

#### Security Features

1. **AES-256-GCM Encryption**
   - 256-bit key length (military-grade encryption)
   - Authenticated encryption with AEAD (Authenticated Encryption with Associated Data)
   - Protects against both tampering and unauthorized access

2. **PBKDF2 Key Derivation**
   - 100,000 iterations of SHA-256
   - Random 32-byte salt per encryption
   - Derives encryption key from master password
   - Resistant to brute-force and rainbow table attacks

3. **Random IV (Initialization Vector)**
   - 16-byte random IV per encryption
   - Ensures different ciphertext even for identical plaintext

4. **Authentication Tag**
   - 16-byte authentication tag
   - Verifies data integrity and authenticity
   - Prevents tampering and modification

### Encrypted File Format

Each encrypted key file (`.enc`) contains:

```
[32 bytes: Salt] + [16 bytes: IV] + [16 bytes: Auth Tag] + [Variable: Encrypted Data]
```

All stored as base64-encoded string.

## Key Storage

### Directory Structure

```
backend/
  .keys/                      # Encrypted private keys directory
    <agent-pubkey>.enc        # Encrypted private key file
    .rotation_log.json        # Key rotation tracking
```

### File Permissions

- `.keys/` directory: `0700` (owner read/write/execute only)
- Key files: `0600` (owner read/write only)
- Not accessible via web server or API

## Access Control

### Who Can Access Keys?

Only the **Executor** service can decrypt and use agent private keys:

- Backend API cannot decrypt keys (unless explicitly needed)
- Frontend has no access to keys
- Keys never transmitted over network
- Keys only decrypted in-memory when needed for transactions

### Environment Variables

Master encryption key stored in environment variable:

```bash
ENCRYPTION_MASTER_KEY=<64-character-hex-string>
```

**Critical Requirements:**
- Must be at least 32 characters long
- Should be 64 hex characters (32 bytes)
- Must be identical in backend and executor `.env` files
- Never commit to version control (`.env` is in `.gitignore`)

### Production Recommendations

In production, store the master key in:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Cloud Secret Manager

## Secure Logging

All logging follows these rules:

### What Gets Logged

- Key access events (without key material)
- Encryption/decryption operations (success/failure)
- Key rotation events
- Validation results

### What NEVER Gets Logged

- Private keys (plaintext or encrypted)
- Master encryption key
- Full wallet addresses (only first 8 characters)
- Decrypted key material
- Salt, IV, or auth tags

### Log Format

```
[KEY-ACCESS] Agent keypair loaded successfully (wallet: 46hYFV39...)
[KEY-SAVE] Agent keypair encrypted and saved (wallet: 46hYFV39...)
[KEY-RETRIEVE-ERROR] Failed to retrieve agent keypair (wallet: 46hYFV39...): <generic error>
```

## Key Lifecycle

### 1. Key Generation and Storage

```typescript
// Generate new keypair
const keypair = Keypair.generate();

// Encrypt and save (backend/keyManager.ts)
await saveAgentKeypair(
  keypair.publicKey.toBase58(),
  keypair.secretKey
);
```

Process:
1. Generate random salt and IV
2. Derive encryption key from master key using PBKDF2
3. Encrypt private key with AES-256-GCM
4. Write encrypted data to `.enc` file
5. Verify decryption works
6. Log success (without key material)

### 2. Key Retrieval

```typescript
// Decrypt and load (executor/keyService.ts)
const keypair = await getAgentKeypair(agentWallet);
```

Process:
1. Read encrypted file
2. Extract salt, IV, auth tag, and ciphertext
3. Derive decryption key using PBKDF2
4. Decrypt and verify auth tag
5. Create Keypair object
6. Verify public key matches
7. Return keypair (in-memory only)

### 3. Key Rotation

```typescript
// Re-encrypt with new salt/IV
await rotateAgentKeyEncryption(agentPubkey);
```

Process:
1. Decrypt existing key
2. Re-encrypt with new random salt and IV
3. Overwrite old encrypted file
4. Update rotation log
5. Log rotation event

Rotation log tracks:
- Last rotation timestamp
- Rotation count
- Key version number

### 4. Key Deletion

```typescript
// Secure deletion with overwriting
await deleteAgentKeypair(agentPubkey);
```

Process (DoD 5220.22-M standard):
1. Read file size
2. Overwrite with random data (3 passes)
3. Delete file
4. Log deletion event

## Security Best Practices

### For MVP/Development

1. **Generate Strong Master Key**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. **Set Environment Variables**
   - Add `ENCRYPTION_MASTER_KEY` to both backend and executor `.env`
   - Ensure `.env` is in `.gitignore`

3. **Validate Encryption Setup**
   ```typescript
   const isValid = await validateEncryptionSetup();
   if (!isValid) {
     throw new Error('Encryption system not configured correctly');
   }
   ```

4. **Restrict File Permissions**
   ```bash
   chmod 700 backend/.keys
   chmod 600 backend/.keys/*.enc
   ```

### For Production

1. **Use AWS KMS or Similar**
   - Replace local encryption with AWS KMS
   - Code template provided in comments
   - Centralized key management
   - Automatic key rotation
   - Audit logging built-in

2. **Store Master Key Securely**
   - Use AWS Secrets Manager
   - Enable automatic rotation
   - Set up access policies
   - Enable CloudTrail logging

3. **Implement Key Rotation Schedule**
   - Rotate encryption monthly
   - Automate with cron job
   - Monitor rotation logs

4. **Enable Monitoring and Alerts**
   - Log all key access to CloudWatch/Splunk
   - Alert on failed decryption attempts
   - Alert on unusual access patterns
   - Monitor key file modifications

5. **Network Security**
   - Never expose `.keys` directory via web server
   - Use VPC for executor service
   - Restrict network access to key storage
   - Use encrypted connections only

6. **Backup Strategy**
   - Encrypted backups only
   - Store backups in separate region
   - Test backup restoration regularly
   - Maintain backup encryption keys separately

## AWS KMS Alternative

For production, AWS KMS provides additional benefits:

```typescript
// See commented code in keyManager.ts and keyService.ts
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

const kmsClient = new KMSClient({ region: process.env.AWS_REGION });
```

### KMS Benefits

- No master key management needed
- Automatic key rotation
- Centralized access control
- Built-in audit logging (CloudTrail)
- FIPS 140-2 Level 2 validated
- Envelope encryption
- Pay-per-use pricing

### KMS Setup

1. Create KMS key in AWS Console
2. Set key policy for executor IAM role
3. Update `.env` with KMS key ID
4. Uncomment KMS code in keyManager.ts
5. Install AWS SDK: `npm install @aws-sdk/client-kms`

## Testing Security

### Validate Encryption

```bash
# Backend
cd backend
npm run dev

# Check logs for:
# [ENCRYPTION-VALIDATION] Encryption system validated successfully
```

### Verify Keys Are Encrypted

```bash
# Try to read a key file
cat backend/.keys/<agent-pubkey>.enc

# Should see base64-encoded gibberish, not readable JSON
```

### Test Key Access

```bash
# Remove ENCRYPTION_MASTER_KEY from .env temporarily
# Start executor - should fail with clear error message

# Restore ENCRYPTION_MASTER_KEY
# Should work normally
```

## Threat Model

### Threats Mitigated

1. **File System Access**
   - Keys encrypted at rest
   - Cannot be used without master key

2. **Memory Dumps**
   - Keys only in memory briefly
   - No long-term storage in memory

3. **Log Leakage**
   - Keys never logged
   - Only partial addresses logged

4. **Backup Exposure**
   - Backups contain encrypted keys
   - Useless without master key

5. **Insider Threats**
   - Access logging
   - Rotation capability
   - Separation of duties

### Residual Risks

1. **Master Key Compromise**
   - If ENCRYPTION_MASTER_KEY is exposed, all keys compromised
   - Mitigation: Use AWS Secrets Manager in production

2. **Memory Access**
   - Keys briefly in executor process memory
   - Mitigation: Use secure enclaves (AWS Nitro) in production

3. **Side-Channel Attacks**
   - Timing attacks on decryption
   - Mitigation: Constant-time operations where possible

## Compliance

This implementation addresses common compliance requirements:

- **PCI DSS**: Encryption at rest, key management
- **GDPR**: Data protection by design
- **SOC 2**: Logical access controls, encryption
- **ISO 27001**: Cryptographic controls

## Incident Response

If master key or private keys are compromised:

1. **Immediate Actions**
   - Rotate ENCRYPTION_MASTER_KEY immediately
   - Re-encrypt all keys with new master key
   - Review access logs for unauthorized access
   - Notify affected agents/users

2. **Investigation**
   - Identify compromise vector
   - Determine scope of exposure
   - Document timeline

3. **Remediation**
   - Patch vulnerability
   - Generate new agent keypairs if needed
   - Update security procedures
   - Conduct post-mortem

## Contact

For security concerns or questions:
- Email: security@agent.fun
- Responsible Disclosure: security-reports@agent.fun

## Changelog

- **2025-01-XX**: Initial implementation with AES-256-GCM encryption
- **Future**: Migration to AWS KMS for production

---

**Remember: Security is a continuous process, not a one-time implementation.**
