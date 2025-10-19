@echo off
echo ========================================
echo   DEPLOY FRONTEND - Vercel
echo ========================================
echo.

cd frontend

echo [1/3] Verificando instalacion de Vercel CLI...
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Instalando Vercel CLI...
    npm install -g vercel
)
echo ✅ Vercel CLI instalado
echo.

echo [2/3] Iniciando deploy...
echo.
echo IMPORTANTE: 
echo - Se abrira el browser para login
echo - Autoriza la aplicacion
echo - Vuelve a esta ventana
echo.
pause

echo Deploying...
vercel --prod

echo.
echo ========================================
echo   DEPLOY COMPLETO
echo ========================================
echo.
echo Frontend: https://www.degenagent.fun
echo.
echo Ahora ve a Render Dashboard para backend:
echo https://dashboard.render.com/
echo.
echo Click "Manual Deploy" en agent-fun
echo.
pause
