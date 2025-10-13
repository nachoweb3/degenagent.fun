# 🚀 Deployment Guide - Agent.fun

**Quick reference for mainnet deployment**

---

## 📊 Quick Summary

- **Cost**: 15-25 SOL ($1,500-2,500)
- **Time**: 45-60 minutes
- **Difficulty**: Medium (or let Claude handle it)
- **Tools needed**: Solana CLI, Anchor Framework

---

## 💰 Cost Breakdown

| Item | SOL | USD |
|------|-----|-----|
| Deploy agent-factory | 3-5 | $300-500 |
| Deploy agent-manager | 8-12 | $800-1,200 |
| Testing & fees | 1-2 | $100-200 |
| Buffer | 3-5 | $300-500 |
| **TOTAL** | **15-25** | **$1,500-2,500** |

**Recommended**: Fund wallet with 20-25 SOL

---

## 🎯 Deployment Options

### Option 1: Automated (Recommended)
```bash
./scripts/deploy-mainnet.sh
```
Handles everything automatically.

### Option 2: Assisted
Claude can deploy for you:
- You provide 20-25 SOL in a wallet
- Claude handles all technical steps
- 45-60 minutes total

### Option 3: Manual
Follow [MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)

---

## ⚡ Quick Start (Automated)

### Prerequisites
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.17/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked
avm install 0.29.0
```

### Deployment
```bash
# 1. Configure mainnet
solana config set --url https://api.mainnet-beta.solana.com

# 2. Verify balance (need 20-25 SOL)
solana balance

# 3. Deploy
./scripts/deploy-mainnet.sh

# 4. Initialize
ts-node scripts/initialize-mainnet.ts

# 5. Verify
./scripts/verify-mainnet.sh
```

---

## 📋 Step-by-Step

### 1. Preparation (5 min)
- Install tools
- Fund wallet with 20-25 SOL
- Configure mainnet cluster

### 2. Compilation (10 min)
```bash
anchor clean
anchor build
```

### 3. Deploy Factory (5 min)
Cost: ~3-5 SOL

### 4. Deploy Manager (10 min)
Cost: ~8-12 SOL

### 5. Initialize (2 min)
Cost: ~0.001 SOL

### 6. Test (5 min)
Create first agent: 0.5 SOL

### 7. Configure (5 min)
Update .env files with real IDs

### 8. Verify (2 min)
Run verification script

---

## 🔐 Security Options

### Temporary Wallet (Recommended)
1. Create new wallet for deployment
2. Transfer exactly 20-25 SOL
3. Share with Claude for deployment
4. Transfer remaining funds back
5. Discard temp wallet

### Screen Share
1. Video call (Discord/Zoom)
2. Claude guides you step-by-step
3. You execute commands
4. No wallet access needed

---

## ✅ Post-Deployment

### Immediate
- [ ] Verify programs on Solscan
- [ ] Test agent creation
- [ ] Update backend .env
- [ ] Restart services

### Within 24 Hours
- [ ] Deploy frontend to Vercel
- [ ] Configure custom domain
- [ ] Setup monitoring
- [ ] Announce launch

---

## 📞 Need Help?

### Assisted Deployment
Message if you want Claude to handle deployment:
- Provide 20-25 SOL wallet
- 45-60 minutes availability
- Get fully deployed dApp

### Documentation
- Full guide: [MAINNET_DEPLOYMENT.md](./MAINNET_DEPLOYMENT.md)
- Costs: [DEPLOYMENT_COSTS_MAINNET.md](./DEPLOYMENT_COSTS_MAINNET.md)
- Security: [SECURITY.md](./SECURITY.md)

---

**Ready to deploy? Let's go! 🚀**
