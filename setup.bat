@echo off
echo.
echo ========================================
echo    AGENT.FUN Setup Script (Windows)
echo ========================================
echo.

REM Check Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js not found. Please install Node.js 20+ first.
    pause
    exit /b 1
)

echo [OK] Node.js detected:
node -v
echo.

REM Install Backend
echo [INFO] Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install backend dependencies
    pause
    exit /b 1
)
echo [OK] Backend dependencies installed
cd ..
echo.

REM Install Frontend
echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install frontend dependencies
    pause
    exit /b 1
)
echo [OK] Frontend dependencies installed
cd ..
echo.

REM Install Executor
echo [INFO] Installing executor dependencies...
cd executor
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install executor dependencies
    pause
    exit /b 1
)
echo [OK] Executor dependencies installed
cd ..
echo.

REM Setup environment files
echo [INFO] Setting up environment files...

if not exist backend\.env (
    copy backend\.env.example backend\.env
    echo [OK] Created backend\.env
    echo [WARN] Please edit backend\.env with your configuration
) else (
    echo [INFO] backend\.env already exists
)

if not exist frontend\.env.local (
    copy frontend\.env.local.example frontend\.env.local
    echo [OK] Created frontend\.env.local
) else (
    echo [INFO] frontend\.env.local already exists
)

if not exist executor\.env (
    copy executor\.env.example executor\.env
    echo [OK] Created executor\.env
    echo [WARN] Please add your GEMINI_API_KEY to executor\.env
    echo [INFO] Get FREE key at: https://makersuite.google.com/app/apikey
) else (
    echo [INFO] executor\.env already exists
)

REM Create .keys directory
if not exist backend\.keys (
    mkdir backend\.keys
    echo [OK] Created backend\.keys directory
)

echo.
echo ========================================
echo          Setup Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Edit environment files:
echo    - backend\.env
echo    - frontend\.env.local
echo    - executor\.env (add GEMINI_API_KEY)
echo.
echo    Get FREE Gemini API Key: https://makersuite.google.com/app/apikey
echo.
echo 2. Start development servers:
echo    Terminal 1: cd backend ^&^& npm run dev
echo    Terminal 2: cd frontend ^&^& npm run dev
echo    Terminal 3: cd executor ^&^& npm run dev
echo.
echo 3. Visit http://localhost:3000
echo.
echo Read QUICKSTART.md for detailed instructions
echo.
pause
