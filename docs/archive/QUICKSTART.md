# AGENT.FUN - Quick Start Guide

Get your AI agent platform running in 5 minutes!

## Prerequisites Check

Before starting, make sure you have:

- ✅ Node.js 20+ (`node --version`)
- ✅ npm or yarn
- ✅ Git

For full development (optional):
- Rust & Cargo (for building programs)
- Solana CLI
- Anchor CLI 0.29+

## 🚀 Fast Setup (MVP Mode)

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/agent-fun.git
cd agent-fun

# Install all dependencies
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
cd executor && npm install && cd ..
```

### Step 2: Configure Environment

**Backend**
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
PORT=3001
RPC_ENDPOINT=https://api.devnet.solana.com
FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
TREASURY_WALLET=YOUR_WALLET_HERE
```

**Frontend**
```bash
cd frontend
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_RPC_ENDPOINT=https://api.devnet.solana.com
NEXT_PUBLIC_BACKEND_API=http://localhost:3001/api
NEXT_PUBLIC_NETWORK=devnet
```

**Executor**
```bash
cd executor
cp .env.example .env
```

Edit `.env`:
```env
RPC_ENDPOINT=https://api.devnet.solana.com
GEMINI_API_KEY=YOUR-GEMINI-KEY-HERE
BACKEND_API_URL=http://localhost:3001/api
EXECUTION_INTERVAL_MINUTES=5
```

**Get FREE Gemini API Key**: https://makersuite.google.com/app/apikey
(No credit card required! Just sign in with Google)

### Step 3: Start Development Servers

Open 3 terminals:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```
Wait for: `🚀 AGENT.FUN Backend running on port 3001`

**Terminal 2: Frontend**
```bash
cd frontend
npm run dev
```
Wait for: `✓ Ready on http://localhost:3000`

**Terminal 3: AI Executor (Optional)**
```bash
cd executor
npm run dev
```

### Step 4: Open in Browser

Go to: **http://localhost:3000**

You should see the AGENT.FUN landing page!

## 🎯 Testing the Platform

### 1. Connect Wallet
- Click "Connect Wallet" button
- Select Phantom or Solflare
- Make sure you're on **Devnet**

### 2. Get Devnet SOL
```bash
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet
```

Or use: https://faucet.solana.com/

### 3. Create Your First Agent
- Go to "Create Agent"
- Fill in:
  - Name: `TestBot`
  - Symbol: `TEST`
  - Mission: `Trade memecoins aggressively`
- Click "Launch Agent (0.5 SOL)"
- Approve transaction in wallet

### 4. Fund Your Agent
- On agent dashboard, deposit 1 SOL
- Wait for confirmation

### 5. Watch It Trade
- The AI executor will pick it up in the next cycle (every 5 min)
- Watch the "Recent Trades" section for activity

## 📁 Project Structure

```
agent-fun/
├── programs/           # Rust smart contracts
├── backend/           # Node.js API (Port 3001)
├── frontend/          # Next.js UI (Port 3000)
├── executor/          # AI worker
└── agents.md          # Full development guide
```

## 🔍 Troubleshooting

### Backend won't start
- Check port 3001 is free: `lsof -i :3001` (Mac/Linux)
- Make sure `.env` exists and is configured

### Frontend shows "Failed to fetch"
- Make sure backend is running on port 3001
- Check `NEXT_PUBLIC_BACKEND_API` in `.env.local`

### Wallet won't connect
- Make sure you have Phantom or Solflare installed
- Switch to Devnet in wallet settings

### Can't create agent
- Ensure you have at least 1 SOL on Devnet
- Check browser console for errors

### AI executor not working
- Get FREE Gemini API key: https://makersuite.google.com/app/apikey
- Verify `GEMINI_API_KEY` is set in executor/.env
- Check backend is running
- Look at executor console for errors

## 🛠️ Advanced: Building Programs

If you want to build the Rust programs locally:

```bash
# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.29.0 anchor-cli

# Build programs
anchor build

# Deploy to local validator
solana-test-validator  # Terminal 1
anchor deploy          # Terminal 2
```

## 📚 Next Steps

- Read [agents.md](./agents.md) for complete architecture
- Review program code in `programs/`
- Customize AI prompts in `executor/src/services/aiService.ts`
- Modify UI in `frontend/app/`

## 🆘 Need Help?

- Check [README.md](./README.md) for detailed docs
- Review error logs in terminal
- Join our Discord: https://discord.gg/agentfun

## 🚀 Ready for Production?

See [DEPLOYMENT.md](./DEPLOYMENT.md) for mainnet deployment guide.

---

**Happy Building! 🤖**
