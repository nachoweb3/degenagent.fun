# Ejemplos Prácticos - Sistema de Seguridad de Claves

Este documento contiene ejemplos prácticos de uso del sistema de gestión segura de claves.

---

## 1. Setup Inicial

### Generar Master Key

```bash
# Generar una clave segura de 32 bytes
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output**:
```
10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

### Configurar Variables de Entorno

**backend/.env**:
```bash
PORT=3001
RPC_ENDPOINT=https://api.devnet.solana.com
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez

# CRITICAL: Master encryption key
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

**executor/.env**:
```bash
RPC_ENDPOINT=https://api.devnet.solana.com
GEMINI_API_KEY=your-gemini-api-key
BACKEND_API_URL=http://localhost:3001/api
EXECUTION_INTERVAL_MINUTES=5
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111

# CRITICAL: Must match backend's key
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
```

### Verificar Setup

```bash
cd backend
npm run test:security
```

**Expected Output**:
```
========================================
🔒 AGENT PRIVATE KEY SECURITY TEST SUITE
========================================

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

---

## 2. Uso en Código

### Backend: Guardar una Clave Nueva

```typescript
// backend/src/controllers/agentController.ts
import { Keypair } from '@solana/web3.js';
import { saveAgentKeypair } from '../services/keyManager';

async function createAgent(req, res) {
  try {
    // Generar nuevo keypair para el agente
    const agentKeypair = Keypair.generate();
    const agentPubkey = agentKeypair.publicKey.toBase58();

    // Guardar de forma segura (encriptada)
    await saveAgentKeypair(agentPubkey, agentKeypair.secretKey);

    // Logs seguros - NO exponen la clave privada
    console.log(`Agent created with pubkey: ${agentPubkey}`);

    res.json({
      success: true,
      agentPubkey: agentPubkey
    });

  } catch (error) {
    console.error('Error creating agent:', error.message);
    res.status(500).json({ error: 'Failed to create agent' });
  }
}
```

**Log Output** (seguro):
```
[KEY-SAVE] Agent keypair encrypted and saved (wallet: 46hYFV39...)
[KEY-SAVE] Encryption: AES-256-GCM with PBKDF2 key derivation
Agent created with pubkey: 46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
```

### Executor: Cargar y Usar una Clave

```typescript
// executor/src/executor.ts
import { Connection, Transaction } from '@solana/web3.js';
import { getAgentKeypair } from './services/keyService';

async function executeAgentTrade(agentWallet: string) {
  try {
    // Cargar keypair de forma segura (desencriptada solo en memoria)
    const agentKeypair = await getAgentKeypair(agentWallet);

    // Crear transacción
    const connection = new Connection(process.env.RPC_ENDPOINT);
    const transaction = new Transaction().add(
      // ... instrucciones de la transacción
    );

    // Firmar con la clave del agente
    transaction.sign(agentKeypair);

    // Enviar transacción
    const signature = await connection.sendTransaction(transaction, [agentKeypair]);

    console.log(`Trade executed: ${signature}`);

    // La clave se limpia de memoria automáticamente cuando
    // agentKeypair sale del scope

  } catch (error) {
    // Error seguro - NO expone la clave
    console.error(`Failed to execute trade for agent: ${error.message}`);
  }
}
```

**Log Output** (seguro):
```
[KEY-ACCESS] Agent keypair loaded successfully (wallet: 46hYFV39...)
Trade executed: 5xKz8...
```

---

## 3. Migración de Claves Antiguas

### Escenario: Migrar de .json a .enc

**Antes** (inseguro):
```bash
$ ls backend/.keys/
46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez.json
7dEnaBxFG3h9YQHHjV8sxVr4kPJ6TQwM5vRzM3zb8Rfa.json
9KkuSYxqbZY7TYqJ3mS4FvJqM5NWP2hB6J9vX7bC8Hwe.json
```

**Ejecutar Migración**:
```bash
cd backend
npm run migrate:keys
```

**Output**:
```
========================================
🔐 AGENT KEY MIGRATION SCRIPT
========================================

✓ ENCRYPTION_MASTER_KEY is configured
✓ Keys directory: C:\Users\Usuario\Desktop\Agent.fun\backend\.keys

Found 3 unencrypted key(s) to migrate:

Migrating: 46hYFV39...
  ✓ Encrypted and saved as 46hYFV39....enc

Migrating: 7dEnaBxF...
  ✓ Encrypted and saved as 7dEnaBxF....enc

Migrating: 9KkuSYxq...
  ✓ Encrypted and saved as 9KkuSYxq....enc

========================================
MIGRATION SUMMARY
========================================

Total Keys: 3
Successful: 3 ✓
Failed: 0 ✗

⚠️  Old .json files are still present.
   Run with --delete-old flag to remove them after verifying migration.
```

**Verificar**:
```bash
npm run verify:keys
```

**Output**:
```
========================================
🔍 VERIFYING MIGRATED KEYS
========================================

Verifying 3 encrypted key(s):

Verifying: 46hYFV39...
  ✓ File is properly encrypted

Verifying: 7dEnaBxF...
  ✓ File is properly encrypted

Verifying: 9KkuSYxq...
  ✓ File is properly encrypted

🎉 All encrypted keys verified successfully!
```

**Después** (seguro):
```bash
$ ls backend/.keys/
46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez.enc  # ✅ Encrypted
46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez.json # ⚠️  Old (still present)
7dEnaBxFG3h9YQHHjV8sxVr4kPJ6TQwM5vRzM3zb8Rfa.enc  # ✅ Encrypted
7dEnaBxFG3h9YQHHjV8sxVr4kPJ6TQwM5vRzM3zb8Rfa.json # ⚠️  Old
9KkuSYxqbZY7TYqJ3mS4FvJqM5NWP2hB6J9vX7bC8Hwe.enc  # ✅ Encrypted
9KkuSYxqbZY7TYqJ3mS4FvJqM5NWP2hB6J9vX7bC8Hwe.json # ⚠️  Old
```

**Borrar Antiguas** (después de verificar):
```bash
npm run migrate:keys -- --delete-old
```

**Output**:
```
Migrating: 46hYFV39...
  ✓ Encrypted and saved as 46hYFV39....enc
  ✓ Deleted old unencrypted file

Migrating: 7dEnaBxF...
  ✓ Encrypted and saved as 7dEnaBxF....enc
  ✓ Deleted old unencrypted file

Migrating: 9KkuSYxq...
  ✓ Encrypted and saved as 9KkuSYxq....enc
  ✓ Deleted old unencrypted file

🎉 All keys migrated successfully!
```

---

## 4. Rotación de Claves

### Rotar Encriptación de un Agente

```typescript
// backend/src/scripts/rotateAgentKey.ts
import { rotateAgentKeyEncryption } from './services/keyManager';

async function rotateAgent(agentPubkey: string) {
  try {
    console.log(`Rotating encryption for agent: ${agentPubkey.slice(0, 8)}...`);

    // Re-encripta con nuevo salt/IV
    await rotateAgentKeyEncryption(agentPubkey);

    console.log('✓ Rotation complete');

  } catch (error) {
    console.error('✗ Rotation failed:', error.message);
  }
}

// Ejemplo de uso
rotateAgent('46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez');
```

**Output**:
```
Rotating encryption for agent: 46hYFV39...
[KEY-RETRIEVE] Agent keypair decrypted successfully (wallet: 46hYFV39...)
[KEY-SAVE] Agent keypair encrypted and saved (wallet: 46hYFV39...)
[KEY-ROTATION] Successfully rotated encryption for agent (wallet: 46hYFV39...)
✓ Rotation complete
```

**Rotation Log** (`backend/.keys/.rotation_log.json`):
```json
{
  "46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez": {
    "lastRotation": "2025-01-15T14:30:00.000Z",
    "rotationCount": 1,
    "keyVersion": 2
  }
}
```

### Rotación Automática (Cron)

```typescript
// backend/src/cron/keyRotation.ts
import cron from 'node-cron';
import { getAllAgentKeys, rotateAgentKeyEncryption } from '../services/keyManager';

// Ejecutar cada 30 días a las 2am
cron.schedule('0 2 1 * *', async () => {
  console.log('[CRON] Starting monthly key rotation...');

  try {
    const agentKeys = await getAllAgentKeys();

    for (const agentPubkey of agentKeys) {
      try {
        await rotateAgentKeyEncryption(agentPubkey);
        console.log(`[CRON] Rotated: ${agentPubkey.slice(0, 8)}...`);
      } catch (error) {
        console.error(`[CRON] Failed to rotate ${agentPubkey.slice(0, 8)}...: ${error.message}`);
      }
    }

    console.log(`[CRON] Key rotation complete. Rotated ${agentKeys.length} keys.`);

  } catch (error) {
    console.error('[CRON] Key rotation failed:', error.message);
  }
});
```

---

## 5. Eliminación Segura

### Eliminar Clave de Agente

```typescript
// backend/src/controllers/agentController.ts
import { deleteAgentKeypair } from '../services/keyManager';

async function deleteAgent(agentPubkey: string) {
  try {
    // Verificar que el agente no tiene fondos
    // ... lógica de verificación

    // Eliminar de forma segura (3 sobrescrituras)
    await deleteAgentKeypair(agentPubkey);

    console.log(`Agent deleted: ${agentPubkey.slice(0, 8)}...`);

  } catch (error) {
    console.error(`Failed to delete agent: ${error.message}`);
  }
}
```

**Output**:
```
[KEY-DELETE] Agent keypair securely deleted (wallet: 46hYFV39...)
Agent deleted: 46hYFV39...
```

**Proceso interno**:
1. Lee tamaño del archivo
2. Sobrescribe con datos random (pass 1)
3. Sobrescribe con datos random (pass 2)
4. Sobrescribe con datos random (pass 3)
5. Elimina archivo

---

## 6. Manejo de Errores

### Error: Master Key No Configurada

```typescript
import { getAgentKeypair } from './services/keyService';

try {
  const keypair = await getAgentKeypair('46hYFV39...');
} catch (error) {
  console.error(error.message);
}
```

**Output** (sin master key):
```
[KEY-ACCESS-ERROR] Failed to load agent keypair (wallet: 46hYFV39...): ENCRYPTION_MASTER_KEY not set in environment. Keys cannot be decrypted.
Error: Encryption configuration error
```

### Error: Archivo No Encontrado

```typescript
try {
  const keypair = await getAgentKeypair('NonExistentWallet123...');
} catch (error) {
  console.error(error.message);
}
```

**Output**:
```
[KEY-ACCESS-ERROR] Failed to load agent keypair (wallet: NonExist...): ENOENT: no such file or directory
Error: Agent keypair not found or decryption failed
```

### Error: Public Key Mismatch

```typescript
// Intentar usar archivo de otro agente
try {
  // Archivo se llama 'AgentA.enc' pero internamente es clave de AgentB
  const keypair = await getAgentKeypair('AgentA...');
} catch (error) {
  console.error(error.message);
}
```

**Output**:
```
[KEY-ACCESS-ERROR] Failed to load agent keypair (wallet: AgentA...): Key verification failed: public key mismatch
Error: Agent keypair not found or decryption failed
```

---

## 7. Validación y Debugging

### Validar Setup de Encriptación

```typescript
// backend/src/index.ts
import { validateEncryptionSetup } from './services/keyManager';

async function startServer() {
  // Validar antes de iniciar
  const isValid = await validateEncryptionSetup();

  if (!isValid) {
    console.error('❌ Encryption setup is invalid!');
    console.error('   Check ENCRYPTION_MASTER_KEY in .env');
    process.exit(1);
  }

  console.log('✅ Encryption setup validated');

  // ... resto del código de inicio
}
```

**Output** (válido):
```
[ENCRYPTION-VALIDATION] Encryption system validated successfully
✅ Encryption setup validated
```

**Output** (inválido):
```
[ENCRYPTION-VALIDATION-ERROR] Setup validation failed: ENCRYPTION_MASTER_KEY not set in environment
❌ Encryption setup is invalid!
   Check ENCRYPTION_MASTER_KEY in .env
```

### Verificar Archivo Encriptado

```bash
# Ver contenido de archivo encriptado (debe ser gibberish)
cat backend/.keys/46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez.enc
```

**Output** (correcto):
```
YmFzZTY0LWVuY29kZWQtZ2liYmVyaXNo...
(Base64 gibberish, no JSON legible)
```

**Output** (incorrecto - NO ENCRIPTADO):
```
[64, 123, 45, 78, ...]  # ❌ JSON array visible
```

### Listar Todas las Claves

```typescript
import { getAllAgentKeys } from './services/keyManager';

async function listAgents() {
  const agents = await getAllAgentKeys();
  console.log(`Found ${agents.length} agents:`);
  agents.forEach(pubkey => {
    console.log(`  - ${pubkey.slice(0, 8)}...`);
  });
}
```

**Output**:
```
[KEY-LIST] Found 3 encrypted agent keys
Found 3 agents:
  - 46hYFV39...
  - 7dEnaBxF...
  - 9KkuSYxq...
```

---

## 8. Producción: AWS Secrets Manager

### Setup AWS Secrets Manager

```bash
# 1. Generar master key
MASTER_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 2. Crear secret en AWS
aws secretsmanager create-secret \
  --name agent-fun/encryption-master-key \
  --secret-string "$MASTER_KEY" \
  --description "Master encryption key for agent private keys"

# 3. Obtener ARN
aws secretsmanager describe-secret \
  --secret-id agent-fun/encryption-master-key \
  --query 'ARN' --output text
```

### Actualizar Código

```typescript
// backend/src/services/keyManager.ts
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({ region: 'us-east-1' });

async function getMasterKey(): Promise<string> {
  // En desarrollo, usar .env
  if (process.env.NODE_ENV === 'development') {
    return process.env.ENCRYPTION_MASTER_KEY!;
  }

  // En producción, usar Secrets Manager
  try {
    const response = await secretsClient.send(
      new GetSecretValueCommand({
        SecretId: 'agent-fun/encryption-master-key'
      })
    );

    return response.SecretString!;

  } catch (error) {
    console.error('[SECRETS-MANAGER-ERROR] Failed to retrieve master key');
    throw new Error('Failed to retrieve encryption key from Secrets Manager');
  }
}
```

### Configurar IAM Role

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:agent-fun/encryption-master-key-*"
    }
  ]
}
```

---

## 9. Monitoreo y Alerting

### CloudWatch Metrics

```typescript
// backend/src/services/keyManager.ts
import { CloudWatchClient, PutMetricDataCommand } from '@aws-sdk/client-cloudwatch';

const cloudwatch = new CloudWatchClient({ region: 'us-east-1' });

async function trackKeyAccess(success: boolean, agentPubkey: string) {
  try {
    await cloudwatch.send(new PutMetricDataCommand({
      Namespace: 'AgentFun/Security',
      MetricData: [
        {
          MetricName: success ? 'KeyAccessSuccess' : 'KeyAccessFailure',
          Value: 1,
          Unit: 'Count',
          Dimensions: [
            {
              Name: 'Agent',
              Value: agentPubkey.slice(0, 8)
            }
          ]
        }
      ]
    }));
  } catch (error) {
    // No fallar si CloudWatch falla
    console.warn('[CLOUDWATCH] Failed to send metric');
  }
}
```

### Alert en Fallos

```bash
# Crear alarma en CloudWatch
aws cloudwatch put-metric-alarm \
  --alarm-name agent-fun-key-access-failures \
  --alarm-description "Alert on multiple key access failures" \
  --metric-name KeyAccessFailure \
  --namespace AgentFun/Security \
  --statistic Sum \
  --period 300 \
  --threshold 5 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 1 \
  --alarm-actions arn:aws:sns:us-east-1:123456789012:security-alerts
```

---

## 10. Backup y Recuperación

### Backup de Claves Encriptadas

```bash
#!/bin/bash
# backup-keys.sh

BACKUP_DIR="backups/$(date +%Y%m%d-%H%M%S)"
KEYS_DIR="backend/.keys"
S3_BUCKET="s3://agent-fun-backups/keys/"

echo "Creating backup..."

# Crear directorio de backup
mkdir -p $BACKUP_DIR

# Copiar claves encriptadas
cp $KEYS_DIR/*.enc $BACKUP_DIR/
cp $KEYS_DIR/.rotation_log.json $BACKUP_DIR/

echo "✓ Files copied to $BACKUP_DIR"

# Subir a S3 con encriptación
aws s3 sync $BACKUP_DIR $S3_BUCKET \
  --sse AES256 \
  --storage-class STANDARD_IA

echo "✓ Uploaded to S3"
echo "Backup complete!"
```

### Restaurar desde Backup

```bash
#!/bin/bash
# restore-keys.sh

BACKUP_DATE=$1
S3_BUCKET="s3://agent-fun-backups/keys/"
KEYS_DIR="backend/.keys"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: ./restore-keys.sh YYYYMMDD-HHMMSS"
  exit 1
fi

echo "Restoring from backup: $BACKUP_DATE"

# Descargar desde S3
aws s3 sync ${S3_BUCKET}${BACKUP_DATE}/ $KEYS_DIR/

echo "✓ Files restored to $KEYS_DIR"

# Verificar
cd backend
npm run verify:keys
```

---

## Conclusión

Estos ejemplos muestran cómo usar el sistema de gestión segura de claves en diferentes escenarios:

- ✅ Setup inicial
- ✅ Uso diario en código
- ✅ Migración de claves antiguas
- ✅ Rotación de encriptación
- ✅ Eliminación segura
- ✅ Manejo de errores
- ✅ Validación y debugging
- ✅ Deployment a producción
- ✅ Monitoreo y alerting
- ✅ Backup y recuperación

Para más información, consulta:
- [SECURITY_SETUP.md](./SECURITY_SETUP.md) - Guía de configuración
- [SECURITY.md](./SECURITY.md) - Documentación técnica completa
