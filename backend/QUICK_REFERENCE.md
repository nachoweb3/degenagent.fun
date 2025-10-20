# Quick Reference Card - Production Mainnet

## Files Modified

1. `backend/.env.production` - NEW (production config)
2. `backend/src/services/riskManager.ts` - UPDATED (conservative risk)
3. `backend/src/services/tradingEngine.ts` - UPDATED (tighter limits)

## Risk Parameters

### Production (Mainnet):
- Max trade: 0.5 SOL
- Max position: 5% of portfolio
- Slippage: 0.5% (50 bps)
- Price impact: 1% max
- Min liquidity: $50,000

### Development (Devnet):
- Max trade: 1 SOL
- Max position: 20% of portfolio
- Slippage: 1% (100 bps)
- Price impact: 2% max
- Min liquidity: $10,000

## RPC Endpoint

**RECOMMENDED: Helius Pro**
- Cost: $299/month
- Speed: 500 req/sec
- Uptime: 99.9% SLA
- URL: https://mainnet.helius-rpc.com/?api-key=YOUR_KEY

**Get it:** https://www.helius.dev/

## API Keys Needed

1. **Helius RPC** - $299/month (CRITICAL)
2. **Gemini AI** - Free tier (OPTIONAL)
3. **AWS Secrets Manager** - ~$5/month (CRITICAL)
4. **Database** - $25/month (CRITICAL)

**Total: ~$329/month**

## Critical TODOs

- [ ] Get Helius API key
- [ ] Update RPC_ENDPOINT in .env.production
- [ ] Deploy programs to mainnet
- [ ] Update FACTORY_PROGRAM_ID
- [ ] Update MANAGER_PROGRAM_ID
- [ ] Generate new ENCRYPTION_MASTER_KEY
- [ ] Move secrets to AWS Secrets Manager
- [ ] Configure production database

## Quick Start

```bash
# 1. Copy production env
cp .env.production .env

# 2. Edit with your keys
nano .env

# 3. Test build
npm run build

# 4. Start in production mode
NODE_ENV=production npm start
```

## Emergency Contacts

- Helius Support: support@helius.dev
- Helius Status: https://status.helius.dev/

## Safety Rules

1. START with 0.01 SOL trades
2. MONITOR every transaction
3. NEVER commit .env.production
4. USE AWS Secrets Manager
5. TEST failover procedures

## Documentation

- `PRODUCTION_SUMMARY.md` - Overview
- `API_KEYS_SETUP.md` - Get API keys
- `RPC_PROVIDERS.md` - RPC comparison
- `PRODUCTION_READINESS.md` - Full checklist
- `MAINNET_VERIFICATION.md` - Code review

---
Last updated: 2025-10-20
