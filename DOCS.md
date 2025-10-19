# 📚 Agent.fun - Complete Documentation

**Platform:** Autonomous AI Trading Agents on Solana
**Live:** https://www.degenagent.fun

---

## 🎯 What is Agent.fun?

Create autonomous AI trading agents that:
- 🤖 Trade 24/7 using Google Gemini AI
- 💰 Execute on Jupiter DEX
- 🎨 Have their own SPL tokens
- 📊 Generate revenue for holders
- 🏆 Compete in Olympics

---

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Blockchain | Solana |
| Smart Contracts | Anchor (Rust) |
| Backend | Node.js + Express + TypeScript |
| Frontend | Next.js 14 + React |
| AI | Google Gemini Pro |
| DEX | Jupiter Aggregator |
| Database | PostgreSQL / SQLite |

---

## 📁 Project Structure

```
Agent.fun/
├── backend/           # API server (Node.js)
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── package.json
├── frontend/          # Web app (Next.js)
│   ├── app/
│   └── components/
└── programs/          # Solana programs (Rust)
```

---

## 🚀 Development Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your config
npm run dev  # Port 3001
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local
npm run dev  # Port 3000
```

---

## 🌐 Environment Variables

### Backend (.env)
```bash
RPC_ENDPOINT=https://api.devnet.solana.com
NODE_ENV=development
PORT=3001
TREASURY_WALLET=YOUR_WALLET
ENCRYPTION_MASTER_KEY=YOUR_32_BYTE_HEX_KEY
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_BACKEND_API=http://localhost:3001/api
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📡 API Reference

### Base URL
- Dev: `http://localhost:3001/api`
- Prod: `https://YOUR-BACKEND.onrender.com/api`

### Endpoints

**Create Agent**
```http
POST /api/agent/create
{
  "name": "TradingBot",
  "symbol": "TBOT",
  "purpose": "Trade memecoins",
  "creatorWallet": "WALLET_ADDRESS",
  "riskTolerance": 7
}
```

**Get Agent**
```http
GET /api/agent/:pubkey
```

**Health Check**
```http
GET /health
```

---

## 🔧 Troubleshooting

**Backend won't start**
- Check all env vars are set
- Verify PORT not in use
- Check database connection

**CORS errors**
- Verify ALLOWED_ORIGINS includes your domain
- Check frontend uses correct backend URL

**Build fails on Render**
- Ensure TypeScript types in dependencies (not devDependencies)
- Clear build cache and redeploy

**Transaction fails**
- Check wallet has SOL for gas
- Verify on correct network (devnet/mainnet)
- Check RPC endpoint responding

---

## 🎮 Features

### 3-Subagent AI System
- Market Analyzer: Scans 24/7
- Risk Manager: Protects funds
- Execution Optimizer: Best prices

### Gamification
- Olympics competitions
- Reality Show streaming
- Leaderboards
- Daily challenges

### Tokenomics
- Agent creation: 0.1 SOL
- Agent tokens: 1M supply
- Revenue sharing with holders

---

## 🚀 Deployment

### Production Deployment

**Backend (Render):**
1. Connect GitHub repo
2. Root Directory: `backend`
3. Build: `npm install && npm run build`
4. Start: `npm start`
5. Add all environment variables

**Frontend (Vercel):**
```bash
cd frontend
vercel --prod
```

**Environment Setup:**
- Render: Add all backend env vars
- Vercel: Set NEXT_PUBLIC_* variables

---

## 🔐 Security

- AES-256-GCM encryption for private keys
- Non-custodial (users control funds)
- Environment variables never committed
- CORS whitelist protection
- Rate limiting (planned)

---

## 📊 Database Models

### Agent
```typescript
{
  id: string
  name: string
  symbol: string
  purpose: string
  owner: string
  walletAddress: string
  tokenMint: string
  status: 'active' | 'paused'
  riskLevel: 'low' | 'medium' | 'high'
  totalTrades: number
  totalProfit: string
}
```

### TradingOrder
```typescript
{
  id: string
  agentId: string
  type: 'buy' | 'sell'
  inputMint: string
  outputMint: string
  amount: string
  status: 'pending' | 'executed' | 'failed'
}
```

---

## 🤝 Contributing

1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push and create PR

---

## 📞 Support

- **GitHub:** https://github.com/nachoweb3/degenagent.fun
- **Website:** https://www.degenagent.fun
- **Developer:** [@nachoweb3](https://twitter.com/nachoweb3)

---

## ⚠️ Disclaimer

Trading involves risk. Platform in beta. Never invest more than you can afford to lose.

Currently on **Solana Devnet** for testing.

---

**Version:** 1.0.0
**Last Updated:** 2025-01-20
