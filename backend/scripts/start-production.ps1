# Agent.fun Backend - Production Startup Script (Windows)

Write-Host "🚀 Starting Agent.fun Backend in Production Mode" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found" -ForegroundColor Red
    Write-Host "Copy .env.production to .env and fill in your values" -ForegroundColor Yellow
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm ci --only=production
}

# Build TypeScript if dist doesn't exist
if (-not (Test-Path "dist")) {
    Write-Host "🔨 Building TypeScript..." -ForegroundColor Yellow
    npm run build
}

# Create logs directory
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

# Create .keys directory
New-Item -ItemType Directory -Force -Path ".keys" | Out-Null

# Stop PM2 if already running
Write-Host "🛑 Stopping existing PM2 processes..." -ForegroundColor Yellow
pm2 delete agent-fun-backend 2>$null

# Start with PM2
Write-Host "▶️  Starting backend with PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

Write-Host ""
Write-Host "✅ Backend started successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View logs:" -ForegroundColor Cyan
Write-Host "   pm2 logs agent-fun-backend" -ForegroundColor White
Write-Host ""
Write-Host "📈 Monitor status:" -ForegroundColor Cyan
Write-Host "   pm2 status" -ForegroundColor White
Write-Host "   pm2 monit" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Restart:" -ForegroundColor Cyan
Write-Host "   pm2 restart agent-fun-backend" -ForegroundColor White
Write-Host ""
Write-Host "🛑 Stop:" -ForegroundColor Cyan
Write-Host "   pm2 stop agent-fun-backend" -ForegroundColor White
Write-Host ""
Write-Host "🌐 API running at: http://localhost:3001" -ForegroundColor Green
Write-Host "🏥 Health check: http://localhost:3001/health" -ForegroundColor Green
Write-Host ""
