# AGENT.FUN 🤖

**Launch Autonomous AI Trading Agents on Solana**

AGENT.FUN is a groundbreaking platform that enables anyone to create and deploy autonomous AI trading agents on the Solana blockchain. Powered by Google Gemini AI and Jupiter, these agents make intelligent trading decisions 24/7.

![Solana](https://img.shields.io/badge/Solana-Blockchain-9945FF?style=for-the-badge&logo=solana)
![Rust](https://img.shields.io/badge/Rust-Programs-orange?style=for-the-badge&logo=rust)
![TypeScript](https://img.shields.io/badge/TypeScript-Backend-blue?style=for-the-badge&logo=typescript)
![Next.js](https://img.shields.io/badge/Next.js-Frontend-black?style=for-the-badge&logo=next.js)
![Google](https://img.shields.io/badge/Google-Gemini_AI-4285F4?style=for-the-badge&logo=google)

## Features

- ✅ **AI-Powered Trading**: Google Gemini Pro analyzes market sentiment and executes trades (FREE!)
- ✅ **Fully Autonomous**: Agents operate 24/7 without manual intervention
- ✅ **On-Chain Security**: All trades executed transparently on Solana
- ✅ **Tokenized Ownership**: Each agent has its own SPL token
- ✅ **Revenue Sharing**: Token holders earn from agent profits
- ✅ **Jupiter Integration**: Best DEX aggregation for optimal pricing
- ✅ **Solana Mobile Ready**: Optimized for Saga with Mobile Wallet Adapter

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                       │
│              Mobile-First UI + Wallet Adapter               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ├─────────────────┐
                       ▼                 ▼
         ┌─────────────────────┐  ┌──────────────────────┐
         │   BACKEND (API)     │  │  SOLANA BLOCKCHAIN   │
         │  Node.js/Express    │  │                      │
         │                     │  │  - AgentFactory      │
         └──────────┬──────────┘  │  - AgentManager      │
                    │             └──────────────────────┘
                    ▼
         ┌─────────────────────┐
         │   AI EXECUTOR       │
         │  Gemini + Jupiter   │
         └─────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js 20+
- Rust & Cargo
- Solana CLI
- Anchor CLI 0.29+

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/agent-fun.git
cd agent-fun
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Executor
cd ../executor
npm install
cp .env.example .env
# Edit .env with your Gemini API key (FREE at https://makersuite.google.com/app/apikey)
```

3. **Build Anchor programs (optional for local development)**
```bash
anchor build
```

### Running Locally

**Terminal 1: Start Solana Test Validator**
```bash
solana-test-validator
```

**Terminal 2: Deploy Programs (if building locally)**
```bash
anchor deploy
```

**Terminal 3: Start Backend**
```bash
cd backend
npm run dev
```

**Terminal 4: Start Frontend**
```bash
cd frontend
npm run dev
```

**Terminal 5: Start AI Executor**
```bash
cd executor
npm run dev
```

Visit `http://localhost:3000` to see the app!

## Project Structure

```
agent-fun/
├── programs/
│   ├── agent-factory/       # Program to create agents
│   └── agent-manager/       # Program to manage agents
├── backend/
│   └── src/
│       ├── controllers/     # API request handlers
│       ├── services/        # Business logic
│       ├── routes/          # API routes
│       └── middleware/      # Express middleware
├── frontend/
│   ├── app/                 # Next.js pages
│   │   ├── page.tsx        # Landing page
│   │   ├── create/         # Create agent page
│   │   ├── agent/[pubkey]/ # Agent dashboard
│   │   └── explore/        # Explore agents
│   └── components/          # React components
├── executor/
│   └── src/
│       ├── worker.ts        # Main cron job
│       ├── executor.ts      # Execution logic
│       └── services/        # AI, Jupiter, key management
└── agents.md                # Development guide
```

## How It Works

### 1. Create an Agent
- User defines agent's name, symbol, and mission
- Pays 0.5 SOL creation fee
- Receives 1M tokens of the agent
- Agent gets its own autonomous wallet

### 2. Fund the Agent
- Anyone can deposit SOL to the agent's vault
- Funds are used for trading operations

### 3. AI Execution
- Worker runs every 5 minutes (configurable)
- Fetches active agents from blockchain
- Queries Google Gemini Pro with market data and agent mission
- AI decides: SWAP or HOLD
- If SWAP: Gets quote from Jupiter and executes trade

### 4. Revenue Sharing
- Agent earns from successful trades
- 1% platform commission
- Token holders can claim proportional share

## Smart Contract Functions

### AgentFactory

```rust
pub fn create_agent(
    name: String,
    symbol: String,
    purpose: String,
    agent_wallet: Pubkey,
) -> Result<()>
```

Creates a new agent with:
- SPL token mint
- Agent state account
- Vault for funds

### AgentManager

```rust
pub fn deposit_funds(amount: u64) -> Result<()>
pub fn execute_trade(from_mint, to_mint, amount, min_output) -> Result<()>
pub fn claim_revenue_share() -> Result<()>
pub fn update_purpose(new_purpose: String) -> Result<()>
pub fn pause_agent() -> Result<()>
pub fn resume_agent() -> Result<()>
```

## API Endpoints

### Backend API

**POST** `/api/agent/create`
```json
{
  "name": "MemeKing",
  "symbol": "MKING",
  "purpose": "Trade trending memecoins",
  "creatorWallet": "..."
}
```

**GET** `/api/agent/:pubkey`
```json
{
  "name": "MemeKing",
  "vaultBalance": 5.5,
  "totalTrades": 42,
  "status": "Active",
  ...
}
```

**GET** `/api/agent/all`
```json
{
  "agents": [...]
}
```

**POST** `/api/agent/:pubkey/deposit`
```json
{
  "amount": 1.0,
  "userWallet": "..."
}
```

## Configuration

### Backend (.env)
```env
PORT=3001
RPC_ENDPOINT=https://api.devnet.solana.com
FACTORY_PROGRAM_ID=...
MANAGER_PROGRAM_ID=...
TREASURY_WALLET=...
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_BACKEND_API=http://localhost:3001/api
NEXT_PUBLIC_NETWORK=devnet
```

### Executor (.env)
```env
RPC_ENDPOINT=https://api.devnet.solana.com
GEMINI_API_KEY=your-api-key-here
BACKEND_API_URL=http://localhost:3001/api
EXECUTION_INTERVAL_MINUTES=5
```

**Get FREE Gemini API Key**: https://makersuite.google.com/app/apikey

## Security

### Secure Key Management System ✅

Agent private keys are **encrypted at rest** using **AES-256-GCM encryption**:

- **Encryption**: Military-grade AES-256-GCM with PBKDF2 key derivation
- **Keys encrypted**: All stored as `.enc` files, never plaintext
- **Secure logging**: Private keys never exposed in logs or errors
- **Key rotation**: Built-in support for encryption rotation
- **Access control**: Only executor service can decrypt keys

**Setup** (3 steps):
```bash
# 1. Generate master encryption key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 2. Add to .env files (backend and executor)
ENCRYPTION_MASTER_KEY=<your-generated-key>

# 3. Verify security
cd backend && npm run test:security
```

**Documentation**:
- [SECURITY_SETUP.md](./SECURITY_SETUP.md) - Quick start guide
- [SECURITY.md](./SECURITY.md) - Full technical documentation
- [SECURITY_IMPLEMENTATION_SUMMARY.md](./SECURITY_IMPLEMENTATION_SUMMARY.md) - Implementation details

**For Production**:
- Use AWS Secrets Manager for master key storage
- Consider AWS KMS for encryption (code provided)
- Enable monitoring and alerting
- Implement automated key rotation

See documentation for production deployment checklist.

## Deployment to Mainnet

1. **Generate program keypairs**
```bash
solana-keygen new -o target/deploy/agent_factory-keypair.json
solana-keygen new -o target/deploy/agent_manager-keypair.json
```

2. **Update Anchor.toml** with new program IDs

3. **Build for production**
```bash
anchor build --verifiable
```

4. **Fund deployment wallet**
```bash
# ~15-20 SOL per program
solana balance
```

5. **Deploy**
```bash
anchor deploy --provider.cluster mainnet
```

6. **Update all configs** with mainnet program IDs and RPC endpoints

7. **Deploy frontend & backend** to Vercel/Railway/AWS

## Monetization

- **Creation Fee**: 0.5 SOL per agent
- **Trading Commission**: 1% of profits
- **Premium Subscriptions** (coming soon):
  - $99/month for advanced features
  - Higher execution frequency (every 1 min vs 5 min)
  - Advanced AI models and strategies
  - Priority execution and advanced analytics

## Roadmap

### V1.1 - Governance
- [x] Token holder voting on purpose changes
- [ ] Community proposals
- [ ] DAO treasury management

### V1.2 - Advanced Strategies
- [ ] Multiple trading strategies per agent
- [ ] Backtesting framework
- [ ] Risk management controls

### V1.3 - Social Features
- [ ] Agent leaderboard by performance
- [ ] Copy trading
- [ ] Comments & ratings

### V2.0 - Multi-Chain
- [ ] Ethereum L2 support
- [ ] Cross-chain bridges
- [ ] Unified liquidity

## Testing

```bash
# Run program tests
anchor test

# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Disclaimer

⚠️ **This is experimental software. Use at your own risk.**

- AI trading decisions can result in loss of funds
- Smart contracts are immutable once deployed
- No guarantees of profitability
- Not financial advice

## Support

- 📚 [Documentation](./agents.md)
- 💬 [Discord Community](https://discord.gg/agentfun)
- 🐦 [Twitter](https://twitter.com/agentfun)
- 📧 [Email](mailto:support@agent.fun)

---

**Built with ❤️ on Solana**

*Optimized for Solana Mobile (Saga)*
