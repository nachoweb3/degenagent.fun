# Production Readiness Checklist for Mainnet-Beta

## 🔴 CRITICAL - Must Complete Before Mainnet

### 1. RPC Endpoint Configuration
- [ ] Sign up for premium RPC provider (Helius recommended)
- [ ] Update `.env.production` with RPC endpoint
- [ ] Test RPC connection and rate limits
- [ ] Configure fallback RPC endpoints

### 2. Program IDs & Addresses
- [ ] Deploy contracts to mainnet-beta
- [ ] Update `FACTORY_PROGRAM_ID` in `.env.production`
- [ ] Update `MANAGER_PROGRAM_ID` in `.env.production`
- [ ] Update `TREASURY_WALLET` with mainnet address
- [ ] Verify all program IDs are correct

### 3. Security & Secrets Management
- [ ] Generate new `ENCRYPTION_MASTER_KEY` for production (NEVER reuse dev key)
- [ ] Store encryption key in AWS Secrets Manager
- [ ] Set up AWS KMS for key management
- [ ] Configure IAM roles with least privilege
- [ ] Never commit `.env.production` to git
- [ ] Add `.env.production` to `.gitignore`

### 4. API Keys
- [ ] Get Gemini API key: https://makersuite.google.com/app/apikey
- [ ] Configure API key rotation policy
- [ ] Set up rate limiting for API usage

### 5. Database
- [ ] Set up production PostgreSQL (AWS RDS, Supabase, or Neon)
- [ ] Configure SSL/TLS for database connections
- [ ] Set up automated backups (daily minimum)
- [ ] Configure connection pooling
- [ ] Run database migrations
- [ ] Test database failover

## 🟡 IMPORTANT - Recommended Before Launch

### 6. Monitoring & Alerting
- [ ] Set up application monitoring (Datadog, New Relic, or similar)
- [ ] Configure error tracking (Sentry)
- [ ] Set up transaction monitoring
- [ ] Create alerts for failed transactions
- [ ] Monitor RPC endpoint health
- [ ] Set up portfolio value alerts
- [ ] Configure daily P&L reports

### 7. Risk Management Verification
- [ ] Review and test risk parameters in production
- [ ] Verify `maxTradeSize` is appropriate (currently 0.5 SOL)
- [ ] Test stop loss triggers
- [ ] Test position size limits (5% max)
- [ ] Verify slippage protection (0.5%)
- [ ] Test price impact limits (1% max)
- [ ] Verify minimum liquidity requirements ($50k)

### 8. Trading Engine Tests
- [ ] Test swap execution on mainnet with small amounts
- [ ] Verify Jupiter integration works on mainnet
- [ ] Test transaction confirmation logic
- [ ] Verify commission tracking
- [ ] Test error handling and retries
- [ ] Verify transaction signing
- [ ] Test concurrent trade limits

### 9. Infrastructure
- [ ] Deploy to production environment (AWS, GCP, or similar)
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Set up CDN for static assets
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure firewall rules

### 10. Performance Optimization
- [ ] Enable connection pooling
- [ ] Configure Redis for caching (optional)
- [ ] Optimize database queries
- [ ] Set up CDN for price feeds
- [ ] Configure compression (gzip/brotli)
- [ ] Optimize WebSocket connections

## 🟢 NICE TO HAVE - Post-Launch Improvements

### 11. Advanced Features
- [ ] Set up circuit breakers for rapid loss scenarios
- [ ] Implement portfolio rebalancing
- [ ] Add historical P&L tracking
- [ ] Implement advanced order types
- [ ] Add multi-sig support for large trades

### 12. Compliance & Legal
- [ ] Review regulatory requirements
- [ ] Set up terms of service
- [ ] Configure user KYC if required
- [ ] Set up audit logging
- [ ] Create incident response plan

## 📊 Risk Parameters Summary

### Production (Mainnet) Settings:
- **Max Position Size:** 5% of portfolio
- **Max Daily Loss:** 5% 
- **Max Trade Size:** 0.5 SOL (~$100)
- **Max Slippage:** 50 bps (0.5%)
- **Max Price Impact:** 1%
- **Stop Loss:** 10%
- **Take Profit:** 25%
- **Min Liquidity:** $50,000
- **Min SOL Balance:** 0.05 SOL (for fees)

### Development Settings (for reference):
- **Max Position Size:** 20% of portfolio
- **Max Daily Loss:** 10%
- **Max Trade Size:** 1 SOL
- **Max Slippage:** 100 bps (1%)
- **Max Price Impact:** 2%
- **Stop Loss:** 15%
- **Take Profit:** 50%
- **Min Liquidity:** $10,000

## 🚀 Deployment Steps

1. **Review Configuration**
   ```bash
   # Verify environment variables
   cat .env.production
   ```

2. **Run Pre-deployment Tests**
   ```bash
   npm run test
   npm run lint
   ```

3. **Build Production Bundle**
   ```bash
   npm run build
   ```

4. **Deploy to Production**
   ```bash
   # Copy .env.production to production server
   # Start with production environment
   NODE_ENV=production npm start
   ```

5. **Verify Deployment**
   - Check RPC connection
   - Verify database connectivity
   - Test a small trade
   - Monitor logs for errors

## 📞 Emergency Contacts

- **RPC Provider Support:** [Your Helius support contact]
- **Database Support:** [Your DB provider support]
- **On-call Engineer:** [Your contact]
- **Security Team:** [Your contact]

## 🔒 Security Reminders

1. **NEVER** commit `.env.production` to git
2. **ALWAYS** use AWS Secrets Manager or similar for production secrets
3. **ROTATE** API keys regularly (monthly minimum)
4. **MONITOR** all transactions for suspicious activity
5. **LIMIT** trade sizes until system is proven
6. **TEST** with small amounts first
7. **BACKUP** database before any major changes

## 📝 Pre-Launch Checklist

Final checks before going live:

- [ ] All critical items completed
- [ ] Test transactions successful on mainnet
- [ ] Monitoring and alerts configured
- [ ] Team briefed on emergency procedures
- [ ] Backup and recovery tested
- [ ] Risk parameters reviewed and approved
- [ ] Legal and compliance review complete
- [ ] Customer support prepared

---

**IMPORTANT:** Start with VERY small trade sizes and gradually increase as confidence grows. Monitor closely for the first 24-48 hours.
