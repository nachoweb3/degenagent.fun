# Solana RPC Provider Comparison for Production Trading

## Why You Need a Premium RPC for Production

The default public RPCs (api.mainnet-beta.solana.com) are:
- ❌ Rate limited (heavily)
- ❌ Unreliable for production
- ❌ No SLA guarantees
- ❌ Slower transaction confirmation
- ❌ No WebSocket support
- ❌ No priority support

## Recommended Providers

### 🥇 #1: Helius (RECOMMENDED)

**Why Helius is Best for Trading:**
- ✅ **500 requests/second** on Pro tier
- ✅ **99.9% uptime SLA**
- ✅ **Enhanced transaction success rates** (priority fee optimization)
- ✅ **WebSocket support** for real-time updates
- ✅ **Dedicated infrastructure** per account
- ✅ **Transaction simulation** API
- ✅ **Advanced filtering** for better performance
- ✅ **Excellent support** team

**Pricing:**
- **Free Tier:** 100 req/day (NOT for production)
- **Developer:** $99/month - 1M requests
- **Pro:** $299/month - 10M requests (RECOMMENDED)
- **Business:** Custom pricing - Unlimited

**Setup:**
1. Sign up at https://www.helius.dev/
2. Create API key
3. Use endpoint: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`

**Best For:**
- High-frequency trading
- Real-time price monitoring
- Critical production systems
- Applications requiring high reliability

---

### 🥈 #2: Triton (RPC Pool)

**Why Triton:**
- ✅ **Decentralized RPC pool** (multiple providers)
- ✅ **Automatic failover** between nodes
- ✅ **Geographic distribution** (lower latency)
- ✅ **Good for redundancy**
- ⚠️ Slightly higher latency than Helius
- ⚠️ Less control over infrastructure

**Pricing:**
- **Free Tier:** 250 req/min
- **Growth:** $40/month - 1000 req/min
- **Pro:** $150/month - 5000 req/min

**Setup:**
1. Sign up at https://triton.one/
2. Create API key
3. Use endpoint: `https://rpc-mainnet.triton.one/?api-key=YOUR_KEY`

**Best For:**
- Multi-region deployments
- Backup/fallback RPC
- Cost-conscious projects with moderate traffic

---

### 🥉 #3: QuickNode

**Why QuickNode:**
- ✅ **100% dedicated nodes** (no sharing)
- ✅ **Global edge network**
- ✅ **Advanced analytics** dashboard
- ✅ **Add-ons** for NFTs, indexing
- ⚠️ More expensive than alternatives
- ⚠️ Overkill for simple trading bots

**Pricing:**
- **Build:** $49/month - 20M credits (~2M requests)
- **Scale:** $299/month - 200M credits
- **Enterprise:** Custom pricing

**Setup:**
1. Sign up at https://www.quicknode.com/
2. Create Solana mainnet endpoint
3. Use your custom endpoint URL

**Best For:**
- Large enterprises
- Applications needing NFT indexing
- Projects requiring advanced analytics

---

### 🏅 #4: Alchemy

**Why Alchemy:**
- ✅ **Free tier is generous** (300M compute units)
- ✅ **Good documentation**
- ✅ **Reliable infrastructure**
- ⚠️ Newer to Solana (more mature on EVM chains)
- ⚠️ Less Solana-specific features than Helius

**Pricing:**
- **Free:** 300M compute units/month
- **Growth:** $49/month - 1.5B compute units
- **Scale:** $199/month - 10B compute units

**Setup:**
1. Sign up at https://www.alchemy.com/
2. Create Solana mainnet app
3. Use endpoint: `https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY`

**Best For:**
- Multi-chain applications
- Projects already using Alchemy for other chains
- Getting started with generous free tier

---

## Our Recommendation for Agent.fun

### For Production Launch: **Helius Pro** ($299/month)

**Justification:**
1. **Trading requires reliability** - Helius has the best uptime SLA
2. **Transaction success matters** - Helius optimizes priority fees
3. **Real-time is critical** - WebSocket support for instant updates
4. **Solana-native** - Built specifically for Solana, not an afterthought
5. **Support** - Critical when trading real money

### Fallback Strategy: **Triton Free/Growth** ($0-40/month)

Configure Triton as a fallback in case Helius has issues:

```typescript
// Example fallback configuration
const RPC_ENDPOINTS = [
  'https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_KEY', // Primary
  'https://rpc-mainnet.triton.one/?api-key=YOUR_TRITON_KEY', // Fallback
];
```

---

## Cost Estimation

### For a Typical Trading Bot:

**Requests per day:**
- Price checks: ~2,880 (every 30s)
- Balance checks: ~1,440 (every minute)
- Transaction submissions: ~100
- **Total: ~4,500 requests/day**

**Monthly:** ~135,000 requests

**Recommended tier:** Helius Developer ($99/month) or Pro ($299/month) for safety margin

---

## Setup Instructions

### 1. Update .env.production

```bash
# Primary RPC (Helius)
RPC_ENDPOINT=https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY

# Optional: Fallback RPC
RPC_FALLBACK=https://rpc-mainnet.triton.one/?api-key=YOUR_TRITON_KEY
```

### 2. Get Your Helius API Key

1. Go to https://www.helius.dev/
2. Sign up for an account
3. Navigate to "API Keys"
4. Create new API key
5. Select "Mainnet" network
6. Choose your plan (Pro recommended)
7. Copy the API key

### 3. Test Connection

```bash
# Test your RPC endpoint
curl -X POST https://mainnet.helius-rpc.com/?api-key=YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"getHealth"}'
```

Expected response:
```json
{"jsonrpc":"2.0","result":"ok","id":1}
```

---

## Monitoring RPC Performance

### Key Metrics to Track:

1. **Request Latency**
   - Target: <100ms for quotes
   - Target: <200ms for transactions

2. **Success Rate**
   - Target: >99% success rate
   - Alert if drops below 95%

3. **Rate Limit Hits**
   - Monitor for 429 errors
   - Upgrade tier if frequently hitting limits

4. **Transaction Confirmation Time**
   - Target: <30 seconds
   - Alert if >60 seconds

### Sample Monitoring Code:

```typescript
import { Connection } from '@solana/web3.js';

async function monitorRPCHealth() {
  const start = Date.now();
  try {
    await connection.getSlot();
    const latency = Date.now() - start;
    console.log(`RPC latency: ${latency}ms`);
    
    if (latency > 500) {
      console.warn('High RPC latency detected!');
    }
  } catch (error) {
    console.error('RPC health check failed:', error);
  }
}

// Run every minute
setInterval(monitorRPCHealth, 60000);
```

---

## Emergency Procedures

### If Primary RPC Fails:

1. **Automatic Failover** (implement this):
   ```typescript
   const connections = [
     new Connection(HELIUS_RPC),
     new Connection(TRITON_RPC),
   ];
   
   async function getHealthyConnection() {
     for (const conn of connections) {
       try {
         await conn.getSlot();
         return conn;
       } catch (e) {
         continue;
       }
     }
     throw new Error('All RPC endpoints down!');
   }
   ```

2. **Alert team immediately**
3. **Check provider status page**
4. **Switch to backup RPC**
5. **Contact provider support**

---

## Summary

| Provider | Price/Month | Requests | Best For | Rating |
|----------|-------------|----------|----------|--------|
| **Helius** | $299 | 10M | Production trading | ⭐⭐⭐⭐⭐ |
| **Triton** | $150 | High | Backup/redundancy | ⭐⭐⭐⭐ |
| **QuickNode** | $299 | 20M credits | Enterprise | ⭐⭐⭐⭐ |
| **Alchemy** | $199 | 10B compute | Multi-chain | ⭐⭐⭐ |

**Final Recommendation:** Start with **Helius Pro** ($299/month) and add **Triton Growth** ($40/month) as backup.

**Total Cost:** ~$340/month for production-grade infrastructure
**Value:** Peace of mind for automated trading with real money
