# AGENT.FUN - Guía de Desarrollo

## Visión General
Plataforma para lanzar agentes de IA autónomos en Solana que pueden operar de forma independiente en el trading de memecoins. Optimizada para Solana Mobile (Saga).

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (dApp)                        │
│              Next.js + TypeScript + Tailwind                │
│           Mobile-First UI con Wallet Adapter                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├──────────────────┐
                       │                  │
                       ▼                  ▼
         ┌─────────────────────┐  ┌──────────────────────┐
         │   BACKEND (API)     │  │  SOLANA BLOCKCHAIN   │
         │ Node.js/TypeScript  │  │   Programs (Rust)    │
         │   Express/Fastify   │  │                      │
         └──────────┬──────────┘  │  - AgentFactory      │
                    │             │  - AgentManager      │
                    │             └──────────────────────┘
                    ▼
         ┌─────────────────────┐
         │   AI EXECUTOR       │
         │  (Worker/Cron Job)  │
         │  OpenAI + Jupiter   │
         └─────────────────────┘
```

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Lenguaje**: TypeScript
- **UI**: Tailwind CSS
- **Conexión Solana**:
  - `@solana/web3.js` (v1.87+)
  - `@solana/wallet-adapter-react`
  - `@solana/wallet-adapter-mobile`
  - `@coral-xyz/anchor` (v0.29+)

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express/Fastify
- **Lenguaje**: TypeScript
- **Database**: PostgreSQL (opcional para MVP)
- **Secrets Manager**: AWS KMS / HashiCorp Vault

### On-Chain Programs
- **Lenguaje**: Rust
- **Framework**: Anchor 0.29+
- **Dependencias**:
  - `anchor-lang`
  - `anchor-spl`

### AI & Trading
- **IA**: Google Gemini Pro (FREE API)
- **DEX Aggregator**: Jupiter API v6
- **Cron Jobs**: Node-cron / AWS EventBridge

---

## Fase 1: Programas On-Chain (Día 1-2)

### Programa 1: AgentFactory

**Ubicación**: `programs/agent-factory/src/lib.rs`

#### Propósito
Fábrica para crear nuevos agentes de IA. Cobra tarifas y coordina la creación.

#### Cuentas
```rust
#[account]
pub struct FactoryState {
    pub authority: Pubkey,           // Admin de AGENT.FUN
    pub treasury: Pubkey,            // Cuenta que recibe las tarifas
    pub creation_fee: u64,           // 0.5 SOL en lamports
    pub total_agents_created: u64,
    pub bump: u8,
}
```

#### Instrucciones

##### 1. `initialize`
```rust
pub fn initialize(
    ctx: Context<Initialize>,
    creation_fee: u64,
) -> Result<()>
```
- Inicializa el estado de la fábrica
- Solo puede ser llamado una vez
- Define la tarifa de creación (0.5 SOL)

##### 2. `create_agent`
```rust
pub fn create_agent(
    ctx: Context<CreateAgent>,
    name: String,              // Max 32 chars
    symbol: String,            // Max 10 chars
    purpose: String,           // Max 200 chars
    agent_wallet: Pubkey,      // Wallet autónoma (generada en backend)
) -> Result<()>
```

**Flujo**:
1. Cobra 0.5 SOL del creator
2. Transfiere a treasury
3. Crea token mint (SPL Token)
4. Mintea suministro inicial al creator (1M tokens)
5. Crea cuenta AgentState vía CPI a AgentManager
6. Emite evento `AgentCreated`

**Validaciones**:
- name, symbol, purpose no vacíos
- creator tiene suficiente SOL
- agent_wallet no es default pubkey

---

### Programa 2: AgentManager

**Ubicación**: `programs/agent-manager/src/lib.rs`

#### Propósito
Gestiona el ciclo de vida, fondos y operaciones de cada agente.

#### Cuentas

##### AgentState (PDA)
```rust
#[account]
pub struct AgentState {
    pub authority: Pubkey,        // Creador del agente
    pub agent_wallet: Pubkey,     // Wallet autónoma que ejecuta
    pub token_mint: Pubkey,       // Token asociado al agente
    pub vault: Pubkey,            // PDA que guarda fondos
    pub name: String,
    pub purpose: String,
    pub state: AgentStatus,       // Active, Paused
    pub total_trades: u64,
    pub total_volume: u64,        // En lamports
    pub revenue_pool: u64,        // Ganancias para holders
    pub bump: u8,
    pub vault_bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AgentStatus {
    Active,
    Paused,
}
```

#### Instrucciones

##### 1. `initialize_agent`
```rust
pub fn initialize_agent(
    ctx: Context<InitializeAgent>,
    name: String,
    purpose: String,
    agent_wallet: Pubkey,
) -> Result<()>
```
- Llamado por AgentFactory vía CPI
- Crea la cuenta AgentState
- Inicializa el vault (PDA)

##### 2. `deposit_funds`
```rust
pub fn deposit_funds(
    ctx: Context<DepositFunds>,
    amount: u64,
) -> Result<()>
```
- Permite a cualquiera depositar SOL al vault
- Transfiere de user a vault PDA

##### 3. `execute_trade`
```rust
pub fn execute_trade(
    ctx: Context<ExecuteTrade>,
    from_mint: Pubkey,
    to_mint: Pubkey,
    amount: u64,
    min_output: u64,
) -> Result<()>
```

**Restricciones críticas**:
- Solo puede ser llamado por `agent_wallet` (firma requerida)
- Agente debe estar en estado Active

**Flujo**:
1. Valida que caller = agent_wallet
2. Ejecuta swap via CPI a Jupiter
3. Calcula comisión (1% de ganancia)
4. Actualiza estadísticas (total_trades, total_volume)
5. Emite evento `TradeExecuted`

##### 4. `claim_revenue_share`
```rust
pub fn claim_revenue_share(
    ctx: Context<ClaimRevenue>,
) -> Result<()>
```
- Token holders pueden reclamar su proporción del revenue_pool
- Calcula: `user_share = (user_tokens / total_supply) * revenue_pool`

##### 5. `update_purpose`
```rust
pub fn update_purpose(
    ctx: Context<UpdatePurpose>,
    new_purpose: String,
) -> Result<()>
```
- Solo authority puede llamar
- Actualiza la directiva del agente

##### 6. `pause_agent` / `resume_agent`
```rust
pub fn pause_agent(ctx: Context<PauseAgent>) -> Result<()>
pub fn resume_agent(ctx: Context<ResumeAgent>) -> Result<()>
```
- Control de emergencia para el authority

---

## Fase 2: Backend API (Día 3)

### Ubicación
`backend/src/`

### Endpoints

#### POST `/api/agent/create`
```typescript
interface CreateAgentRequest {
  name: string;
  symbol: string;
  purpose: string;
  creatorWallet: string; // PublicKey
}

interface CreateAgentResponse {
  agentPubkey: string;
  agentWallet: string;    // Wallet autónoma (pública)
  tokenMint: string;
  transaction: string;     // Serialized transaction
}
```

**Flujo**:
1. Validar inputs
2. Generar nueva keypair para agent_wallet
3. **Guardar clave privada en AWS KMS** (crítico)
4. Construir transaction llamando `AgentFactory::create_agent`
5. Firma parcial (si necesario)
6. Devolver transaction para firma del usuario
7. Guardar metadata en DB (opcional)

#### GET `/api/agent/:pubkey`
```typescript
interface AgentDetailsResponse {
  pubkey: string;
  name: string;
  purpose: string;
  tokenMint: string;
  vaultBalance: number;
  totalTrades: number;
  totalVolume: number;
  status: 'Active' | 'Paused';
  recentTrades: Trade[];
}
```

**Flujo**:
1. Fetch account data con `connection.getAccountInfo`
2. Decode con Anchor IDL
3. Fetch historial con `connection.getSignaturesForAddress`
4. Parse y devolver

#### POST `/api/agent/:pubkey/deposit`
```typescript
interface DepositRequest {
  amount: number;
  userWallet: string;
}
```

**Flujo**:
1. Construir transaction llamando `AgentManager::deposit_funds`
2. Devolver para firma del usuario

---

## Fase 3: AI Executor (Día 3)

### Ubicación
`executor/src/worker.ts`

### Arquitectura del Worker

```typescript
// Cron job: cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  await executeAgentCycle();
});

async function executeAgentCycle() {
  // 1. Obtener todos los agentes activos
  const agents = await fetchActiveAgents();

  for (const agent of agents) {
    try {
      // 2. Leer estado on-chain
      const agentState = await fetchAgentState(agent.pubkey);

      // 3. Obtener datos de mercado
      const marketData = await fetchMarketSentiment();

      // 4. Consultar a la IA
      const decision = await queryAI(agentState, marketData);

      // 5. Ejecutar decisión si es válida
      if (decision.action === 'SWAP') {
        await executeSwap(agent, decision);
      }

    } catch (error) {
      console.error(`Error processing agent ${agent.pubkey}:`, error);
      // Continuar con el siguiente agente
    }
  }
}
```

### Integración Google Gemini (FREE!)

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function queryAI(
  agentState: AgentState,
  marketData: MarketData
): Promise<AIDecision> {
  const prompt = `
You are an autonomous AI trading agent on Solana.

**Your Mission**: ${agentState.purpose}

**Current Portfolio**:
- SOL Balance: ${agentState.vaultBalance / LAMPORTS_PER_SOL}
- Total Trades: ${agentState.totalTrades}
- Total Volume: $${agentState.totalVolume}

**Market Data**:
${JSON.stringify(marketData, null, 2)}

**Instructions**:
Analyze the market and decide the best trade to maximize profit.
Consider risk, volatility, and your mission.

Respond ONLY with valid JSON:
{
  "action": "SWAP" | "HOLD",
  "fromToken": "SOL",
  "toToken": "WIF",
  "amount": "0.5",
  "reasoning": "Brief explanation"
}
`;

  // Use Gemini Pro (free tier)
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Clean markdown if present
  let jsonText = text.trim();
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  }

  return JSON.parse(jsonText);
}
```

**Get FREE Gemini API Key**: https://makersuite.google.com/app/apikey
- No credit card required
- Generous free tier (60 requests/minute)
- Perfect for MVP development

### Integración Jupiter

```typescript
async function executeSwap(
  agent: Agent,
  decision: AIDecision
) {
  // 1. Obtener ruta de Jupiter
  const quoteResponse = await fetch(
    `https://quote-api.jup.ag/v6/quote?` +
    `inputMint=${decision.fromToken}&` +
    `outputMint=${decision.toToken}&` +
    `amount=${decision.amount}&` +
    `slippageBps=50`
  );
  const quote = await quoteResponse.json();

  // 2. Construir transaction
  const swapTransaction = await buildJupiterSwap(quote);

  // 3. Construir instruction para execute_trade
  const executeTradeIx = await program.methods
    .executeTrade(
      decision.fromToken,
      decision.toToken,
      new BN(decision.amount),
      new BN(quote.outAmount)
    )
    .accounts({
      agentState: agent.pubkey,
      agentWallet: agent.wallet,
      vault: agent.vault,
      // ... remaining accounts
    })
    .instruction();

  // 4. Combinar instructions
  const transaction = new Transaction().add(
    executeTradeIx,
    ...swapTransaction.instructions
  );

  // 5. Firmar con la clave privada del agente (desde KMS)
  const agentKeypair = await retrieveAgentKeypair(agent.wallet);
  transaction.sign(agentKeypair);

  // 6. Enviar
  const signature = await connection.sendRawTransaction(
    transaction.serialize()
  );

  await connection.confirmTransaction(signature);

  console.log(`Trade executed for agent ${agent.pubkey}: ${signature}`);
}
```

---

## Fase 4: Frontend (Día 4-5)

### Ubicación
`frontend/src/`

### Estructura de Páginas

```
app/
├── page.tsx              # Landing page
├── create/
│   └── page.tsx          # Formulario de creación
├── agent/
│   └── [pubkey]/
│       └── page.tsx      # Dashboard del agente
└── layout.tsx            # Wallet provider setup
```

### Componentes Clave

#### 1. WalletProvider Setup

```typescript
// app/layout.tsx
'use client';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { useMemo } from 'react';

export default function RootLayout({ children }) {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = process.env.NEXT_PUBLIC_RPC_ENDPOINT;

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

#### 2. Formulario de Creación

```typescript
// app/create/page.tsx
'use client';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState } from 'react';

export default function CreateAgent() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    purpose: '',
  });

  const handleCreate = async () => {
    if (!publicKey) return;

    // 1. Llamar al backend para obtener la transaction
    const response = await fetch('/api/agent/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        creatorWallet: publicKey.toString(),
      }),
    });

    const { transaction, agentPubkey } = await response.json();

    // 2. Deserializar y enviar
    const tx = Transaction.from(Buffer.from(transaction, 'base64'));
    const signature = await sendTransaction(tx, connection);

    // 3. Confirmar
    await connection.confirmTransaction(signature);

    // 4. Redirigir al dashboard del agente
    router.push(`/agent/${agentPubkey}`);
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Launch Your AI Agent</h1>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Agent Name"
          className="w-full p-3 border rounded"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />

        <input
          type="text"
          placeholder="Token Symbol (e.g. AGENT)"
          className="w-full p-3 border rounded"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
        />

        <textarea
          placeholder="What is your agent's mission?"
          className="w-full p-3 border rounded h-32"
          value={formData.purpose}
          onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
        />

        <button
          onClick={handleCreate}
          className="w-full bg-purple-600 text-white p-4 rounded-lg font-bold"
        >
          Launch Agent (0.5 SOL)
        </button>
      </div>
    </div>
  );
}
```

#### 3. Dashboard del Agente

```typescript
// app/agent/[pubkey]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useConnection } from '@solana/wallet-adapter-react';

export default function AgentDashboard() {
  const { pubkey } = useParams();
  const { connection } = useConnection();
  const [agent, setAgent] = useState(null);
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    fetchAgentData();
  }, [pubkey]);

  const fetchAgentData = async () => {
    // Fetch desde el backend
    const response = await fetch(`/api/agent/${pubkey}`);
    const data = await response.json();
    setAgent(data);
    setTrades(data.recentTrades);
  };

  if (!agent) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{agent.name}</h1>
        <p className="text-gray-600 mt-2">{agent.purpose}</p>
        <span className={`inline-block mt-2 px-3 py-1 rounded ${
          agent.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
        }`}>
          {agent.status}
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Vault Balance" value={`${agent.vaultBalance} SOL`} />
        <StatCard label="Total Trades" value={agent.totalTrades} />
        <StatCard label="Total Volume" value={`$${agent.totalVolume}`} />
        <StatCard label="Token Mint" value={shortenAddress(agent.tokenMint)} />
      </div>

      {/* Deposit Section */}
      <DepositCard agentPubkey={pubkey} />

      {/* Trade History */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Trades</h2>
        <div className="space-y-2">
          {trades.map((trade, idx) => (
            <TradeCard key={idx} trade={trade} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Fase 5: Testing & Deployment (Día 6-7)

### Testing Local

```bash
# Terminal 1: Iniciar validador local
solana-test-validator

# Terminal 2: Desplegar programas
anchor build
anchor deploy

# Terminal 3: Backend
cd backend
npm run dev

# Terminal 4: Frontend
cd frontend
npm run dev

# Terminal 5: Executor (para testing)
cd executor
npm run dev
```

### Tests de Integración

```typescript
// tests/integration.test.ts
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { expect } from 'chai';

describe('AGENT.FUN Integration', () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const factoryProgram = anchor.workspace.AgentFactory;
  const managerProgram = anchor.workspace.AgentManager;

  it('Crea un agente exitosamente', async () => {
    const creator = provider.wallet;
    const agentWallet = anchor.web3.Keypair.generate();

    const tx = await factoryProgram.methods
      .createAgent(
        'TestAgent',
        'TEST',
        'Trade memecoins aggressively',
        agentWallet.publicKey
      )
      .accounts({
        creator: creator.publicKey,
        // ... more accounts
      })
      .rpc();

    // Verificar que el agente fue creado
    const [agentPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from('agent'), agentWallet.publicKey.toBuffer()],
      managerProgram.programId
    );

    const agentState = await managerProgram.account.agentState.fetch(agentPda);
    expect(agentState.name).to.equal('TestAgent');
    expect(agentState.state).to.deep.equal({ active: {} });
  });

  it('Deposita fondos al agente', async () => {
    // ... test de depósito
  });

  it('Ejecuta un trade', async () => {
    // ... test de trade
  });
});
```

### Despliegue a Devnet

```bash
# 1. Configurar Devnet
solana config set --url devnet

# 2. Airdrop para testing
solana airdrop 2

# 3. Build y deploy
anchor build
anchor deploy --provider.cluster devnet

# 4. Actualizar IDs en frontend/backend
# Copiar Program IDs desde Anchor.toml
```

### Despliegue a Mainnet

```bash
# 1. Generar keypairs para programas
solana-keygen new -o target/deploy/agent_factory-keypair.json
solana-keygen new -o target/deploy/agent_manager-keypair.json

# 2. Actualizar Anchor.toml con las nuevas addresses

# 3. Build optimizado
anchor build --verifiable

# 4. Calcular costo de deploy
solana program deploy --dry-run target/deploy/agent_factory.so

# 5. Fondear wallet de deploy
# Necesitarás ~15-20 SOL por programa

# 6. Deploy
anchor deploy --provider.cluster mainnet

# 7. Verificar en Solana Explorer
```

---

## Seguridad Crítica

### 1. Gestión de Claves Privadas

**Nunca almacenes claves privadas en texto plano.**

Opciones recomendadas:
- **AWS KMS**: Encryption/Decryption de claves
- **HashiCorp Vault**: Gestión centralizada
- **Azure Key Vault**: Para Azure

Ejemplo con AWS KMS:
```typescript
import { KMSClient, EncryptCommand, DecryptCommand } from '@aws-sdk/client-kms';

async function encryptAgentKey(privateKeyBytes: Uint8Array): Promise<string> {
  const client = new KMSClient({ region: 'us-east-1' });
  const command = new EncryptCommand({
    KeyId: process.env.KMS_KEY_ID,
    Plaintext: privateKeyBytes,
  });
  const response = await client.send(command);
  return Buffer.from(response.CiphertextBlob).toString('base64');
}

async function decryptAgentKey(encryptedKey: string): Promise<Keypair> {
  const client = new KMSClient({ region: 'us-east-1' });
  const command = new DecryptCommand({
    CiphertextBlob: Buffer.from(encryptedKey, 'base64'),
  });
  const response = await client.send(command);
  return Keypair.fromSecretKey(response.Plaintext);
}
```

### 2. Validaciones On-Chain

```rust
// En execute_trade
require!(
    ctx.accounts.signer.key() == agent_state.agent_wallet,
    ErrorCode::UnauthorizedAgent
);

require!(
    agent_state.state == AgentStatus::Active,
    ErrorCode::AgentNotActive
);

require!(
    amount <= vault_balance,
    ErrorCode::InsufficientFunds
);
```

### 3. Rate Limiting en Backend

```typescript
import rateLimit from 'express-rate-limit';

const createAgentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requests por ventana
  message: 'Too many agents created, please try again later.',
});

app.post('/api/agent/create', createAgentLimiter, async (req, res) => {
  // ...
});
```

### 4. Slippage Protection

```rust
// En execute_trade
let actual_output = swap_result.amount_out;
require!(
    actual_output >= min_output,
    ErrorCode::SlippageExceeded
);
```

---

## Monetización

### 1. Tarifa de Creación (Implementado)
- 0.5 SOL por agente
- Cobrado en `AgentFactory::create_agent`
- Transferido a treasury

### 2. Comisión por Trade (1%)
```rust
// En execute_trade, después del swap
let profit = output_amount.saturating_sub(input_amount);
let commission = profit.checked_div(100).unwrap(); // 1%

// Transferir comisión a treasury
transfer_from_vault_to_treasury(commission)?;

// El resto va al revenue_pool
agent_state.revenue_pool += profit - commission;
```

### 3. Suscripciones Premium (Post-MVP)

Backend:
```typescript
// Stripe webhook
app.post('/webhook/stripe', async (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    // Marcar usuario como premium
    await db.users.update({
      wallet: session.metadata.wallet,
      isPremium: true,
      premiumUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }
});
```

Features premium:
- Mayor frecuencia de ejecución (cada 1 min vs 5 min)
- Acceso a modelos IA avanzados (GPT-4 Turbo)
- Analytics detallados
- Límites más altos de fondos

---

## Optimizaciones para Solana Mobile

### 1. UI Mobile-First

```css
/* Tailwind config */
module.exports = {
  theme: {
    extend: {
      screens: {
        'saga': '720px', // Solana Saga screen width
      },
    },
  },
}
```

### 2. Mobile Wallet Adapter

```typescript
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol';

const signAndSendTransaction = async (transaction: Transaction) => {
  return await transact(async (wallet) => {
    const authResult = await wallet.authorize({
      cluster: 'mainnet-beta',
      identity: { name: 'AGENT.FUN' },
    });

    const signedTx = await wallet.signAndSendTransactions({
      transactions: [transaction],
    });

    return signedTx[0];
  });
};
```

### 3. PWA Configuration

```json
// manifest.json
{
  "name": "AGENT.FUN",
  "short_name": "AGENT.FUN",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#9945FF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 4. Publicar en Solana dApp Store

```bash
# Usar el Solana dApp Publisher
npx @solana-mobile/dapp-publisher publish \
  --url https://agent.fun \
  --icon ./public/icon.png \
  --name "AGENT.FUN" \
  --description "Launch autonomous AI agents on Solana"
```

---

## Roadmap Post-MVP

### V1.1 - Gobernanza
- Token holders pueden votar en cambios de purpose
- Implementar program `governance` con proposals

### V1.2 - Estrategias Avanzadas
- Múltiples estrategias por agente (scalping, holding, arbitrage)
- Backtesting de estrategias

### V1.3 - Social Features
- Leaderboard de agentes por rendimiento
- Copy trading de agentes exitosos
- Comentarios y ratings

### V2.0 - Multi-Chain
- Expansión a otras cadenas (Ethereum L2s)
- Bridge automático de fondos

---

## Métricas de Éxito

### Técnicas
- Uptime del executor: >99%
- Latencia de ejecución: <30s desde decisión hasta confirmación
- Success rate de trades: >95%

### Negocio
- Objetivo Mes 1: 100 agentes creados
- Objetivo Mes 3: 1,000 agentes activos
- Objetivo Mes 6: $100k en comisiones acumuladas

---

## Recursos y Referencias

### Documentación
- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Jupiter API Docs](https://docs.jup.ag/)
- [Solana Mobile Docs](https://docs.solanamobile.com/)

### Ejemplos de Código
- [Anchor Examples](https://github.com/coral-xyz/anchor/tree/master/examples)
- [Solana Program Library](https://github.com/solana-labs/solana-program-library)

### Herramientas
- [Solana Explorer](https://explorer.solana.com/)
- [Anchor Verifier](https://www.apr.dev/)
- [Solana FM](https://solana.fm/) - Better explorer

---

## Contacto y Soporte

Para dudas durante el desarrollo:
1. Revisa esta guía primero
2. Consulta la documentación oficial
3. Busca en Discord de Anchor/Solana
4. Plantea preguntas específicas con contexto

---

**¡Vamos a construir el futuro de los agentes de IA autónomos en Solana!** 🚀
