# Script de instalación de herramientas para Agent.fun
# Ejecutar con: powershell -ExecutionPolicy Bypass -File install-tools.ps1

Write-Host "🚀 Instalando herramientas para Agent.fun..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Rust
Write-Host "1️⃣ Verificando Rust..." -ForegroundColor Yellow
try {
    $rustVersion = rustc --version
    Write-Host "✅ Rust instalado: $rustVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Rust no encontrado. Instalando..." -ForegroundColor Red
    Write-Host "Descargando rustup..."
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
    & "$env:TEMP\rustup-init.exe" -y
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host ""

# 2. Instalar Solana CLI
Write-Host "2️⃣ Instalando Solana CLI..." -ForegroundColor Yellow
$solanaInstallPath = "$env:USERPROFILE\.local\share\solana\install"

# Crear directorio si no existe
New-Item -ItemType Directory -Force -Path "$env:TEMP\solana-install" | Out-Null

Write-Host "Descargando Solana CLI v1.18.17..."
try {
    # Intentar descargar con TLS 1.2
    [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
    Invoke-WebRequest -Uri "https://release.solana.com/v1.18.17/solana-install-init-x86_64-pc-windows-msvc.exe" -OutFile "$env:TEMP\solana-install\solana-install-init.exe" -UseBasicParsing

    Write-Host "Ejecutando instalador de Solana..."
    & "$env:TEMP\solana-install\solana-install-init.exe" v1.18.17

    Write-Host "✅ Solana CLI instalado" -ForegroundColor Green

    # Agregar al PATH
    $solanaPath = "$env:USERPROFILE\.local\share\solana\install\active_release\bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    if ($currentPath -notlike "*$solanaPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$solanaPath", "User")
        Write-Host "✅ Solana agregado al PATH" -ForegroundColor Green
    }

    # Actualizar PATH en sesión actual
    $env:Path = "$env:Path;$solanaPath"

} catch {
    Write-Host "❌ Error descargando Solana CLI. Intentando método alternativo..." -ForegroundColor Red
    Write-Host "Por favor, descarga manualmente desde: https://docs.solana.com/cli/install-solana-cli-tools"
}

Write-Host ""

# 3. Instalar Anchor Framework
Write-Host "3️⃣ Instalando Anchor Framework..." -ForegroundColor Yellow
Write-Host "Esto puede tomar 10-15 minutos..."

try {
    # Instalar AVM (Anchor Version Manager)
    Write-Host "Instalando AVM (Anchor Version Manager)..."
    cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

    # Instalar Anchor 0.29.0
    Write-Host "Instalando Anchor 0.29.0..."
    avm install 0.29.0
    avm use 0.29.0

    Write-Host "✅ Anchor Framework instalado" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Error instalando Anchor. Puede requerir instalación manual." -ForegroundColor Yellow
    Write-Host "Consulta: https://www.anchor-lang.com/docs/installation"
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "✅ Instalación completada!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ IMPORTANTE: Cierra y reabre tu terminal para aplicar cambios en el PATH" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para verificar la instalación, ejecuta:" -ForegroundColor Cyan
Write-Host "  solana --version" -ForegroundColor White
Write-Host "  anchor --version" -ForegroundColor White
Write-Host ""
Write-Host "Siguiente paso: scripts\setup-devnet.ps1" -ForegroundColor Green
Write-Host ""
