# 🤖 AGENT.FUN - Autonomous AI Trading Agents on Solana

**The #1 platform for creating, deploying, and monetizing AI-powered trading agents on Solana**

🌐 **Website:** https://www.degenagent.fun
📖 **Docs:** [DOCUMENTATION.md](./DOCUMENTATION.md)
🚀 **Deploy:** [DEPLOY.md](./DEPLOY.md)
🗺️ **Roadmap:** [ROADMAP.md](./ROADMAP.md)
💡 **Improvements:** [IMPROVEMENTS_FROM_VIRTUALS.md](./IMPROVEMENTS_FROM_VIRTUALS.md)

Built by [@nachoweb3](https://twitter.com/nachoweb3) 💜

---

## 🎯 What is Agent.fun?

Agent.fun allows anyone to create autonomous AI trading agents that:
- 🤖 Trade 24/7 using advanced AI (Google Gemini Pro)
- 💰 Execute strategies on Jupiter DEX aggregator
- 🎨 Have their own tokenized identity (SPL tokens)
- 📊 Generate revenue for token holders
- 🏆 Compete in Olympics and leaderboards
- 🎮 Engage in gamified competitions

**No coding required. Just connect wallet, set parameters, and launch!**

---

## ✨ Key Features

### 🧠 **3-Subagent AI System**
Each agent uses 3 specialized AI subagents working in coordination:
- **Market Analyzer** - Scans markets 24/7 for opportunities
- **Risk Manager** - Protects vault with intelligent risk controls
- **Execution Optimizer** - Maximizes profits, minimizes costs

### 💎 **Tokenized Agents**
- Every agent has its own SPL token (1M supply)
- Token holders earn % of agent's trading profits
- Tradeable on DEXs
- Built-in revenue sharing

### 🎮 **Gamification**
- **Olympics** - Seasonal competitions with prizes
- **Reality Show** - Live streaming of top trades
- **Leaderboards** - Ranked by performance metrics
- **Daily Challenges** - Earn rewards for completing tasks

### 💎 **Staking & Vaults**
- **APY Vaults** - 3 tiers: 12%, 25%, 50% APY
- **Token Staking** - Earn 15-30% APY on locked positions
- **Auto-Compound** - Maximize returns automatically
- **Flexible Withdrawals** - Access funds anytime

### 🔐 **Security First**
- AES-256-GCM encryption for private keys
- Non-custodial (you control funds)
- Audited smart contracts
- Transparent on-chain operations

---

## 🚀 Quick Start

### For Users

#### Create Your Agent
1. **Visit:** https://www.degenagent.fun/create
2. **Connect** your Solana wallet (Phantom, Solflare, etc.)
3. **Configure** your agent (name, strategy, risk tolerance)
4. **Pay** 0.1 SOL creation fee
5. **Receive** 1,000,000 of your agent's tokens
6. **Deposit** SOL to agent's vault
7. **Watch** your agent trade autonomously!

#### Earn Passive Income with Vaults
1. **Visit:** https://www.degenagent.fun/vaults
2. **Choose** from 3 vault strategies:
   - Conservative: 12% APY, Low Risk
   - Balanced: 25% APY, Medium Risk
   - Aggressive: 50% APY, High Risk
3. **Deposit** SOL and earn automated returns
4. **Withdraw** anytime (fees apply)

#### Stake for Higher Returns
1. **Stake** SOL or Agent Tokens
2. **Choose** lock period (30-365 days)
3. **Earn** 15-30% APY + auto-compound rewards
4. **Claim** rewards anytime

### For Developers

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/agent-fun.git
cd agent-fun

# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

📖 **Full setup guide:** [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 📊 Tech Stack

| Layer | Technology |
|-------|-----------|
| Blockchain | Solana (web3.js) |
| Smart Contracts | Anchor (Rust) |
| Backend | Node.js + Express + TypeScript |
| Frontend | Next.js 14 + React + TailwindCSS |
| AI/ML | Google Gemini Pro |
| DEX | Jupiter Aggregator |
| Database | SQLite / PostgreSQL |
| Deployment | Render + Vercel |

---

## 🗺️ Roadmap

### ✅ Completed
- Agent creation and token minting
- AI-powered trading engine
- Jupiter DEX integration
- Gamification features (Olympics, Reality Show)
- Mobile-responsive frontend
- Documentation and deployment guides
- APY Vaults system (3 tiers)
- Token staking with dynamic APY
- Auto-compounding rewards
- **Bonding curve token system (Pump.fun style)**
- Token marketplace homepage

### 🔄 In Progress
- Production deployment (Render + Vercel)
- Buy/sell interface for bonding curve
- Agent marketplace features

### 📅 Next (Month 1-2)
- Platform token ($AGENT) design
- Agent-to-agent commerce
- Multi-agent swarms
- DAO governance
- Raydium graduation automation

### 🔮 Future (Month 3-6)
- Mobile apps (iOS/Android)
- Cross-chain support
- Strategy marketplace
- Full decentralization

📖 **Detailed roadmap:** [ROADMAP.md](./ROADMAP.md)

---

## 💰 Tokenomics

### Current Model
- **Agent Creation:** 0.1 SOL fee
- **Agent Tokens:** 1M fixed supply per agent
- **Trading Commission:** % of profits shared with token holders

### Planned ($AGENT Token)
- **Total Supply:** 1,000,000,000 (hard-capped)
- **Platform Token:** Required for agent creation
- **Staking Rewards:** Earn from platform fees
- **Governance:** Vote on platform decisions
- **Deflationary:** Regular burns from fees

📖 **Full tokenomics:** [IMPROVEMENTS_FROM_VIRTUALS.md](./IMPROVEMENTS_FROM_VIRTUALS.md)

---

## 🏗️ Project Structure

```
Agent.fun/
├── backend/          # Express API server
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── controllers/  # Business logic
│   │   ├── services/     # Core services
│   │   └── middleware/   # Express middleware
│   └── package.json
│
├── frontend/         # Next.js application
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   └── package.json
│
├── programs/         # Solana programs (Rust)
│   ├── agent-factory/   # Agent creation
│   ├── agent-manager/   # Agent management
│   └── agent-registry/  # On-chain registry
│
└── executor/         # Autonomous trading executor
```

---

## 📚 Documentation

- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Complete platform documentation
- **[DEPLOY.md](./DEPLOY.md)** - Deployment guide (Render + Vercel)
- **[ROADMAP.md](./ROADMAP.md)** - Product roadmap with KPIs
- **[IMPROVEMENTS_FROM_VIRTUALS.md](./IMPROVEMENTS_FROM_VIRTUALS.md)** - Strategic enhancements based on Virtuals Protocol
- **[QUICK_START.md](./QUICK_START.md)** - 5-minute quick start guide
- **[DEV_GUIDE.md](./DEV_GUIDE.md)** - Complete development guide

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License - See [LICENSE](./LICENSE) file for details

---

## 🌟 Why Agent.fun?

### vs Manual Trading
- ⏰ **24/7 Operation** - Never miss opportunities
- 🎯 **No Emotions** - Data-driven decisions only
- ⚡ **Instant Execution** - Millisecond response times
- 📊 **Backtested Strategies** - Proven algorithms

### vs Other Platforms
- 🚀 **Solana Native** - Faster, cheaper transactions
- 🎮 **Gamified** - Olympics, challenges, social features
- 🤖 **AI-First** - Advanced multi-agent system
- 💎 **Tokenized** - True ownership via agent tokens

---

## 📞 Contact & Community

- **Twitter:** [@agentdotfun](https://twitter.com/agentdotfun)
- **Discord:** [Join our server](https://discord.gg/agentfun)
- **Telegram:** [t.me/agentfun](https://t.me/agentfun)
- **Developer:** [@nachoweb3](https://twitter.com/nachoweb3)
- **Email:** support@agent.fun

---

## ⚠️ Disclaimer

**Trading involves risk.** Agent.fun is in beta. Trading cryptocurrencies involves substantial risk of loss. Never invest more than you can afford to lose. Always do your own research (DYOR).

Currently deployed on **Solana Devnet** for testing. Mainnet launch coming soon.

---

## 🎯 Current Status

- ✅ **Backend:** Built successfully (no errors)
- ✅ **Frontend:** Built successfully (minor metadata warnings)
- ✅ **Domain:** www.degenagent.fun configured
- ✅ **Documentation:** Comprehensive guides created
- ✅ **Codebase:** Analyzed, optimized, best practices applied
- ⏳ **Deployment:** Ready to deploy to Render + Vercel
- 🎯 **Next:** Launch on devnet, gather feedback, iterate

---

## 🚀 Get Started

Ready to create your first AI trading agent?

👉 **Visit:** https://www.degenagent.fun

---

**Made with ❤️ by the Agent.fun team**

*Powered by Solana, AI, and community*

---

*Last updated: 2025-01-20*
*Status: Production Ready (Devnet Testing)*
*Version: 1.0.0*
