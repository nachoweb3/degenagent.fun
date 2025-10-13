# Script para compilar y deployar a devnet
# Ejecutar con: powershell -ExecutionPolicy Bypass -File build-and-deploy.ps1

Write-Host "🏗️ Compilando y deployando Agent.fun..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en devnet
Write-Host "Verificando configuración..." -ForegroundColor Yellow
$config = solana config get
Write-Host $config
Write-Host ""

if ($config -notlike "*devnet*") {
    Write-Host "❌ No estás configurado para devnet" -ForegroundColor Red
    Write-Host "Ejecuta primero: scripts\setup-devnet.ps1" -ForegroundColor Yellow
    exit 1
}

# Cambiar al directorio del proyecto
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "📁 Directorio: $projectRoot" -ForegroundColor Cyan
Write-Host ""

# 1. Limpiar builds anteriores
Write-Host "1️⃣ Limpiando builds anteriores..." -ForegroundColor Yellow
try {
    anchor clean
    Write-Host "✅ Build anterior eliminado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ No había build anterior (esto es normal)" -ForegroundColor Yellow
}

Write-Host ""

# 2. Compilar smart contract
Write-Host "2️⃣ Compilando smart contract..." -ForegroundColor Yellow
Write-Host "⏱️ Esto puede tomar 2-5 minutos..." -ForegroundColor Cyan
Write-Host ""

try {
    anchor build
    Write-Host ""
    Write-Host "✅ Compilación exitosa!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Error en la compilación" -ForegroundColor Red
    Write-Host "Revisa los errores arriba y corrígelos" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 3. Verificar el tamaño del programa
Write-Host "3️⃣ Verificando tamaño del programa..." -ForegroundColor Yellow
$programPath = "target\deploy\agent_registry.so"

if (Test-Path $programPath) {
    $fileSize = (Get-Item $programPath).Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)

    Write-Host "📦 Tamaño: $fileSizeKB KB" -ForegroundColor Cyan

    if ($fileSizeKB -lt 50) {
        Write-Host "✅ Tamaño óptimo! (< 50 KB)" -ForegroundColor Green
    } elseif ($fileSizeKB -lt 100) {
        Write-Host "⚠️ Tamaño aceptable (50-100 KB)" -ForegroundColor Yellow
    } else {
        Write-Host "⚠️ Programa grande (> 100 KB)" -ForegroundColor Yellow
        Write-Host "Costo estimado: mayor a 3 SOL" -ForegroundColor Yellow
    }

    # Estimar costo
    $estimatedCost = [math]::Round($fileSizeKB * 0.00001 * 1000, 2)
    Write-Host "💰 Costo estimado de deploy: ~$estimatedCost SOL" -ForegroundColor Cyan
} else {
    Write-Host "❌ Archivo compilado no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Verificar balance
Write-Host "4️⃣ Verificando balance..." -ForegroundColor Yellow
$balance = solana balance
$balanceNum = [decimal]($balance -replace " SOL", "")

Write-Host "💰 Balance actual: $balance" -ForegroundColor Cyan

if ($balanceNum -lt 3) {
    Write-Host "❌ Balance insuficiente para deployment" -ForegroundColor Red
    Write-Host "Necesitas al menos 3 SOL devnet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Obtén más SOL con: solana airdrop 2" -ForegroundColor White
    exit 1
}

Write-Host "✅ Balance suficiente" -ForegroundColor Green
Write-Host ""

# 5. Deploy a devnet
Write-Host "5️⃣ Deployando a devnet..." -ForegroundColor Yellow
Write-Host "⏱️ Esto puede tomar 2-3 minutos..." -ForegroundColor Cyan
Write-Host ""

try {
    $deployOutput = anchor deploy --provider.cluster devnet 2>&1
    Write-Host $deployOutput

    Write-Host ""
    Write-Host "✅ Deploy exitoso!" -ForegroundColor Green

    # Extraer Program ID del output
    $programId = $deployOutput | Select-String -Pattern "Program Id: (\w+)" | ForEach-Object { $_.Matches.Groups[1].Value }

    if ($programId) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "📋 PROGRAM ID (guarda esto):" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  $programId" -ForegroundColor Green
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host ""

        # Guardar Program ID en archivo
        $programId | Out-File -FilePath ".program-id-devnet.txt" -Encoding utf8
        Write-Host "💾 Program ID guardado en: .program-id-devnet.txt" -ForegroundColor Cyan

        # Actualizar .env del backend
        Write-Host ""
        Write-Host "6️⃣ Actualizando backend .env..." -ForegroundColor Yellow

        $envPath = "backend\.env"
        $envContent = ""

        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
        }

        # Actualizar o agregar REGISTRY_PROGRAM_ID
        if ($envContent -match "REGISTRY_PROGRAM_ID=") {
            $envContent = $envContent -replace "REGISTRY_PROGRAM_ID=.*", "REGISTRY_PROGRAM_ID=$programId"
        } else {
            $envContent += "`nREGISTRY_PROGRAM_ID=$programId"
        }

        # Actualizar o agregar NETWORK
        if ($envContent -match "NETWORK=") {
            $envContent = $envContent -replace "NETWORK=.*", "NETWORK=devnet"
        } else {
            $envContent += "`nNETWORK=devnet"
        }

        # Actualizar o agregar RPC_ENDPOINT
        if ($envContent -match "RPC_ENDPOINT=") {
            $envContent = $envContent -replace "RPC_ENDPOINT=.*", "RPC_ENDPOINT=https://api.devnet.solana.com"
        } else {
            $envContent += "`nRPC_ENDPOINT=https://api.devnet.solana.com"
        }

        $envContent | Out-File -FilePath $envPath -Encoding utf8 -NoNewline
        Write-Host "✅ Backend .env actualizado" -ForegroundColor Green

        Write-Host ""
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host "🎉 ¡DEPLOYMENT COMPLETADO!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📊 Resumen:" -ForegroundColor Cyan
        Write-Host "  • Program ID: $programId" -ForegroundColor White
        Write-Host "  • Network: Devnet" -ForegroundColor White
        Write-Host "  • Tamaño: $fileSizeKB KB" -ForegroundColor White
        Write-Host "  • Costo: ~$estimatedCost SOL (devnet, gratis)" -ForegroundColor White
        Write-Host ""
        Write-Host "🔍 Ver en Solscan:" -ForegroundColor Cyan
        Write-Host "  https://solscan.io/account/$programId?cluster=devnet" -ForegroundColor White
        Write-Host ""
        Write-Host "Próximos pasos:" -ForegroundColor Green
        Write-Host "  1. Reinicia el backend: cd backend && npm run dev" -ForegroundColor White
        Write-Host "  2. Abre el frontend: http://localhost:3002" -ForegroundColor White
        Write-Host "  3. Conecta tu wallet (configurada en devnet)" -ForegroundColor White
        Write-Host "  4. ¡Crea tu primer agente!" -ForegroundColor White
        Write-Host ""

    } else {
        Write-Host "⚠️ No se pudo extraer el Program ID del output" -ForegroundColor Yellow
        Write-Host "Revisa el output arriba y guarda el Program ID manualmente" -ForegroundColor Yellow
    }

} catch {
    Write-Host ""
    Write-Host "❌ Error en el deployment" -ForegroundColor Red
    Write-Host "Revisa los errores arriba" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
