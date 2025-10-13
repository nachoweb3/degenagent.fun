# Script para configurar devnet y deployar Agent.fun
# Ejecutar con: powershell -ExecutionPolicy Bypass -File setup-devnet.ps1

Write-Host "🌐 Configurando Solana Devnet..." -ForegroundColor Cyan
Write-Host ""

# 1. Configurar cluster a devnet
Write-Host "1️⃣ Configurando cluster a devnet..." -ForegroundColor Yellow
try {
    solana config set --url https://api.devnet.solana.com
    Write-Host "✅ Cluster configurado a devnet" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Solana CLI no encontrado" -ForegroundColor Red
    Write-Host "Ejecuta primero: scripts\install-tools.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# 2. Verificar/crear wallet
Write-Host "2️⃣ Configurando wallet de devnet..." -ForegroundColor Yellow
$walletPath = "$env:USERPROFILE\.config\solana\devnet.json"
$walletDir = "$env:USERPROFILE\.config\solana"

# Crear directorio si no existe
if (-not (Test-Path $walletDir)) {
    New-Item -ItemType Directory -Force -Path $walletDir | Out-Null
}

if (-not (Test-Path $walletPath)) {
    Write-Host "Creando nuevo wallet de devnet..."
    solana-keygen new --outfile $walletPath --no-bip39-passphrase
    Write-Host "✅ Wallet creado: $walletPath" -ForegroundColor Green
} else {
    Write-Host "✅ Wallet de devnet ya existe" -ForegroundColor Green
}

# Configurar keypair
solana config set --keypair $walletPath
Write-Host "✅ Wallet configurado" -ForegroundColor Green

Write-Host ""

# 3. Obtener dirección del wallet
$walletAddress = solana address
Write-Host "📧 Dirección del wallet: $walletAddress" -ForegroundColor Cyan

Write-Host ""

# 4. Solicitar airdrops
Write-Host "3️⃣ Obteniendo SOL de devnet (gratis)..." -ForegroundColor Yellow
Write-Host "Solicitando airdrops..."

$totalAirdrops = 6
$successfulAirdrops = 0

for ($i = 1; $i -le $totalAirdrops; $i++) {
    Write-Host "  Airdrop $i/$totalAirdrops..." -NoNewline
    try {
        $result = solana airdrop 2 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
            $successfulAirdrops++
            Start-Sleep -Seconds 2
        } else {
            Write-Host " ⚠️ (límite alcanzado)" -ForegroundColor Yellow
            break
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        break
    }
}

Write-Host ""

# Verificar balance
$balance = solana balance
Write-Host "💰 Balance actual: $balance" -ForegroundColor Green

# Verificar que tenemos suficiente SOL
$balanceNum = [decimal]($balance -replace " SOL", "")
if ($balanceNum -lt 3) {
    Write-Host ""
    Write-Host "⚠️ Balance insuficiente para deployment" -ForegroundColor Yellow
    Write-Host "Necesitas al menos 3 SOL devnet" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opciones:" -ForegroundColor Cyan
    Write-Host "1. Espera 1 hora e intenta más airdrops: solana airdrop 2" -ForegroundColor White
    Write-Host "2. Usa un faucet alternativo:" -ForegroundColor White
    Write-Host "   - https://solfaucet.com" -ForegroundColor White
    Write-Host "   - https://faucet.triangleplatform.com/solana/devnet" -ForegroundColor White
    Write-Host ""
    Write-Host "Tu dirección: $walletAddress" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Devnet configurado correctamente!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Resumen:" -ForegroundColor Cyan
Write-Host "  • Cluster: devnet" -ForegroundColor White
Write-Host "  • Wallet: $walletAddress" -ForegroundColor White
Write-Host "  • Balance: $balance" -ForegroundColor White
Write-Host ""
Write-Host "Siguiente paso: scripts\build-and-deploy.ps1" -ForegroundColor Green
Write-Host ""
