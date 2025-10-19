# 🚀 Deployment Guide - Agent.fun

**Quick and simple deployment to production**

---

## 🎯 Prerequisites

- ✅ Render account (https://render.com)
- ✅ Vercel account (https://vercel.com)
- ✅ Code built successfully
- ✅ Domain: www.degenagent.fun

---

## 📦 Step 1: Deploy Backend to Render

### Option A: Via Dashboard (Recommended)

1. **Go to**: https://dashboard.render.com/
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Select "Public Git repository" or "Deploy without Git"

3. **Configuration**:
   ```
   Name: degenagent-backend
   Runtime: Node
   Build Command: cd backend && npm install && npm run build
   Start Command: cd backend && npm start
   Instance Type: Free (or Starter for no sleep)
   ```

4. **Environment Variables** - Add all of these:
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

5. **Click "Create Web Service"**

6. **Wait for deployment** (~5-10 minutes)

7. **Copy your backend URL** (e.g., `https://degenagent-backend.onrender.com`)

### Verify Backend
```bash
curl https://YOUR-BACKEND-URL.onrender.com/health

# Should return:
{
  "status": "ok",
  "network": "https://api.devnet.solana.com",
  "blockHeight": 123456789
}
```

---

## 🌐 Step 2: Deploy Frontend to Vercel

### Using Vercel CLI

```bash
cd frontend

# Set environment variables
vercel env rm NEXT_PUBLIC_BACKEND_API production --yes
echo "https://YOUR-BACKEND-URL.onrender.com/api" | vercel env add NEXT_PUBLIC_BACKEND_API production

vercel env rm NEXT_PUBLIC_RPC_ENDPOINT production --yes
echo "https://api.devnet.solana.com" | vercel env add NEXT_PUBLIC_RPC_ENDPOINT production

vercel env rm NEXT_PUBLIC_NETWORK production --yes
echo "devnet" | vercel env add NEXT_PUBLIC_NETWORK production

vercel env rm NEXT_PUBLIC_SITE_URL production --yes
echo "https://www.degenagent.fun" | vercel env add NEXT_PUBLIC_SITE_URL production

# Deploy to production
vercel --prod
```

### Via Vercel Dashboard

1. **Go to**: https://vercel.com/dashboard
2. **Import Project** or select existing
3. **Settings → Environment Variables**
4. **Add**:
   - `NEXT_PUBLIC_RPC_ENDPOINT` = `https://api.devnet.solana.com`
   - `NEXT_PUBLIC_BACKEND_API` = `https://YOUR-BACKEND-URL/api`
   - `NEXT_PUBLIC_NETWORK` = `devnet`
   - `NEXT_PUBLIC_SITE_URL` = `https://www.degenagent.fun`

5. **Deployments → Redeploy**

---

## 🔗 Step 3: Connect Custom Domain

### In Vercel Dashboard

1. **Go to** your project → Settings → Domains
2. **Add** `www.degenagent.fun`
3. **Add** `degenagent.fun` (will redirect to www)
4. **Follow DNS instructions** to point domain to Vercel

---

## ✅ Step 4: Verification Checklist

- [ ] Backend health check responds correctly
- [ ] Frontend loads at www.degenagent.fun
- [ ] Wallet connects successfully
- [ ] Agent creation form loads
- [ ] No CORS errors in browser console (F12)
- [ ] All pages accessible
- [ ] Mobile responsive

---

## 🧪 Step 5: Test Agent Creation

1. **Get Devnet SOL**: https://faucet.solana.com/
2. **Open**: https://www.degenagent.fun/create
3. **Connect wallet**
4. **Fill form** and create test agent
5. **Sign transaction**
6. **Verify** agent appears on platform

---

## 🔄 Updating Deployment

### Backend Updates
```bash
# Code changes are auto-deployed from Git
# Or manually redeploy in Render dashboard
```

### Frontend Updates
```bash
cd frontend
vercel --prod
```

---

## 🐛 Troubleshooting

### Backend Issues

**"Application failed to respond"**
- Check `PORT=3001` is set in env vars
- Verify build command is correct
- Check logs in Render dashboard

**"Database connection error"**
- Add `DATABASE_URL` if using PostgreSQL
- Check database is running

### Frontend Issues

**"Failed to fetch" errors**
- Verify `NEXT_PUBLIC_BACKEND_API` is correct
- Check backend is running
- Verify CORS settings

**"Wallet won't connect"**
- Ensure you're on correct network (devnet)
- Try different wallet
- Check browser console for errors

---

## 📊 Monitoring

### Check Health
```bash
# Backend
curl https://YOUR-BACKEND.onrender.com/health

# Frontend
curl https://www.degenagent.fun

# Specific API endpoint
curl https://YOUR-BACKEND.onrender.com/api/agent/list
```

### Logs
- **Render**: Dashboard → Your Service → Logs
- **Vercel**: Dashboard → Your Project → Deployments → View Logs

---

## 🚀 Going to Mainnet

When ready for mainnet:

1. **Update environment variables**:
   ```bash
   RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
   NEXT_PUBLIC_NETWORK=mainnet-beta
   ```

2. **Deploy Solana programs** to mainnet

3. **Update program IDs** in env vars

4. **Test with small amounts** first

5. **Monitor closely**

---

## 💡 Tips

- **Free Tier**: Render free tier sleeps after 15min inactivity
- **Upgrade**: Consider paid plans for production
- **Monitoring**: Set up uptime monitoring (UptimeRobot)
- **Backups**: Configure automated database backups
- **Scaling**: Monitor usage and scale as needed

---

**That's it!** Your platform should be live at https://www.degenagent.fun

Need help? Check DOCUMENTATION.md or open an issue.
