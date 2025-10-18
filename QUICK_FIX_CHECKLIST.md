# ✅ Quick Fix Checklist

## Before Testing

- [ ] Backend is running: `cd backend && npm run dev`
- [ ] Frontend is running: `cd frontend && npm run dev`
- [ ] Database file exists: `backend/data/agent-fun.db`
- [ ] `.env` file has `ENCRYPTION_MASTER_KEY` set

## Test Steps

### 1. Test Backend Health
```bash
curl http://localhost:3001/health
```
Should return: `{"status":"ok",...}`

### 2. Run Automated Test
```bash
cd backend
npx tsx src/tests/agentCreationTest.ts
```
Should show: `🎉 All tests passed!`

### 3. Manual UI Test
1. Open http://localhost:3000/create
2. Connect Phantom/Solflare wallet
3. Fill in:
   - Name: "TestBot"
   - Symbol: "TBOT"
   - Purpose: "Test trading bot"
   - Upload an image
4. Click "Launch Agent (0.1 SOL)"
5. Approve transaction in wallet
6. Wait for confirmation
7. Should redirect to agent page

## Expected Results

✅ No console errors
✅ Transaction confirms on Solana
✅ Agent appears in database
✅ Redirect to `/agent/[pubkey]` page

## If It Fails

### Check Backend Logs
Look for:
- ❌ "ENCRYPTION_MASTER_KEY not set"
- ❌ "Failed to save agent keypair"
- ❌ Database errors

### Check Frontend Console
Look for:
- ❌ "Failed to create agent"
- ❌ Network errors (CORS, 404, 500)
- ❌ Transaction errors

### Common Fixes

**Backend won't start:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Frontend won't start:**
```bash
cd frontend
rm -rf node_modules .next package-lock.json
npm install
npm run dev
```

**Database locked:**
```bash
cd backend/data
rm agent-fun.db
# Restart backend (will recreate)
```

**Missing dependencies:**
```bash
cd backend
npm install @solana/web3.js @solana/spl-token @coral-xyz/anchor
```

## Files Changed

✅ `backend/src/controllers/agentController.ts` - Added DB save
✅ `backend/src/services/solana.ts` - Fixed signing
✅ `frontend/app/create/page.tsx` - Fixed transaction handling

## New Files

✅ `backend/src/tests/agentCreationTest.ts` - Test script
✅ `AGENT_CREATION_FIX.md` - Full documentation
✅ `QUICK_FIX_CHECKLIST.md` - This file

---

**Status:** 🟢 Ready to test!

**Need help?** Check `AGENT_CREATION_FIX.md` for detailed explanation.
