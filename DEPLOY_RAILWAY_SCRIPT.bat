@echo off
echo ========================================
echo RAILWAY DEPLOYMENT - Agent.fun Backend
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0backend"

echo Step 1: Logging into Railway...
echo (This will open your browser)
echo.
railway login
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Railway login failed
    pause
    exit /b 1
)

echo.
echo Step 2: Initializing Railway project...
echo.
railway init
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Railway init failed
    pause
    exit /b 1
)

echo.
echo Step 3: Deploying backend to Railway...
echo.
railway up
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Railway deployment failed
    pause
    exit /b 1
)

echo.
echo Step 4: Setting environment variables...
echo.

railway variables set RPC_ENDPOINT=https://api.devnet.solana.com
railway variables set NODE_ENV=production
railway variables set PORT=3001
railway variables set ALLOWED_ORIGINS=https://degenagent.fun,https://www.degenagent.fun,http://localhost:3000
railway variables set TREASURY_WALLET=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
railway variables set ADMIN_WALLET_ADDRESS=46hYFV39fxucRsidrE1qffXNXiZykX8yG9qNnmeia3ez
railway variables set ENCRYPTION_MASTER_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
railway variables set ENCRYPTION_KEY=10f52181f531fd093e5f9a9b38e634e4dac2c4f11e6186532a275c316d7b32a3
railway variables set FACTORY_PROGRAM_ID=Factory11111111111111111111111111111111111
railway variables set MANAGER_PROGRAM_ID=Manager11111111111111111111111111111111111
railway variables set COMMISSION_RATE=0.5
railway variables set REFERRAL_COMMISSION_RATE=10
railway variables set MIN_TRADE_FOR_COMMISSION=10

echo.
echo Step 5: Getting deployment URL...
echo.
railway domain

echo.
echo ========================================
echo DEPLOYMENT COMPLETE!
echo ========================================
echo.
echo IMPORTANT: Copy the URL shown above
echo.
echo Next steps:
echo 1. Copy the Railway URL (something like https://xxx.railway.app)
echo 2. Run: DEPLOY_UPDATE_FRONTEND.bat
echo.
pause
