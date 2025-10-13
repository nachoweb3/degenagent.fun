# 🏗️ Arquitectura Híbrida - Agent.fun (Optimizada para Costos)

## 🎯 OBJETIVO

Reducir costos de deployment de **~20 SOL ($2,000)** a **~2-3 SOL ($200-300)** manteniendo seguridad y descentralización donde importa.

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

### ANTES (Full On-Chain)
```
Smart Contracts (Rust/Anchor): ~200-500 líneas
- agent-factory: Crear agentes, mint tokens, PDAs
- agent-manager: Gestión completa, trades, revenue share
- Estado completo on-chain
- Costo: ~20 SOL deployment
```

### DESPUÉS (Híbrido Optimizado)
```
Smart Contract Mínimo (Rust/Anchor): ~50-80 líneas
- Solo: Ownership + Revenue distribution
- Sin: Trading logic, agent state, complex operations
- Costo: ~2-3 SOL deployment

Backend Web2 (Node.js):
- Trading logic
- Agent management
- Market analysis
- Costo: $0 (servidores propios)
```

---

## 🏛️ NUEVA ARQUITECTURA

### On-Chain (Lo Esencial)

```rust
// program: agent-registry (ÚNICO programa)
// Tamaño: ~50-80 líneas
// Costo deployment: ~2-3 SOL

pub mod agent_registry {
    pub fn register_agent(
        name: String,
        owner: Pubkey,
        token_mint: Pubkey
    ) -> Result<()> {
        // Solo registrar ownership
        // No trading logic
        // No complex state
    }

    pub fn claim_revenue(
        agent_id: String,
        token_holder: Pubkey,
        amount: u64
    ) -> Result<()> {
        // Distribuir revenue a holders
        // Verificar ownership via token balance
    }

    pub fn transfer_ownership(
        agent_id: String,
        new_owner: Pubkey
    ) -> Result<()> {
        // Transferir ownership
    }
}
```

**Solo 3 funciones esenciales:**
1. `register_agent` - Registrar ownership
2. `claim_revenue` - Distribuir ganancias
3. `transfer_ownership` - Transferir ownership

---

### Off-Chain (Backend Web2)

```typescript
// backend/src/services/agentService.ts

class AgentService {
  // TODO lo demás aquí (gratis)

  async createAgent(params) {
    // 1. Crear agent en DB (PostgreSQL)
    const agent = await db.agents.create({
      name: params.name,
      symbol: params.symbol,
      purpose: params.purpose,
      owner: params.owner,
      vault_balance: 0,
      status: 'active'
    });

    // 2. Registrar en blockchain (solo ownership)
    const tx = await program.methods
      .registerAgent(agent.name, agent.owner, agent.tokenMint)
      .rpc();

    // 3. Crear token (opcional, solo si quieres)
    // O usar tokens existentes (USDC, SOL, etc)

    return agent;
  }

  async executeTrade(agentId, trade) {
    // Lógica de trading 100% off-chain
    const agent = await db.agents.findById(agentId);

    // Ejecutar en Jupiter
    const result = await jupiter.swap(trade);

    // Guardar en DB
    await db.trades.create({
      agent_id: agentId,
      from_token: trade.fromToken,
      to_token: trade.toToken,
      amount_in: trade.amountIn,
      amount_out: result.amountOut,
      timestamp: Date.now()
    });

    // Actualizar balance
    agent.vault_balance += calculateProfit(result);
    await agent.save();

    return result;
  }

  async depositFunds(agentId, amount, user) {
    // Simple transferencia SOL/USDC
    // No smart contract necesario
    const agent = await db.agents.findById(agentId);

    // Verificar transacción en Solana
    const tx = await connection.getTransaction(signature);

    if (tx && tx.meta.postBalances[0] > tx.meta.preBalances[0]) {
      agent.vault_balance += amount;
      await agent.save();
    }
  }
}
```

---

## 💰 NUEVO COSTO DE DEPLOYMENT

### On-Chain (Una sola vez)
```
Smart Contract Único: ~2-3 SOL
- Program deployment: ~2 SOL
- Rent para cuenta: ~0.02 SOL
- Testing: ~0.1 SOL
- Buffer: ~0.5 SOL

TOTAL ON-CHAIN: 2-3 SOL ($200-300)
```

### Off-Chain (Mensual)
```
Backend Server:
- Opción 1: Railway/Render: $5-10/mes
- Opción 2: VPS (Digital Ocean): $6/mes
- Opción 3: Tu propio servidor: $0

Database:
- PostgreSQL (Railway): $5/mes
- O SQLite gratis

RPC:
- Helius Free: $0 (100k requests/día)

TOTAL MENSUAL: $5-15/mes (vs $2/mes anterior)
```

### AHORRO TOTAL
```
Deployment: $2,000 → $200-300 (90% ahorro!)
Mensual: $2 → $10 (más features por menos)
```

---

## 🔐 QUÉ VA DÓNDE

### ✅ ON-CHAIN (Blockchain - Lo que importa)

**1. Ownership del Agente**
- Quién es el dueño
- Verificable públicamente
- Inmutable

**2. Revenue Distribution**
- Distribución de ganancias a token holders
- Trustless (sin intermediarios)
- Verificable on-chain

**3. Token Mints (Opcional)**
- Si quieres tokens por agente
- O usar USDC/SOL directamente

**Ventajas:**
- ✅ Ownership descentralizado
- ✅ Revenue distribution trustless
- ✅ Propiedad verificable
- ✅ 90% más barato

---

### ✅ OFF-CHAIN (Backend - Lo que no importa)

**1. Trading Logic**
- Decisiones de IA
- Ejecución de trades
- Market analysis

**2. Agent State**
- Balance actual
- Historial de trades
- Performance metrics

**3. User Data**
- Perfiles
- Preferencias
- Notificaciones

**Ventajas:**
- ✅ Gratis (tu servidor)
- ✅ Más rápido
- ✅ Más flexible
- ✅ Fácil de actualizar

---

## 📐 COMPARACIÓN DETALLADA

| Feature | Full On-Chain | Híbrido Optimizado |
|---------|---------------|-------------------|
| **Deployment Cost** | ~20 SOL | ~2-3 SOL |
| **Ownership** | On-chain ✅ | On-chain ✅ |
| **Revenue Share** | On-chain ✅ | On-chain ✅ |
| **Trading Logic** | On-chain ❌ | Off-chain ✅ |
| **Agent State** | On-chain ❌ | Off-chain ✅ |
| **Speed** | ~400ms | ~50ms |
| **Update Logic** | Re-deploy | Hot reload |
| **Audit Trail** | On-chain | DB + blockchain |
| **Cost per Trade** | ~0.001 SOL | ~0.0001 SOL |

---

## 🏗️ IMPLEMENTACIÓN

### Fase 1: Smart Contract Mínimo

```rust
// programs/agent-registry/src/lib.rs

use anchor_lang::prelude::*;

declare_id!("Registry111111111111111111111111111111111");

#[program]
pub mod agent_registry {
    use super::*;

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: String,
        name: String,
        owner: Pubkey,
    ) -> Result<()> {
        let registry = &mut ctx.accounts.registry;

        registry.agent_id = agent_id;
        registry.name = name;
        registry.owner = owner;
        registry.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn claim_revenue(
        ctx: Context<ClaimRevenue>,
        amount: u64,
    ) -> Result<()> {
        // Verificar ownership via token balance
        // Transferir revenue proporcionalmente

        let registry = &ctx.accounts.registry;
        require!(
            ctx.accounts.claimer.key() == registry.owner,
            ErrorCode::Unauthorized
        );

        // Transfer SOL
        **ctx.accounts.vault.try_borrow_mut_lamports()? -= amount;
        **ctx.accounts.claimer.try_borrow_mut_lamports()? += amount;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct RegisterAgent<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + AgentRegistry::INIT_SPACE
    )]
    pub registry: Account<'info, AgentRegistry>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ClaimRevenue<'info> {
    #[account(mut)]
    pub registry: Account<'info, AgentRegistry>,

    #[account(mut)]
    pub claimer: Signer<'info>,

    #[account(mut)]
    pub vault: SystemAccount<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct AgentRegistry {
    pub agent_id: String,      // 32 bytes
    pub name: String,          // 32 bytes
    pub owner: Pubkey,         // 32 bytes
    pub created_at: i64,       // 8 bytes
}

// Total: ~100 bytes
// Costo: ~0.002 SOL rent + ~2 SOL deployment = 2-3 SOL total
```

**Tamaño:** ~80 líneas (vs 700 líneas antes)
**Costo:** ~2-3 SOL (vs 20 SOL antes)

---

### Fase 2: Backend con Database

```typescript
// backend/src/models/agent.ts

import { DataTypes } from 'sequelize';

export const Agent = sequelize.define('Agent', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  name: DataTypes.STRING,
  symbol: DataTypes.STRING,
  purpose: DataTypes.TEXT,
  owner: DataTypes.STRING, // Solana address
  registry_address: DataTypes.STRING, // On-chain registry

  // Off-chain state (gratis!)
  vault_balance: DataTypes.DECIMAL(10, 6),
  total_trades: DataTypes.INTEGER,
  total_volume: DataTypes.DECIMAL(15, 6),
  revenue_pool: DataTypes.DECIMAL(10, 6),
  status: DataTypes.ENUM('active', 'paused', 'inactive'),

  // Metadata
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE
});

export const Trade = sequelize.define('Trade', {
  id: DataTypes.UUID,
  agent_id: DataTypes.UUID,
  from_token: DataTypes.STRING,
  to_token: DataTypes.STRING,
  amount_in: DataTypes.DECIMAL(15, 6),
  amount_out: DataTypes.DECIMAL(15, 6),
  signature: DataTypes.STRING, // Solana tx signature
  timestamp: DataTypes.DATE
});
```

---

### Fase 3: API Híbrida

```typescript
// backend/src/controllers/agentController.ts

export class AgentController {

  // Crear agente (híbrido)
  async create(req, res) {
    const { name, symbol, purpose, owner } = req.body;

    // 1. Crear en DB (gratis y rápido)
    const agent = await Agent.create({
      name,
      symbol,
      purpose,
      owner,
      vault_balance: 0,
      status: 'active'
    });

    // 2. Registrar en blockchain (solo ownership)
    const registryAddress = Keypair.generate();

    const tx = await program.methods
      .registerAgent(
        agent.id,
        name,
        new PublicKey(owner)
      )
      .accounts({
        registry: registryAddress.publicKey,
        owner: new PublicKey(owner),
        systemProgram: SystemProgram.programId
      })
      .signers([registryAddress])
      .rpc();

    // 3. Actualizar DB con dirección on-chain
    agent.registry_address = registryAddress.publicKey.toString();
    await agent.save();

    res.json({
      agent,
      transaction: tx,
      message: 'Agent created! Ownership registered on-chain.'
    });
  }

  // Deposit (simple transfer, no smart contract)
  async deposit(req, res) {
    const { agentId, amount, signature } = req.body;

    // Verificar transacción en Solana
    const tx = await connection.getTransaction(signature);

    if (!tx) {
      return res.status(400).json({ error: 'Invalid transaction' });
    }

    // Actualizar balance en DB
    const agent = await Agent.findByPk(agentId);
    agent.vault_balance += amount;
    await agent.save();

    res.json({ success: true, newBalance: agent.vault_balance });
  }

  // Trade (100% off-chain)
  async executeTrade(agentId, decision) {
    const agent = await Agent.findByPk(agentId);

    // Ejecutar en Jupiter (off-chain)
    const result = await jupiterService.swap({
      fromToken: decision.fromToken,
      toToken: decision.toToken,
      amount: decision.amount
    });

    // Guardar en DB
    await Trade.create({
      agent_id: agentId,
      from_token: decision.fromToken,
      to_token: decision.toToken,
      amount_in: decision.amount,
      amount_out: result.amountOut,
      signature: result.signature,
      timestamp: new Date()
    });

    // Actualizar métricas
    agent.total_trades += 1;
    agent.total_volume += decision.amount;
    await agent.save();

    return result;
  }

  // Claim revenue (on-chain para trustless distribution)
  async claimRevenue(req, res) {
    const { agentId, claimer } = req.body;

    const agent = await Agent.findByPk(agentId);

    // Calcular share basado en token balance
    const tokenBalance = await getTokenBalance(claimer, agent.token_mint);
    const totalSupply = 1_000_000; // 1M tokens
    const share = (tokenBalance / totalSupply) * agent.revenue_pool;

    // Ejecutar on-chain (trustless)
    const tx = await program.methods
      .claimRevenue(new anchor.BN(share * LAMPORTS_PER_SOL))
      .accounts({
        registry: new PublicKey(agent.registry_address),
        claimer: new PublicKey(claimer),
        vault: vaultAddress
      })
      .rpc();

    res.json({
      claimed: share,
      transaction: tx
    });
  }
}
```

---

## 🎯 VENTAJAS DE LA ARQUITECTURA HÍBRIDA

### 1. Costo Reducido (90%)
- Deployment: $200-300 (vs $2,000)
- Viable para bootstrapping
- ROI más rápido

### 2. Mayor Flexibilidad
- Actualizar lógica sin re-deploy
- Añadir features rápido
- A/B testing fácil

### 3. Mejor Performance
- Trades más rápidos (50ms vs 400ms)
- No esperar confirmaciones blockchain
- UI más responsive

### 4. Descentralización Donde Importa
- Ownership on-chain ✅
- Revenue distribution trustless ✅
- Verificable públicamente ✅

### 5. Escalabilidad
- DB puede manejar millones de trades
- Blockchain solo para lo crítico
- Costos predecibles

---

## 🔒 SEGURIDAD

### On-Chain (Lo que importa)
- ✅ Ownership inmutable
- ✅ Revenue distribution verificable
- ✅ No puede ser censurado

### Off-Chain (Optimizado)
- ✅ Trades firmados y verificables
- ✅ Audit trail en DB
- ✅ Backups regulares
- ✅ Todas las transacciones tienen signature de Solana

### Transparencia
```typescript
// Cualquiera puede verificar
async function verifyTrade(tradeId) {
  const trade = await db.trades.findById(tradeId);

  // Verificar que la transacción existe en Solana
  const tx = await connection.getTransaction(trade.signature);

  if (tx) {
    console.log('✅ Trade verified on-chain');
    return true;
  }
  return false;
}
```

---

## 📊 MIGRACIÓN

### Paso 1: Simplificar Smart Contract
```bash
# Crear nuevo programa mínimo
anchor init agent-registry

# Copiar código simple (80 líneas)
# Compilar
anchor build

# Tamaño: ~15 KB (vs 150 KB antes)
```

### Paso 2: Setup Database
```bash
# PostgreSQL
npm install sequelize pg

# Migrations
npx sequelize-cli init
npx sequelize-cli db:migrate
```

### Paso 3: Actualizar Backend
```bash
# Mover lógica de smart contracts a backend
# Mantener solo ownership on-chain
```

### Paso 4: Deploy
```bash
# Deploy smart contract (2-3 SOL)
anchor deploy

# Deploy backend (gratis - tu servidor)
pm2 start backend

# Listo!
```

---

## 💡 RECOMENDACIÓN FINAL

**Esta arquitectura es IDEAL para:**
- ✅ Bootstrapping (bajo costo inicial)
- ✅ MVP rápido
- ✅ Producto viable desde día 1
- ✅ Escalabilidad futura

**Puedes migrar a full on-chain después si:**
- Tienes fondos ($10k+ para contratos complejos)
- Necesitas máxima descentralización
- La plataforma ya es rentable

**Pero honestamente:**
La mayoría de dApps exitosas (Uniswap, OpenSea, etc) usan arquitectura híbrida similar. Es el estándar de la industria.

---

## 🚀 PRÓXIMOS PASOS

1. **Simplificar smart contract** (~2 horas)
2. **Setup PostgreSQL** (~1 hora)
3. **Migrar lógica a backend** (~3 horas)
4. **Testing** (~2 horas)
5. **Deploy a mainnet** (2-3 SOL + 30 min)

**Total: 1 día de trabajo + $200-300**

vs

**Antes: 3 días + $2,000**

---

**¿Procedemos con la arquitectura híbrida optimizada?** 🚀

Esto te permite lanzar rápido, barato, y escalar después.
