# 🚀 Despliegue a Mainnet - Agent.fun Production

## 📋 Checklist Completo para Mainnet

Este documento te guía paso a paso para desplegar Agent.fun en Solana mainnet de forma segura y profesional.

---

## ⚠️ REQUISITOS PREVIOS

### 1. Fondos Necesarios
- **~40 SOL**: Para desplegar 2 programas (~15-20 SOL cada uno)
- **~2 SOL**: Para fees de inicialización y testing
- **Total recomendado**: ~50 SOL en tu wallet de deployment

### 2. Herramientas Requeridas
- ✅ Rust (ya instalado)
- ⏳ Solana CLI
- ⏳ Anchor Framework
- ⏳ Git (para Vercel deployment)

### 3. Servicios Externos
- Cuenta en [Helius](https://helius.dev) o [QuickNode](https://quicknode.com) (RPC premium)
- Cuenta en [Vercel](https://vercel.com) (frontend hosting)
- Cuenta AWS (opcional pero recomendado para Secrets Manager)

---

## 📦 FASE 1: INSTALACIÓN DE HERRAMIENTAS

### Instalar Solana CLI

```powershell
# Opción 1: Con instalador oficial
# Descarga desde: https://github.com/solana-labs/solana/releases
# Busca el archivo: solana-install-init-x86_64-pc-windows-msvc.exe

# Opción 2: Con WSL2 (recomendado)
# Abre PowerShell como Admin y ejecuta:
wsl --install

# Luego dentro de WSL:
sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"

# Añade a PATH
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Verifica
solana --version
# Debería mostrar: solana-cli 1.18.17
```

### Instalar Anchor Framework

```bash
# En WSL o Git Bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Verifica
anchor --version
# Debería mostrar: anchor-cli 0.29.0
```

---

## 🔐 FASE 2: CONFIGURACIÓN DE WALLETS

### 2.1 Crear/Importar Wallet de Deployment

```bash
# Opción A: Crear nueva wallet
solana-keygen new -o ~/.config/solana/mainnet-deploy.json

# Opción B: Importar wallet existente
# Copia tu keypair JSON a ~/.config/solana/mainnet-deploy.json

# Configurar como default
solana config set --keypair ~/.config/solana/mainnet-deploy.json
```

### 2.2 Configurar Mainnet

```bash
# Configurar cluster mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Verificar configuración
solana config get

# Verificar balance
solana balance
# IMPORTANTE: Necesitas ~50 SOL antes de continuar
```

### 2.3 Crear Treasury Wallet

```bash
# Crear wallet para recibir fees de la plataforma
solana-keygen new -o ~/.config/solana/treasury.json

# Guardar la dirección
solana address -k ~/.config/solana/treasury.json
# Guarda esta dirección, la necesitarás después
```

---

## 🏗️ FASE 3: PREPARAR SMART CONTRACTS

### 3.1 Generar Program Keypairs

```bash
cd C:\Users\Usuario\Desktop\Agent.fun

# Crear directorio si no existe
mkdir -p target/deploy

# Generar keypairs para los programas
solana-keygen new -o target/deploy/agent_factory-keypair.json
solana-keygen new -o target/deploy/agent_manager-keypair.json

# Obtener las direcciones (Program IDs)
solana address -k target/deploy/agent_factory-keypair.json
solana address -k target/deploy/agent_manager-keypair.json

# GUARDA ESTOS IDs - Los necesitarás en el siguiente paso
```

### 3.2 Actualizar Anchor.toml

Edita `Anchor.toml`:

```toml
[toolchain]
anchor_version = "0.29.0"

[features]
resolution = true
skip-lint = false

[programs.mainnet]
agent_factory = "<PEGA_AQUI_FACTORY_PROGRAM_ID>"
agent_manager = "<PEGA_AQUI_MANAGER_PROGRAM_ID>"

[registry]
url = "https://api.apr.dev"

[provider]
cluster = "mainnet"
wallet = "~/.config/solana/mainnet-deploy.json"

[scripts]
test = "yarn run ts-mocha -p ./tsconfig.json -t 1000000 tests/**/*.ts"
```

### 3.3 Actualizar Program IDs en el código

**programs/agent-factory/src/lib.rs** (línea 5):
```rust
declare_id!("<PEGA_AQUI_FACTORY_PROGRAM_ID>");
```

**programs/agent-manager/src/lib.rs** (línea 5):
```rust
declare_id!("<PEGA_AQUI_MANAGER_PROGRAM_ID>");
```

### 3.4 Compilar para Producción

```bash
# Limpiar builds anteriores
anchor clean

# Build verificable (recomendado para auditoría)
anchor build --verifiable

# Esto tomará 10-15 minutos
# Los archivos .so estarán en target/deploy/
```

### 3.5 Calcular Costos de Deployment

```bash
# Ver tamaño de los programas
ls -lh target/deploy/*.so

# Calcular costo aproximado
# Fórmula: (tamaño en bytes / 1000) * 0.00000348 SOL por byte
# Típicamente: 15-20 SOL por programa
```

---

## 🚀 FASE 4: DESPLIEGUE A MAINNET

### 4.1 Pre-deployment Checks

```bash
# Verificar balance suficiente
solana balance
# Debe ser >= 50 SOL

# Verificar configuración
solana config get
# Debe mostrar mainnet-beta

# Test de conectividad
solana cluster-version
```

### 4.2 Desplegar Factory

```bash
# Desplegar agent-factory
solana program deploy \
  target/deploy/agent_factory.so \
  --keypair target/deploy/agent_factory-keypair.json \
  --program-id target/deploy/agent_factory-keypair.json

# Esto tomará 2-5 minutos
# Guarda el transaction signature que te da

# Verificar deployment
solana program show <FACTORY_PROGRAM_ID>
```

### 4.3 Desplegar Manager

```bash
# Desplegar agent-manager
solana program deploy \
  target/deploy/agent_manager.so \
  --keypair target/deploy/agent_manager-keypair.json \
  --program-id target/deploy/agent_manager-keypair.json

# Verificar deployment
solana program show <MANAGER_PROGRAM_ID>
```

### 4.4 Marcar como Immutable (Opcional pero recomendado)

```bash
# Una vez que estés 100% seguro que los programas funcionan correctamente
# puedes marcarlos como immutable para aumentar confianza

# ADVERTENCIA: Esto es IRREVERSIBLE
# No podrás actualizar los programas después

# Marcar factory como immutable
solana program set-upgrade-authority \
  <FACTORY_PROGRAM_ID> \
  --new-upgrade-authority <WALLET_ADDRESS> \
  --final

# Marcar manager como immutable
solana program set-upgrade-authority \
  <MANAGER_PROGRAM_ID> \
  --new-upgrade-authority <WALLET_ADDRESS> \
  --final
```

---

## ⚙️ FASE 5: INICIALIZAR FACTORY

### 5.1 Crear Script de Inicialización

Crea `scripts/initialize-mainnet.ts`:

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AgentFactory } from "../target/types/agent_factory";
import { PublicKey } from "@solana/web3.js";

async function main() {
  // Configurar provider para mainnet
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const factoryProgramId = new PublicKey("<FACTORY_PROGRAM_ID>");
  const idl = JSON.parse(
    require("fs").readFileSync("./target/idl/agent_factory.json", "utf8")
  );

  const program = new Program(
    idl,
    factoryProgramId,
    provider
  ) as Program<AgentFactory>;

  // Treasury wallet (la que creaste antes)
  const treasury = new PublicKey("<TREASURY_WALLET_ADDRESS>");

  // Creation fee: 0.5 SOL = 500_000_000 lamports
  const creationFee = new anchor.BN(500_000_000);

  console.log("Inicializando factory...");
  console.log("Authority:", provider.wallet.publicKey.toString());
  console.log("Treasury:", treasury.toString());
  console.log("Creation Fee:", creationFee.toString(), "lamports (0.5 SOL)");

  try {
    const tx = await program.methods
      .initialize(creationFee)
      .accounts({
        authority: provider.wallet.publicKey,
        treasury: treasury,
      })
      .rpc();

    console.log("✅ Factory inicializado!");
    console.log("Transaction:", tx);
    console.log("Explorer:", `https://solscan.io/tx/${tx}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 5.2 Ejecutar Inicialización

```bash
# Asegúrate de estar en mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Ejecutar script
ts-node scripts/initialize-mainnet.ts

# Verificar en Solscan
# https://solscan.io/tx/<TRANSACTION_SIGNATURE>
```

---

## 🔧 FASE 6: CONFIGURAR BACKEND PARA MAINNET

### 6.1 Actualizar backend/.env

```env
# Server
PORT=3001
NODE_ENV=production

# Solana Mainnet RPC (USAR RPC PREMIUM!)
# Opción 1: Helius (recomendado)
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=<TU_API_KEY>

# Opción 2: QuickNode
# RPC_ENDPOINT=https://your-endpoint.quiknode.pro/<TU_TOKEN>/

# Program IDs (los que desplegaste)
FACTORY_PROGRAM_ID=<FACTORY_PROGRAM_ID>
MANAGER_PROGRAM_ID=<MANAGER_PROGRAM_ID>

# Treasury (la wallet que creaste)
TREASURY_WALLET=<TREASURY_WALLET_ADDRESS>

# Security: Encryption Master Key
# GENERAR NUEVA KEY PARA PRODUCCIÓN
ENCRYPTION_MASTER_KEY=<GENERA_NUEVA_CON_COMANDO_ABAJO>

# AWS Secrets Manager (producción)
USE_AWS_SECRETS=true
AWS_REGION=us-east-1
AWS_SECRET_NAME=agent-fun/encryption-key

# Monitoring (opcional)
SENTRY_DSN=<TU_SENTRY_DSN>
```

### 6.2 Generar Nueva Master Key para Producción

```bash
# IMPORTANTE: Genera una nueva key para mainnet
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Guarda esta key en un lugar SEGURO
# NUNCA la compartas ni la subas a GitHub
```

### 6.3 Configurar Helius (RPC Premium)

```bash
# 1. Ve a https://helius.dev
# 2. Crea cuenta gratuita
# 3. Crea un proyecto
# 4. Copia tu API key
# 5. URL será: https://mainnet.helius-rpc.com/?api-key=<TU_KEY>

# Free tier incluye:
# - 100k requests/day
# - WebSocket support
# - Transaction parsing
# Suficiente para empezar
```

---

## 🔐 FASE 7: AWS SECRETS MANAGER (Recomendado)

### 7.1 Crear Secret en AWS

```bash
# Instalar AWS CLI si no lo tienes
# https://aws.amazon.com/cli/

# Configurar credenciales
aws configure

# Crear secret
aws secretsmanager create-secret \
  --name agent-fun/encryption-key \
  --description "Master encryption key for Agent.fun" \
  --secret-string '{"ENCRYPTION_MASTER_KEY":"<TU_MASTER_KEY>"}'

# Verificar
aws secretsmanager get-secret-value \
  --secret-id agent-fun/encryption-key
```

### 7.2 Configurar IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": "arn:aws:secretsmanager:us-east-1:*:secret:agent-fun/encryption-key-*"
    }
  ]
}
```

---

## 🌐 FASE 8: CONFIGURAR FRONTEND PARA MAINNET

### 8.1 Actualizar frontend/.env.local

```env
# Mainnet RPC (puedes usar público o Helius)
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com

# Backend API (cuando despliegues a producción)
NEXT_PUBLIC_BACKEND_API=https://api.agent.fun/api

# Network
NEXT_PUBLIC_NETWORK=mainnet-beta

# Program IDs
NEXT_PUBLIC_FACTORY_PROGRAM_ID=<FACTORY_PROGRAM_ID>
NEXT_PUBLIC_MANAGER_PROGRAM_ID=<MANAGER_PROGRAM_ID>
```

### 8.2 Build para Producción

```bash
cd frontend

# Instalar dependencias
npm install

# Build optimizado
npm run build

# Test localmente
npm run start
# Abre http://localhost:3000
```

---

## 🚀 FASE 9: DESPLEGAR A VERCEL

### 9.1 Preparar para Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# En la carpeta frontend
cd frontend

# Deploy
vercel --prod

# Sigue las instrucciones:
# - Set up project: Yes
# - Project name: agent-fun
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

### 9.2 Configurar Variables de Entorno en Vercel

```bash
# Opción A: Via CLI
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production
vercel env add NEXT_PUBLIC_BACKEND_API production
vercel env add NEXT_PUBLIC_NETWORK production

# Opción B: Via Dashboard
# 1. Ve a https://vercel.com/dashboard
# 2. Selecciona tu proyecto
# 3. Settings > Environment Variables
# 4. Añade cada variable
```

### 9.3 Configurar Dominio Personalizado

```bash
# En Vercel Dashboard:
# 1. Settings > Domains
# 2. Add: agent.fun
# 3. Configura DNS según instrucciones
# 4. Espera propagación (~10 minutos)
```

---

## 🧪 FASE 10: TESTING EN MAINNET

### 10.1 Test Backend

```bash
# Start backend localmente apuntando a mainnet
cd backend
npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Debería retornar:
# {
#   "status": "ok",
#   "network": "mainnet-beta",
#   "blockHeight": <número>
# }
```

### 10.2 Test Frontend

```bash
# Abre tu frontend (Vercel o local)
https://agent.fun

# Test checklist:
# ✅ Página carga sin errores
# ✅ Wallet connect funciona
# ✅ Balance se muestra correctamente
# ✅ Network badge muestra "mainnet"
```

### 10.3 Test End-to-End: Crear Agente

```bash
# ⚠️ ESTO COSTARÁ 0.5 SOL REAL

# 1. Conecta wallet en frontend
# 2. Ve a "Create Agent"
# 3. Llena formulario:
#    - Name: TestAgent
#    - Symbol: TEST
#    - Mission: "Test agent for mainnet verification"
# 4. Click "Launch Agent"
# 5. Confirma transacción en Phantom
# 6. Espera confirmación (~400ms)
# 7. Verifica en Solscan
```

### 10.4 Verificar en Blockchain

```bash
# Ver programas desplegados
solana program show <FACTORY_PROGRAM_ID>
solana program show <MANAGER_PROGRAM_ID>

# Ver factory state
solana account <FACTORY_STATE_PDA>

# Ver agente creado
solana account <AGENT_STATE_PDA>
```

---

## 📊 FASE 11: MONITORING Y MANTENIMIENTO

### 11.1 Setup Sentry (Error Tracking)

```bash
# 1. Crea cuenta en https://sentry.io
# 2. Crea proyecto Node.js
# 3. Obtén DSN

# Instala en backend
cd backend
npm install @sentry/node

# Añade a backend/src/index.ts (al inicio)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
});
```

### 11.2 Setup Logs

```bash
# Usar PM2 para logs en producción
npm install -g pm2

# Start con PM2
cd backend
pm2 start npm --name "agent-fun-backend" -- start

# Ver logs
pm2 logs agent-fun-backend

# Monitorear
pm2 monit
```

### 11.3 Alertas de Balance

Crea script `scripts/check-balances.ts`:

```typescript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const connection = new Connection(process.env.RPC_ENDPOINT!);
const treasury = new PublicKey(process.env.TREASURY_WALLET!);

async function checkBalances() {
  const balance = await connection.getBalance(treasury);
  const solBalance = balance / LAMPORTS_PER_SOL;

  console.log(`Treasury balance: ${solBalance} SOL`);

  // Alerta si balance bajo
  if (solBalance < 5) {
    console.warn("⚠️ WARNING: Treasury balance below 5 SOL");
    // Enviar email/Slack notification aquí
  }
}

setInterval(checkBalances, 60000); // Cada minuto
```

---

## ✅ CHECKLIST FINAL PRE-LAUNCH

### Smart Contracts
- [ ] Programas compilados sin warnings
- [ ] Programas desplegados a mainnet
- [ ] Program IDs verificados en Solscan
- [ ] Factory inicializado correctamente
- [ ] Test de creación de agente exitoso

### Backend
- [ ] RPC premium configurado (Helius/QuickNode)
- [ ] Variables de entorno actualizadas
- [ ] Master key en AWS Secrets Manager
- [ ] Health endpoint retorna OK
- [ ] Logs funcionando
- [ ] Error tracking (Sentry) configurado

### Frontend
- [ ] Build de producción exitoso
- [ ] Desplegado a Vercel
- [ ] Variables de entorno configuradas
- [ ] Dominio personalizado funcionando
- [ ] Wallet connect funciona
- [ ] Mainnet badge visible

### Executor
- [ ] Gemini API key configurada
- [ ] Cron job funcionando
- [ ] Jupiter integration testeada
- [ ] Key encryption verificada

### Security
- [ ] Master key nunca en código
- [ ] AWS Secrets Manager activo
- [ ] Rate limiting implementado
- [ ] CORS configurado correctamente
- [ ] HTTPS en todo

### Monitoring
- [ ] Sentry configurado
- [ ] Logs centralizados
- [ ] Alertas de balance
- [ ] Uptime monitoring

---

## 💰 COSTOS ESTIMADOS

### One-time (Deployment)
- Smart contracts deployment: ~40 SOL ($4,000 @ $100/SOL)
- Testing en mainnet: ~2 SOL ($200)
- **Total one-time**: ~42 SOL ($4,200)

### Monthly
- Helius Pro (optional): $50/mes
- Vercel Pro: $20/mes
- AWS Secrets Manager: $1/mes
- Domain (agent.fun): $12/año
- **Total mensual**: ~$71

### Revenue
- 0.5 SOL por agente creado
- 1% de cada trade ejecutado
- **Break-even**: ~84 agentes creados

---

## 🚨 TROUBLESHOOTING COMÚN

### Error: "Insufficient funds"
```bash
# Verifica balance
solana balance

# Necesitas ~50 SOL para deployment completo
```

### Error: "Transaction simulation failed"
```bash
# Verifica que estés en mainnet
solana config get

# Verifica RPC funciona
solana cluster-version
```

### Error: "Program deployment failed"
```bash
# Limpia y re-compila
anchor clean
anchor build

# Verifica tamaño del programa
ls -lh target/deploy/*.so

# Si > 1MB, optimiza código Rust
```

### Frontend no conecta a backend
```bash
# Verifica CORS en backend
# Añade tu dominio a la whitelist

# En backend/src/index.ts:
app.use(cors({
  origin: ['https://agent.fun', 'https://www.agent.fun']
}));
```

---

## 📚 RECURSOS

- [Solana Docs](https://docs.solana.com)
- [Anchor Book](https://book.anchor-lang.com)
- [Helius Docs](https://docs.helius.dev)
- [Vercel Docs](https://vercel.com/docs)
- [Agent.fun Discord](#) (crear comunidad)

---

## 🎉 LAUNCH CHECKLIST

### Pre-Launch (1 semana antes)
- [ ] Todo testeado en mainnet
- [ ] Security audit considerado
- [ ] Legal terms & conditions
- [ ] Privacy policy
- [ ] Discord/Twitter setup
- [ ] Landing page finalizada

### Launch Day
- [ ] Último test completo
- [ ] Monitoring activo
- [ ] Team on standby
- [ ] Anuncio en Twitter
- [ ] Post en Discord
- [ ] Monitor logs constantemente

### Post-Launch (primera semana)
- [ ] Monitorear uso y bugs
- [ ] Responder feedback
- [ ] Fix bugs críticos
- [ ] Optimizar gas/fees
- [ ] Añadir features solicitadas

---

**¡Éxito con el launch! 🚀**

Si tienes dudas en cualquier paso, documenta el error y lo resolvemos juntos.
