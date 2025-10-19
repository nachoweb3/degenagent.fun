# 🚀 START HERE - Deploy Agent.fun to Production (DEVNET)

**Status:** Ready to deploy! ✅

---

## ✅ WHAT'S ALREADY DONE

1. ✅ **Frontend deployed** to Vercel (https://degenagent.fun)
2. ✅ **Backend compiled** and ready
3. ✅ **Environment variables** configured for DEVNET
4. ✅ **Railway CLI** installed
5. ✅ **Deployment scripts** created

---

## 🎯 WHAT YOU NEED TO DO (3 SIMPLE STEPS)

### Step 1: Deploy Backend to Railway (5 minutes)

**Double-click this file:**
```
DEPLOY_RAILWAY_SCRIPT.bat
```

This script will:
- Log you into Railway (opens browser)
- Initialize Railway project
- Deploy your backend
- Configure all environment variables
- Give you the backend URL

**IMPORTANT:** After it finishes, copy the URL it shows (something like `https://xxx.railway.app`)

---

### Step 2: Update Frontend with New Backend URL (2 minutes)

**Double-click this file:**
```
DEPLOY_UPDATE_FRONTEND.bat
```

When it asks, paste the Railway URL you copied from Step 1.

This script will:
- Update Vercel environment variables
- Redeploy frontend with new backend URL

---

### Step 3: Test Everything (5 minutes)

1. **Get devnet SOL:**
   - Go to: https://faucet.solana.com/
   - Enter your wallet address
   - Request 2 SOL

2. **Test agent creation:**
   - Open: https://degenagent.fun/create
   - Connect your wallet (make sure it's on devnet)
   - Fill out the form
   - Click "Launch Agent"
   - Sign the transaction

3. **Verify:**
   - Agent should be created successfully
   - Check transaction on Solana Explorer (devnet)

---

## 📁 REFERENCE FILES

If you need more details or run into issues:

- **`DEPLOY_NOW_GITHUB_ISSUES.md`** - Alternative deployment methods
- **`RENDER_MANUAL_DEPLOY.md`** - Render deployment guide (if you prefer Render)
- **`DEPLOYMENT_SUMMARY.md`** - Complete status and configuration details
- **`STATUS_ACTUAL.md`** - Original project status

---

## ⚡ QUICK START (Copy & Paste)

If you prefer manual commands, open PowerShell and run:

```powershell
# 1. Deploy backend
cd C:\Users\Usuario\Desktop\Agent.fun\backend
railway login
railway init
railway up

# 2. Set variables (after login and init)
railway variables set RPC_ENDPOINT=https://api.devnet.solana.com
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set ALLOWED_ORIGINS=https://degenagent.fun,https://www.degenagent.fun
railway variables set TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
railway variables set ADMIN_WALLET_ADDRESS=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
railway variables set ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
railway variables set ENCRYPTION_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
railway variables set FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
railway variables set MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
railway variables set COMMISSION_RATE=0.5
railway variables set REFERRAL_COMMISSION_RATE=10
railway variables set MIN_TRADE_FOR_COMMISSION=10

# 3. Get URL
railway domain

# 4. Update frontend (replace <URL> with your Railway URL)
cd ..\frontend
vercel env rm NEXT_PUBLIC_BACKEND_API production --yes
echo "<YOUR_RAILWAY_URL>/api" | vercel env add NEXT_PUBLIC_BACKEND_API production
vercel --prod
```

---

## 🔍 VERIFICATION CHECKLIST

After deployment:

- [ ] Railway backend is deployed and running
- [ ] Backend URL obtained from `railway domain`
- [ ] Frontend updated with new backend URL
- [ ] Frontend redeployed to Vercel
- [ ] Health check works: `curl <BACKEND_URL>/health`
- [ ] Frontend opens without errors
- [ ] Wallet connects successfully
- [ ] Agent creation works on devnet

---

## ❓ TROUBLESHOOTING

### "railway: command not found"
- Railway CLI installed but not in PATH
- Restart your terminal/PowerShell
- Or run: `npm install -g @railway/cli` again

### "Cannot login in non-interactive mode"
- Use the `.bat` script files instead
- They will open your browser for login

### "CORS error" in browser
- Make sure ALLOWED_ORIGINS includes your domain
- Check Railway variables with: `railway variables`

### Backend not responding
- Check Railway logs: `railway logs`
- Verify PORT=3001 is set
- Check all env variables are configured

---

## 📞 CURRENT CONFIGURATION

**Network:** Devnet (testnet)
**Frontend:** https://degenagent.fun (Vercel)
**Backend:** Will be on Railway (you'll get URL after deployment)

**Environment:**
- RPC: https://api.devnet.solana.com
- Network: devnet
- All wallets and transactions will be on devnet (safe testing)

---

## 🎯 EXPECTED TIMELINE

- **Step 1 (Railway deploy):** 5-10 minutes
- **Step 2 (Frontend update):** 2-3 minutes
- **Step 3 (Testing):** 5 minutes
- **Total:** ~15-20 minutes

---

## ✨ AFTER TESTING ON DEVNET

Once everything works perfectly on devnet:

1. **Monitor for a few days**
2. **Test all features thoroughly**
3. **When ready for mainnet:**
   - Update RPC endpoints to mainnet
   - Update all environment variables
   - Redeploy both frontend and backend
   - Use real SOL

---

## 🚀 LET'S GO!

**Your next action:**

Double-click: **`DEPLOY_RAILWAY_SCRIPT.bat`**

---

Good luck! Your application is ready to go live! 🎉
