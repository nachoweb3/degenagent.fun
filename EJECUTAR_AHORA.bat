@echo off
echo ========================================
echo   DEPLOY PRODUCCION - degenagent.fun
echo ========================================
echo.

echo [1/5] Verificando cambios...
git status
echo.

echo [2/5] Agregando archivos...
git add .
echo.

echo [3/5] Creando commit...
git commit -m "fix: production agent creation with CORS, database save and transaction signing"
echo.

echo [4/5] Pusheando a GitHub...
git push origin main
echo.

echo [5/5] Deploy iniciado!
echo.
echo ========================================
echo   DEPLOY EN PROGRESO
echo ========================================
echo.
echo Backend (Render):  https://agent-fun.onrender.com
echo Frontend (Vercel): https://www.degenagent.fun
echo.
echo Esperando auto-deploy...
echo - Render: ~5 minutos
echo - Vercel: ~2 minutos
echo.
echo Verificar en 8 minutos con:
echo   node check-production.js
echo.
echo Luego probar en:
echo   https://www.degenagent.fun/create
echo.
pause
