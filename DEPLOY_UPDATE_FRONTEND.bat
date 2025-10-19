@echo off
echo ========================================
echo UPDATE FRONTEND - Agent.fun
echo ========================================
echo.

set /p BACKEND_URL="Enter your Railway backend URL (e.g., https://xxx.railway.app): "

if "%BACKEND_URL%"=="" (
    echo ERROR: No URL provided
    pause
    exit /b 1
)

echo.
echo Backend URL: %BACKEND_URL%
echo.

REM Navigate to frontend directory
cd /d "%~dp0frontend"

echo Step 1: Removing old backend API variable...
echo.
vercel env rm NEXT_PUBLIC_BACKEND_API production --yes

echo.
echo Step 2: Adding new backend API variable...
echo.
echo %BACKEND_URL%/api | vercel env add NEXT_PUBLIC_BACKEND_API production

echo.
echo Step 3: Redeploying frontend to production...
echo.
vercel --prod

echo.
echo ========================================
echo FRONTEND UPDATE COMPLETE!
echo ========================================
echo.
echo Your application should now be live at:
echo https://degenagent.fun
echo.
echo Verification steps:
echo 1. Open: https://degenagent.fun/create
echo 2. Open DevTools (F12)
echo 3. Connect wallet
echo 4. Try creating an agent
echo.
pause
