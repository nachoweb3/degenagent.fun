# Production Deployment Guide - Agent.fun Backend

## 🎯 Overview

This guide covers deploying the Agent.fun backend for 24/7 uptime with auto-restart, monitoring, and zero-downtime updates.

---

## 📋 Prerequisites

- Node.js 18+ installed
- PM2 process manager
- PostgreSQL (production) or SQLite (dev)
- (Optional) Docker & Docker Compose
- (Optional) Nginx for reverse proxy
- SSL certificate (Let's Encrypt recommended)

---

## 🚀 Deployment Methods

### Method 1: PM2 (Recommended for VPS)

PM2 keeps your backend running 24/7 with automatic restarts.

#### 1. Install PM2 Globally

```bash
npm install -g pm2
```

#### 2. Configure Environment

```bash
# Copy production template
cp .env.production .env

# Edit with your values
nano .env
```

#### 3. Build and Start

**Linux/Mac:**
```bash
chmod +x scripts/start-production.sh
./scripts/start-production.sh
```

**Windows:**
```powershell
.\scripts\start-production.ps1
```

#### 4. Verify It's Running

```bash
pm2 status
pm2 logs agent-fun-backend
```

#### 5. Setup Auto-Start on Boot

```bash
pm2 startup
pm2 save
```

Now your backend will automatically start when the server reboots!

---

### Method 2: Docker (Recommended for Cloud)

Docker provides isolated environments and easy scaling.

#### 1. Build and Run with Docker Compose

```bash
# Create .env file first
cp .env.production .env

# Edit .env with your values
nano .env

# Start all services
docker-compose up -d
```

This starts:
- Backend (with PM2 inside container)
- PostgreSQL database
- Redis cache
- Nginx reverse proxy

#### 2. View Logs

```bash
docker-compose logs -f backend
```

#### 3. Stop/Restart

```bash
# Stop
docker-compose down

# Restart single service
docker-compose restart backend

# Rebuild after code changes
docker-compose up -d --build
```

---

## 🔧 Configuration

### PM2 Configuration (`ecosystem.config.js`)

Key features enabled:

```javascript
{
  autorestart: true,           // Auto-restart on crash
  max_memory_restart: '1G',     // Restart if memory > 1GB
  min_uptime: '10s',            // Minimum uptime before restart
  max_restarts: 10,             // Max restart attempts
  cron_restart: '0 3 * * *',    // Daily restart at 3 AM
  health_check: {               // Health monitoring
    enable: true,
    endpoint: '/health',
    interval: 30000,
    max_fails: 3
  }
}
```

### Environment Variables

Critical variables in `.env`:

```bash
# Production RPC (use dedicated provider)
RPC_ENDPOINT=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY

# Database (use PostgreSQL in production)
DATABASE_URL=postgresql://user:pass@localhost:5432/agentfun

# Security keys
ENCRYPTION_MASTER_KEY=your_32_char_key_here
```

---

## 🏥 Health Monitoring

### Built-in Health Check

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "status": "ok",
  "network": "https://api.mainnet-beta.solana.com",
  "blockHeight": 123456789,
  "timestamp": "2025-10-20T..."
}
```

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# Status overview
pm2 status

# CPU and memory usage
pm2 list
```

### Advanced Monitoring (Optional)

**Sentry for Error Tracking:**
```bash
# Add to .env
SENTRY_DSN=https://...@sentry.io/...
```

**New Relic for Performance:**
```bash
# Add to .env
NEW_RELIC_LICENSE_KEY=your_key_here
```

---

## 🔄 Zero-Downtime Updates

### With PM2

```bash
# Pull latest code
git pull

# Install dependencies
npm ci --only=production

# Build
npm run build

# Reload without downtime
pm2 reload agent-fun-backend
```

### With Docker

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build --no-deps backend
```

---

## 📊 Logs Management

### PM2 Logs

```bash
# View real-time logs
pm2 logs agent-fun-backend

# Last 100 lines
pm2 logs agent-fun-backend --lines 100

# Clear logs
pm2 flush

# Rotate logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Docker Logs

```bash
# View logs
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

---

## 🔐 Security Checklist

- [ ] Use HTTPS (SSL/TLS certificate)
- [ ] Enable firewall (only ports 80, 443, 22)
- [ ] Use environment variables for secrets
- [ ] Regular security updates (`npm audit`)
- [ ] Rate limiting enabled (Nginx)
- [ ] Database backups automated
- [ ] Encryption keys rotated regularly
- [ ] Non-root user for processes
- [ ] CORS properly configured

---

## 🌐 Reverse Proxy Setup

### Nginx Configuration

```bash
# Install Nginx
sudo apt install nginx

# Copy config
sudo cp nginx.conf /etc/nginx/nginx.conf

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal (already setup)
sudo certbot renew --dry-run
```

---

## 📈 Scaling

### Horizontal Scaling (Multiple Instances)

PM2 Cluster Mode:
```javascript
// ecosystem.config.js
{
  instances: 'max',  // Use all CPU cores
  exec_mode: 'cluster'
}
```

### Load Balancer

Use Nginx upstream:
```nginx
upstream backend {
    server localhost:3001;
    server localhost:3002;
    server localhost:3003;
}
```

---

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check PM2 logs
pm2 logs agent-fun-backend

# Check if port is in use
lsof -i :3001

# Restart PM2
pm2 restart all
```

### High Memory Usage

```bash
# Check memory
pm2 list

# Increase limit in ecosystem.config.js
max_memory_restart: '2G'

# Restart
pm2 restart agent-fun-backend
```

### Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -h localhost -U agentfun_user -d agentfun

# Check DATABASE_URL in .env
```

### WebSocket Not Connecting

```bash
# Check Nginx config for WebSocket support
# Should have:
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## 📦 Backup Strategy

### Database Backup

```bash
# Automated daily backup
0 2 * * * pg_dump agentfun > /backups/agentfun_$(date +\%Y\%m\%d).sql

# Restore from backup
psql agentfun < /backups/agentfun_20251020.sql
```

### Encrypted Keys Backup

```bash
# Backup .keys directory (encrypted)
tar -czf keys_backup_$(date +%Y%m%d).tar.gz .keys/

# Upload to secure storage (S3, etc)
aws s3 cp keys_backup_20251020.tar.gz s3://your-bucket/backups/
```

---

## 🎯 Performance Optimization

### Redis Caching

```javascript
// Cache price data
const redis = require('redis');
const client = redis.createClient();

// Cache for 1 minute
await client.setex(`price:${tokenMint}`, 60, JSON.stringify(price));
```

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_trades_agent ON trades(agentId);
CREATE INDEX idx_bonding_curves_tvl ON bonding_curves(totalValueLocked DESC);
```

### Connection Pooling

```javascript
// Sequelize config
{
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000
  }
}
```

---

## 📱 Monitoring Dashboard

### PM2 Plus (Paid)

Advanced monitoring with:
- Real-time metrics
- Error tracking
- Transaction tracing
- Custom alerts

```bash
pm2 link YOUR_SECRET_KEY YOUR_PUBLIC_KEY
```

### Grafana + Prometheus (Free)

Full monitoring stack:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

---

## ✅ Deployment Checklist

### Before Deploy
- [ ] Code tested locally
- [ ] All tests passing
- [ ] Dependencies updated
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] SSL certificate ready

### After Deploy
- [ ] Health check returns 200
- [ ] PM2 status shows "online"
- [ ] Logs show no errors
- [ ] WebSocket connects
- [ ] Trading endpoints work
- [ ] Database queries successful

### Weekly
- [ ] Check PM2 logs for errors
- [ ] Review system resources
- [ ] Database backup verified
- [ ] SSL certificate valid
- [ ] Security updates applied

---

## 🚨 Emergency Procedures

### Backend Crashed

```bash
# Quick restart
pm2 restart agent-fun-backend

# If still failing, check logs
pm2 logs agent-fun-backend --err

# Last resort: full restart
pm2 delete agent-fun-backend
pm2 start ecosystem.config.js
```

### Database Corrupted

```bash
# Stop backend
pm2 stop agent-fun-backend

# Restore from backup
psql agentfun < /backups/latest.sql

# Restart
pm2 start agent-fun-backend
```

### High Load

```bash
# Scale to 4 instances
pm2 scale agent-fun-backend 4

# Or use cluster mode
pm2 start ecosystem.config.js
```

---

## 📞 Support

- **Documentation**: See TESTNET_TRADING_GUIDE.md
- **Logs**: `pm2 logs agent-fun-backend`
- **Status**: `pm2 status`
- **Health**: `curl http://localhost:3001/health`

---

## 🎓 Best Practices

1. **Never commit `.env` files**
2. **Use PM2 for production** (not `npm run dev`)
3. **Enable HTTPS** in production
4. **Backup database daily**
5. **Monitor logs regularly**
6. **Update dependencies monthly**
7. **Test updates in staging first**
8. **Use dedicated RPC provider** (not public RPCs)
9. **Set up alerts** for critical errors
10. **Document all changes**

---

**Your backend is now ready for 24/7 operation! 🚀**

For questions or issues, check the logs first:
```bash
pm2 logs agent-fun-backend
```
