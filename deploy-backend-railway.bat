@echo off
echo ========================================
echo   DEPLOY BACKEND - Railway
echo ========================================
echo.

echo [1/4] Instalando Railway CLI...
call npm install -g @railway/cli
echo.

echo [2/4] Iniciando login...
echo Se abrira el browser para login
echo.
pause

cd backend
call railway login
echo.

echo [3/4] Deploying backend...
call railway up
echo.

echo [4/4] Obteniendo URL...
call railway domain
echo.

echo ========================================
echo   DEPLOY COMPLETO
echo ========================================
echo.
echo Copia la URL que aparece arriba
echo.
echo Luego actualiza frontend:
echo 1. Editar: frontend\.env.production
echo 2. Cambiar NEXT_PUBLIC_BACKEND_API a la URL de Railway
echo 3. Ejecutar: cd frontend && vercel --prod
echo.
pause
