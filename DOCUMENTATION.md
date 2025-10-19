# 🚀 AGENT.FUN - Complete Documentation

**Platform:** Autonomous AI Trading Agents on Solana
**Domain:** https://www.degenagent.fun
**Status:** Production Ready (Devnet Testing)

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Deployment Guide](#deployment-guide)
3. [Project Structure](#project-structure)
4. [Environment Configuration](#environment-configuration)
5. [Development](#development)
6. [API Reference](#api-reference)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18+ installed
- Solana wallet (Phantom, Solflare, etc.)
- SOL for devnet testing (https://faucet.solana.com/)

### Local Development

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/agent-fun.git
cd agent-fun

# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev  # Runs on port 3001

# Frontend setup (new terminal)
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with backend URL
npm run dev  # Runs on port 3000

# Open browser
http://localhost:3000
```

---

## 🌐 Deployment Guide

### Step 1: Deploy Backend to Render

1. **Create Render Account**: https://dashboard.render.com/
2. **Create New Web Service**:
   - Name: `degenagent-backend`
   - Runtime: Node
   - Build Command: `cd backend && npm install && npm run build`
   - Start Command: `cd backend && npm start`
   - Instance: Free

3. **Add Environment Variables** (all required):

```bash
RPC_ENDPOINT=https://api.devnet.solana.com
NODE_ENV=production
PORT=3001
ALLOWED_ORIGINS=https://www.degenagent.fun,https://degenagent.fun,http://localhost:3000
TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ADMIN_WALLET_ADDRESS=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
ENCRYPTION_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
COMMISSION_RATE=0.5
REFERRAL_COMMISSION_RATE=10
MIN_TRADE_FOR_COMMISSION=10
```

4. **Deploy** - Wait 5-10 minutes
5. **Get URL** - Copy your backend URL (e.g., `https://degenagent-backend.onrender.com`)

### Step 2: Deploy Frontend to Vercel

```bash
cd frontend

# Login to Vercel
vercel login

# Set environment variables
vercel env add NEXT_PUBLIC_RPC_ENDPOINT production
# Enter: https://api.devnet.solana.com

vercel env add NEXT_PUBLIC_BACKEND_API production
# Enter: https://YOUR-RENDER-URL.onrender.com/api

vercel env add NEXT_PUBLIC_NETWORK production
# Enter: devnet

vercel env add NEXT_PUBLIC_SITE_URL production
# Enter: https://www.degenagent.fun

# Deploy to production
vercel --prod
```

### Step 3: Verify Deployment

```bash
# Test backend health
curl https://YOUR-BACKEND-URL.onrender.com/health

# Expected response:
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}

# Test frontend
# Open: https://www.degenagent.fun/create
# Connect wallet and try creating an agent
```

---

## 📁 Project Structure

```
Agent.fun/
├── backend/                    # Node.js/Express API
│   ├── src/
│   │   ├── index.ts           # Server entry point
│   │   ├── database.ts        # Sequelize ORM setup
│   │   ├── models/            # 8 database models
│   │   │   ├── Agent.ts
│   │   │   ├── Olympics.ts
│   │   │   ├── Trade.ts
│   │   │   └── ...
│   │   ├── routes/            # API route handlers
│   │   │   ├── agent.ts       # /api/agent/*
│   │   │   ├── trading.ts     # /api/trading/*
│   │   │   └── ...
│   │   ├── controllers/       # Business logic
│   │   ├── services/          # Core services
│   │   │   ├── solana.ts      # Blockchain integration
│   │   │   ├── keyManager.ts  # Encrypted key storage
│   │   │   ├── tradingEngine.ts
│   │   │   └── ...
│   │   └── middleware/
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Next.js 14 App
│   ├── app/                   # App Router pages
│   │   ├── page.tsx           # Home
│   │   ├── create/page.tsx    # Agent creation
│   │   ├── agent/[pubkey]/page.tsx
│   │   ├── leaderboard/page.tsx
│   │   └── ...
│   ├── components/            # React components
│   │   ├── WalletProvider.tsx
│   │   ├── ShareAgent.tsx
│   │   └── ...
│   ├── package.json
│   └── next.config.js
│
├── programs/                   # Solana programs (Rust)
│   ├── agent-factory/         # Agent creation contract
│   ├── agent-manager/         # Agent management
│   └── agent-registry/        # On-chain registry
│
└── executor/                   # Autonomous trading executor
    └── src/
        ├── executor.ts
        └── services/
```

---

## ⚙️ Environment Configuration

### Backend (.env)

```bash
# Required
RPC_ENDPOINT=https://api.devnet.solana.com
NODE_ENV=development
PORT=3001
TREASURY_WALLET=YOUR_WALLET_ADDRESS
ENCRYPTION_MASTER_KEY=GENERATE_SECURE_32_BYTE_HEX

# Optional
DATABASE_URL=postgresql://user:pass@localhost:5432/agentfun
GEMINI_API_KEY=your_gemini_api_key
JUPITER_API_KEY=your_jupiter_api_key
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_BACKEND_API=http://localhost:3001/api
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 👨‍💻 Development

### Available Scripts

**Backend:**
```bash
npm run dev          # Development with hot reload
npm run build        # Compile TypeScript
npm start            # Start production server
npm run test:security # Test key encryption
```

**Frontend:**
```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Start production server
npm run lint         # Run ESLint
```

### Adding New Features

1. **New API Endpoint**:
   - Add route in `backend/src/routes/`
   - Add controller in `backend/src/controllers/`
   - Add service logic in `backend/src/services/`

2. **New Page**:
   - Create `frontend/app/yourpage/page.tsx`
   - Add to navigation in `frontend/app/layout.tsx`

3. **New Component**:
   - Create in `frontend/components/YourComponent.tsx`
   - Import and use in pages

---

## 📡 API Reference

### Base URL
- **Development**: `http://localhost:3001/api`
- **Production**: `https://YOUR-BACKEND-URL.onrender.com/api`

### Endpoints

#### Agent Management

**Create Agent**
```http
POST /api/agent/create
Content-Type: application/json

{
  "name": "TradingBot",
  "symbol": "TBOT",
  "purpose": "Trade memecoins aggressively",
  "creatorWallet": "WALLET_ADDRESS",
  "riskTolerance": 7,
  "tradingFrequency": "medium",
  "maxTradeSize": 15
}

Response: {
  "success": true,
  "agentId": 123,
  "agentPubkey": "AGENT_PUBLIC_KEY",
  "tokenMint": "TOKEN_MINT_ADDRESS",
  "transaction": "BASE64_TRANSACTION"
}
```

**Get Agent**
```http
GET /api/agent/:pubkey

Response: {
  "pubkey": "...",
  "name": "TradingBot",
  "vaultBalance": 10.5,
  "totalTrades": 42,
  "totalVolume": "15.5",
  "status": "Active"
}
```

**Get All Agents**
```http
GET /api/agent/list

Response: {
  "success": true,
  "count": 150,
  "agents": [...]
}
```

#### Trading

**Execute Trade**
```http
POST /api/trading/execute
Content-Type: application/json

{
  "agentPubkey": "...",
  "inputMint": "So11111111111111111111111111111111111111112",
  "outputMint": "TOKEN_MINT",
  "amount": 1000000,
  "slippageBps": 50
}
```

**Get Trading History**
```http
GET /api/trading/history/:agentId
```

#### Health Check

```http
GET /health

Response: {
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789,
  "timestamp": "2025-01-01T12:00:00Z"
}
```

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check `.env` file exists and has all required variables
- Verify PORT is not in use: `lsof -i :3001` (Mac/Linux)
- Check database connection if using PostgreSQL

**CORS errors in frontend**
- Verify `ALLOWED_ORIGINS` in backend includes your frontend URL
- Check frontend is using correct backend URL
- Ensure both domains match (http vs https)

**Transaction fails**
- Ensure wallet has enough SOL for gas
- Check RPC endpoint is responding
- Verify you're on correct network (devnet vs mainnet)
- Try increasing slippage tolerance

**Agent creation fails**
- Confirm all required fields are provided
- Check wallet is connected
- Verify backend is running and accessible
- Look at browser console for detailed errors

**Database errors**
- For SQLite: Check `.data/` directory exists and is writable
- For PostgreSQL: Verify DATABASE_URL is correct
- Run migrations if needed

### Debug Mode

Enable detailed logging:

```bash
# Backend
DEBUG=* npm run dev

# Frontend
npm run dev  # Check browser console (F12)
```

### Getting Help

- **GitHub Issues**: Report bugs at repository issues page
- **Documentation**: This file and inline code comments
- **Community**: Join Solana Discord #agent-fun channel

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` as template
2. **Rotate encryption keys** regularly in production
3. **Use environment secrets** in Render/Vercel dashboards
4. **Enable rate limiting** for production API
5. **Validate all user inputs** on backend
6. **Use HTTPS** in production (always)
7. **Implement auth** for sensitive endpoints
8. **Monitor logs** for suspicious activity

---

## 🚀 Migrating to Mainnet

When ready for mainnet deployment:

1. **Update RPC endpoints**:
   ```bash
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_NETWORK=mainnet-beta
   ```

2. **Deploy Solana programs** to mainnet:
   ```bash
   cd programs
   anchor build
   solana program deploy --program-id factory-keypair.json target/deploy/agent_factory.so
   ```

3. **Update program IDs** in `.env`:
   ```bash
   FACTORY_PROGRAM_ID=YOUR_MAINNET_PROGRAM_ID
   MANAGER_PROGRAM_ID=YOUR_MAINNET_MANAGER_ID
   ```

4. **Test thoroughly** with small amounts first
5. **Monitor** all transactions and logs
6. **Have rollback plan** ready

---

## 📊 Monitoring

### Health Checks

```bash
# Backend health
curl https://your-backend.onrender.com/health

# Database status
# Check Render dashboard → Logs

# Frontend status
# Visit: https://www.degenagent.fun
```

### Logs

- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → View Logs
- **Local**: Terminal output during `npm run dev`

---

## 📝 License

MIT License - See LICENSE file for details

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Last Updated**: 2025-01-20
**Version**: 1.0.0
**Status**: Production Ready (Devnet)

For deployment support, see DEPLOYMENT.md
For development setup, see this document's Quick Start section.
