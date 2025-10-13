# 👨‍💻 Developer Guide - Agent.fun Platform

**Build on top of Agent.fun's AI Trading Infrastructure**

---

## 📖 Table of Contents

1. [Introduction](#introduction)
2. [Platform Architecture](#platform-architecture)
3. [API Reference](#api-reference)
4. [Smart Contract Integration](#smart-contract-integration)
5. [Creating Custom Agents](#creating-custom-agents)
6. [Frontend Integration](#frontend-integration)
7. [AI Trading Logic](#ai-trading-logic)
8. [Examples & Use Cases](#examples--use-cases)

---

## 🎯 INTRODUCTION

Agent.fun provides infrastructure for creating and managing autonomous AI trading agents on Solana. Developers can:

- **Use our API** to integrate agent creation into your app
- **Build custom UIs** on top of our smart contracts
- **Create specialized agents** with custom trading strategies
- **Fork the platform** to create domain-specific solutions
- **Integrate AI trading** into existing DeFi protocols

### What You Can Build

- 🤖 Custom trading bots with unique strategies
- 📊 Analytics dashboards for agent performance
- 🎮 Gamified trading competitions
- 💼 Agent management platforms
- 🔄 Cross-protocol arbitrage agents
- 📱 Mobile-first trading experiences

---

## 🏗️ PLATFORM ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────────────────┐
│                  Your Application                   │
│            (Frontend, Bot, Protocol, etc)           │
└────────────┬────────────────────────┬───────────────┘
             │                        │
      ┌──────▼──────┐          ┌──────▼──────┐
      │  Agent.fun  │          │   Solana    │
      │     API     │          │  Programs   │
      │ (REST/WS)   │          │  (On-chain) │
      └──────┬──────┘          └──────┬──────┘
             │                        │
             └────────┬───────────────┘
                      │
             ┌────────▼────────┐
             │   AI Executor   │
             │ Gemini + Jupiter│
             └─────────────────┘
```

### Components

1. **Smart Contracts** (Solana/Anchor)
   - `agent-factory`: Create new agents
   - `agent-manager`: Manage agent lifecycle

2. **Backend API** (Node.js/Express)
   - REST endpoints for agent operations
   - WebSocket for real-time updates
   - Transaction preparation

3. **AI Executor** (Node.js)
   - Autonomous trading logic
   - Market analysis with Gemini AI
   - Jupiter DEX integration

---

## 🔌 API REFERENCE

### Base URL

```
Mainnet: https://api.agent.fun
Devnet:  https://api.agent.fun/devnet
Local:   http://localhost:3001
```

### Authentication

No authentication required for read operations.
Write operations require signed transactions.

---

### Endpoints

#### 1. Health Check

```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "network": "mainnet-beta",
  "blockHeight": 234567890,
  "timestamp": "2025-01-13T00:00:00.000Z"
}
```

---

#### 2. Get All Agents

```http
GET /api/agent/all
```

**Response:**
```json
{
  "agents": [
    {
      "pubkey": "Agent111...",
      "name": "MemeKing",
      "symbol": "MKING",
      "purpose": "Trade trending memecoins",
      "creator": "Creator111...",
      "tokenMint": "Token111...",
      "vault": "Vault111...",
      "vaultBalance": 5.5,
      "totalTrades": 42,
      "totalVolume": 156.5,
      "revenuePool": 2.3,
      "status": "Active",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### 3. Get Agent Details

```http
GET /api/agent/:pubkey
```

**Parameters:**
- `pubkey` (required): Agent public key

**Response:**
```json
{
  "pubkey": "Agent111...",
  "name": "MemeKing",
  "symbol": "MKING",
  "purpose": "Trade trending memecoins",
  "creator": "Creator111...",
  "tokenMint": "Token111...",
  "vault": "Vault111...",
  "vaultBalance": 5.5,
  "totalTrades": 42,
  "totalVolume": 156.5,
  "revenuePool": 2.3,
  "status": "Active",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "recentTrades": [
    {
      "signature": "Tx111...",
      "fromToken": "SOL",
      "toToken": "WIF",
      "amountIn": 1.0,
      "amountOut": 1250.0,
      "timestamp": "2025-01-13T00:00:00.000Z"
    }
  ]
}
```

---

#### 4. Create Agent

```http
POST /api/agent/create
```

**Request Body:**
```json
{
  "name": "MyAgent",
  "symbol": "MYAG",
  "purpose": "Trade SOL-based memecoins with moderate risk",
  "creatorWallet": "Creator111..."
}
```

**Validation:**
- `name`: 1-32 characters
- `symbol`: 1-10 characters (uppercase)
- `purpose`: 1-200 characters
- `creatorWallet`: Valid Solana address

**Response:**
```json
{
  "agentPubkey": "Agent111...",
  "agentWallet": "AgentWallet111...",
  "tokenMint": "Token111...",
  "vault": "Vault111...",
  "transaction": "base64_encoded_transaction"
}
```

**Usage:**
```typescript
// 1. Call API to prepare transaction
const response = await fetch('/api/agent/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'MyAgent',
    symbol: 'MYAG',
    purpose: 'Trade memecoins',
    creatorWallet: wallet.publicKey.toString()
  })
});

const { transaction, agentPubkey } = await response.json();

// 2. Deserialize transaction
const tx = Transaction.from(Buffer.from(transaction, 'base64'));

// 3. Sign and send
const signature = await wallet.sendTransaction(tx, connection);
await connection.confirmTransaction(signature);

// 4. Agent is now created!
console.log('Agent created:', agentPubkey);
```

---

#### 5. Deposit Funds

```http
POST /api/agent/:pubkey/deposit
```

**Request Body:**
```json
{
  "amount": 1.0,
  "userWallet": "User111..."
}
```

**Response:**
```json
{
  "transaction": "base64_encoded_transaction"
}
```

**Usage:**
```typescript
const response = await fetch(`/api/agent/${agentPubkey}/deposit`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 1.0,
    userWallet: wallet.publicKey.toString()
  })
});

const { transaction } = await response.json();
const tx = Transaction.from(Buffer.from(transaction, 'base64'));
const signature = await wallet.sendTransaction(tx, connection);
```

---

#### 6. Get Treasury Wallet

```http
GET /api/agent/treasury
```

**Response:**
```json
{
  "treasury": "Treasury111..."
}
```

---

### WebSocket API (Coming Soon)

```typescript
const ws = new WebSocket('wss://api.agent.fun/ws');

// Subscribe to agent updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'agent',
  agentPubkey: 'Agent111...'
}));

// Receive real-time updates
ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Agent update:', update);
};
```

---

## 📜 SMART CONTRACT INTEGRATION

### Program IDs

```typescript
// Mainnet
const FACTORY_PROGRAM_ID = new PublicKey('Factory111...');
const MANAGER_PROGRAM_ID = new PublicKey('Manager111...');

// Devnet
const FACTORY_PROGRAM_ID = new PublicKey('Factory111...');
const MANAGER_PROGRAM_ID = new PublicKey('Manager111...');
```

### IDL Files

Download IDLs:
```bash
# Factory
curl https://api.agent.fun/idl/agent_factory.json

# Manager
curl https://api.agent.fun/idl/agent_manager.json
```

---

### Creating Agents (Direct Contract Call)

```typescript
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';

// Load IDL
const idl = await (await fetch('https://api.agent.fun/idl/agent_factory.json')).json();
const program = new Program(idl, FACTORY_PROGRAM_ID, provider);

// Find PDAs
const [factoryState] = PublicKey.findProgramAddressSync(
  [Buffer.from('factory')],
  FACTORY_PROGRAM_ID
);

const [agentState] = PublicKey.findProgramAddressSync(
  [Buffer.from('agent'), creator.publicKey.toBuffer()],
  MANAGER_PROGRAM_ID
);

// Create agent
const tx = await program.methods
  .createAgent(
    'MyAgent',      // name
    'MYAG',         // symbol
    'Trade memecoins', // purpose
    agentWallet     // agent wallet pubkey
  )
  .accounts({
    factoryState,
    creator: creator.publicKey,
    agentState,
    tokenMint,
    // ... other accounts
  })
  .rpc();
```

---

### Depositing Funds (Direct)

```typescript
const [vault] = PublicKey.findProgramAddressSync(
  [Buffer.from('vault'), agentState.toBuffer()],
  MANAGER_PROGRAM_ID
);

const tx = new Transaction().add(
  SystemProgram.transfer({
    fromPubkey: depositor.publicKey,
    toPubkey: vault,
    lamports: 1 * LAMPORTS_PER_SOL
  })
);

const signature = await sendAndConfirmTransaction(connection, tx, [depositor]);
```

---

## 🤖 CREATING CUSTOM AGENTS

### Option 1: Use Our API (Recommended)

Easiest way - let our backend handle complexity:

```typescript
import { AgentFunClient } from '@agent-fun/sdk';

const client = new AgentFunClient({
  network: 'mainnet',
  wallet: myWallet
});

// Create agent
const agent = await client.createAgent({
  name: 'MyAgent',
  symbol: 'MYAG',
  purpose: 'Custom trading strategy'
});

// Deposit funds
await agent.deposit(1.0);

// Monitor
agent.on('trade', (trade) => {
  console.log('Trade executed:', trade);
});
```

---

### Option 2: Direct Smart Contract Integration

Full control, more complexity:

```typescript
// See "Smart Contract Integration" section above
```

---

### Option 3: Fork the Platform

Clone and customize:

```bash
git clone https://github.com/nachoweb3/agent-fun
cd agent-fun
npm install

# Customize:
# - programs/ (modify smart contracts)
# - executor/ (change AI logic)
# - backend/ (add features)
# - frontend/ (rebrand UI)
```

---

## 🎨 FRONTEND INTEGRATION

### React + Solana Wallet Adapter

```typescript
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';

function CreateAgentButton() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const createAgent = async () => {
    // 1. Call API
    const response = await fetch('https://api.agent.fun/api/agent/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'MyAgent',
        symbol: 'MYAG',
        purpose: 'Trade memecoins',
        creatorWallet: publicKey.toString()
      })
    });

    const { transaction, agentPubkey } = await response.json();

    // 2. Deserialize and send
    const tx = Transaction.from(Buffer.from(transaction, 'base64'));
    const signature = await sendTransaction(tx, connection);

    // 3. Wait for confirmation
    await connection.confirmTransaction(signature);

    alert(`Agent created! ${agentPubkey}`);
  };

  return (
    <button onClick={createAgent} disabled={!publicKey}>
      Create Agent
    </button>
  );
}
```

---

### Fetching Agent Data

```typescript
function AgentDashboard({ agentPubkey }) {
  const [agent, setAgent] = useState(null);

  useEffect(() => {
    fetch(`https://api.agent.fun/api/agent/${agentPubkey}`)
      .then(res => res.json())
      .then(setAgent);
  }, [agentPubkey]);

  if (!agent) return <div>Loading...</div>;

  return (
    <div>
      <h2>{agent.name} ({agent.symbol})</h2>
      <p>Vault Balance: {agent.vaultBalance} SOL</p>
      <p>Total Trades: {agent.totalTrades}</p>
      <p>Status: {agent.status}</p>
    </div>
  );
}
```

---

## 🧠 AI TRADING LOGIC

### Default Strategy

Our default executor uses:
- **Gemini Pro** for market analysis
- **Jupiter DEX** for trade execution
- **5-minute intervals** for decisions

### Custom Strategy

Fork the executor and customize:

```typescript
// executor/src/strategies/my-strategy.ts

import { AgentState, MarketData } from '../types';

export async function analyzeMarket(
  agent: AgentState,
  market: MarketData
): Promise<TradeDecision> {

  // Your custom logic here
  // Examples:
  // - Technical indicators (RSI, MACD, etc)
  // - Sentiment analysis
  // - Copy trading
  // - Arbitrage detection
  // - ML models

  return {
    action: 'SWAP', // or 'HOLD'
    fromToken: 'SOL',
    toToken: 'WIF',
    amount: calculateAmount(agent.vaultBalance),
    reasoning: 'Your logic explanation'
  };
}
```

---

### Integrating Other AI Models

```typescript
// Replace Gemini with your preferred model:

import OpenAI from 'openai';
// import Anthropic from '@anthropic-ai/sdk';
// import Cohere from 'cohere-ai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function queryAI(prompt: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a crypto trading AI..." },
      { role: "user", content: prompt }
    ]
  });

  return JSON.parse(completion.choices[0].message.content);
}
```

---

## 💡 EXAMPLES & USE CASES

### Example 1: Analytics Dashboard

```typescript
// Fetch all agents and display stats

async function getAgentStats() {
  const response = await fetch('https://api.agent.fun/api/agent/all');
  const { agents } = await response.json();

  const stats = {
    totalAgents: agents.length,
    totalVolume: agents.reduce((sum, a) => sum + a.totalVolume, 0),
    activeTrades: agents.filter(a => a.status === 'Active').length,
    topPerformer: agents.sort((a, b) => b.totalVolume - a.totalVolume)[0]
  };

  return stats;
}
```

---

### Example 2: Trading Bot Manager

```typescript
// Manage multiple agents

class AgentManager {
  agents: Map<string, Agent> = new Map();

  async createAgent(config: AgentConfig) {
    const agent = await AgentFunClient.createAgent(config);
    this.agents.set(agent.pubkey, agent);
    return agent;
  }

  async depositAll(amount: number) {
    for (const agent of this.agents.values()) {
      await agent.deposit(amount);
    }
  }

  async getPerformance() {
    const stats = [];
    for (const agent of this.agents.values()) {
      const data = await agent.fetchData();
      stats.push({
        name: agent.name,
        roi: calculateROI(data),
        trades: data.totalTrades
      });
    }
    return stats;
  }
}
```

---

### Example 3: Copy Trading Platform

```typescript
// Let users copy successful agents

async function copyAgent(sourceAgentPubkey: string, userWallet: string) {
  // 1. Fetch source agent config
  const source = await fetch(`https://api.agent.fun/api/agent/${sourceAgentPubkey}`)
    .then(r => r.json());

  // 2. Create clone with same strategy
  const clone = await AgentFunClient.createAgent({
    name: `Copy of ${source.name}`,
    symbol: `C${source.symbol}`,
    purpose: source.purpose
  });

  // 3. Monitor source and mirror trades
  source.on('trade', async (trade) => {
    await clone.executeTrade(trade);
  });

  return clone;
}
```

---

### Example 4: Gamified Trading

```typescript
// Create trading competitions

class TradingLeague {
  async createSeason(duration: number) {
    const agents = await this.getAllAgents();

    const leaderboard = agents
      .map(a => ({
        agent: a,
        score: calculateScore(a)
      }))
      .sort((a, b) => b.score - a.score);

    return {
      top10: leaderboard.slice(0, 10),
      rewards: this.distributeRewards(leaderboard)
    };
  }

  calculateScore(agent: Agent) {
    return (
      agent.totalVolume * 0.4 +
      agent.profitability * 0.6
    );
  }
}
```

---

## 📚 SDK (Coming Soon)

We're building an official SDK:

```bash
npm install @agent-fun/sdk
```

```typescript
import { AgentFun } from '@agent-fun/sdk';

const agentFun = new AgentFun({
  network: 'mainnet',
  apiKey: process.env.AGENT_FUN_API_KEY
});

// Create
const agent = await agentFun.agents.create({
  name: 'MyAgent',
  symbol: 'MYAG',
  purpose: 'Trade memecoins'
});

// List
const agents = await agentFun.agents.list();

// Get
const agent = await agentFun.agents.get('Agent111...');

// Deposit
await agent.deposit(1.0);

// Subscribe to events
agent.on('trade', handleTrade);
agent.on('error', handleError);
```

---

## 🔗 Resources

### Documentation
- [Main README](../README.md)
- [API Reference](./API_REFERENCE.md)
- [Smart Contract Docs](./CONTRACTS.md)

### Code Examples
- [GitHub Repo](https://github.com/nachoweb3/agent-fun)
- [Example Apps](https://github.com/nachoweb3/agent-fun-examples)

### Community
- Discord: [agent.fun/discord](#)
- Twitter: [@nachoweb3](https://twitter.com/nachoweb3)

---

## 💬 Support

Building something cool? We want to hear about it!

- Open an issue on GitHub
- DM [@nachoweb3](https://twitter.com/nachoweb3)
- Join our Discord

---

**Built on Solana by @nachoweb3** 💜

*Let's build the future of AI trading together!*
