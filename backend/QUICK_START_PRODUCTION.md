# Quick Start: Running Backend 24/7

## ⚡ TL;DR

```bash
# Install PM2
npm install -g pm2

# Setup environment
cp .env.production .env
# Edit .env with your values

# Build
npm run build

# Start 24/7
npm run prod

# Check status
pm2 status
```

Done! Your backend now runs 24/7 with auto-restart.

---

## 🚀 3 Simple Steps

### Step 1: Install PM2

```bash
npm install -g pm2
```

PM2 is a production process manager that:
- ✅ Keeps your app running 24/7
- ✅ Auto-restarts on crashes
- ✅ Monitors CPU & memory
- ✅ Shows real-time logs
- ✅ Restarts on server reboot

### Step 2: Configure

```bash
# Copy template
cp .env.production .env

# Edit with your values
nano .env
```

Minimum required in `.env`:
```bash
PORT=3001
RPC_ENDPOINT=https://api.devnet.solana.com
ENCRYPTION_MASTER_KEY=your_32_character_encryption_key_here
TREASURY_WALLET=your_wallet_address
```

### Step 3: Start

```bash
# Build TypeScript
npm run build

# Start with PM2
npm run prod
```

✅ **That's it!** Your backend is now running 24/7.

---

## 📊 Managing Your Backend

### View Status

```bash
pm2 status
```

Output:
```
┌─────┬──────────────────────┬─────────┬─────────┬──────┐
│ id  │ name                 │ status  │ cpu     │ mem  │
├─────┼──────────────────────┼─────────┼─────────┼──────┤
│ 0   │ agent-fun-backend    │ online  │ 2%      │ 120M │
└─────┴──────────────────────┴─────────┴─────────┴──────┘
```

### View Logs

```bash
# Real-time logs
pm2 logs agent-fun-backend

# Last 100 lines
pm2 logs --lines 100
```

### Restart

```bash
npm run prod:restart
```

### Stop

```bash
npm run prod:stop
```

### Monitor Resources

```bash
npm run prod:monit
```

Shows live CPU/memory usage.

---

## 🔄 Updates & Deployment

When you have new code:

```bash
# Pull changes
git pull

# Install dependencies (if changed)
npm install

# Rebuild
npm run build

# Reload without downtime
pm2 reload agent-fun-backend
```

PM2 reloads gracefully - no requests are lost!

---

## 🏥 Health Check

```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}
```

---

## 🐛 Troubleshooting

### Backend not starting?

```bash
# Check logs for errors
pm2 logs agent-fun-backend --err

# Restart
pm2 restart agent-fun-backend
```

### Port already in use?

```bash
# Check what's using port 3001
lsof -i :3001  # Mac/Linux
netstat -ano | findstr :3001  # Windows

# Kill the process or change PORT in .env
```

### High memory usage?

```bash
# Check current usage
pm2 status

# Restart to free memory
pm2 restart agent-fun-backend
```

---

## 🎯 Common Commands

```bash
# Start production
npm run prod

# Stop
npm run prod:stop

# Restart
npm run prod:restart

# View logs
npm run prod:logs

# Monitor resources
npm run prod:monit

# Status
pm2 status

# List all processes
pm2 list

# Delete process
pm2 delete agent-fun-backend
```

---

## 📱 Auto-Start on Reboot

Make backend start automatically when server reboots:

```bash
# Generate startup script
pm2 startup

# Follow instructions shown
# Then save current processes
pm2 save
```

Now PM2 will start your backend automatically on server restart!

---

## 🔐 Security Tips

1. **Never commit `.env` file**
   ```bash
   # .gitignore already includes this
   ```

2. **Use strong encryption key**
   ```bash
   # Generate secure key
   openssl rand -hex 32
   ```

3. **Use dedicated RPC**
   ```bash
   # Don't use public RPCs in production
   RPC_ENDPOINT=https://your-dedicated-rpc.com
   ```

4. **Enable firewall**
   ```bash
   # Only allow necessary ports
   ufw allow 22   # SSH
   ufw allow 80   # HTTP
   ufw allow 443  # HTTPS
   ufw enable
   ```

---

## 🎓 Next Steps

1. ✅ Backend running 24/7
2. 📊 Monitor with `pm2 monit`
3. 📝 Check logs occasionally
4. 🔄 Update when needed
5. 🌐 Setup Nginx (optional)
6. 🔐 Add SSL certificate (optional)

---

## 📚 More Info

- **Full guide**: See `PRODUCTION_DEPLOYMENT.md`
- **Testing**: See `TESTNET_TRADING_GUIDE.md`
- **PM2 docs**: https://pm2.keymetrics.io/

---

**Your backend is now running 24/7! 🚀**

Check status anytime with:
```bash
pm2 status
```
