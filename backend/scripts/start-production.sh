#!/bin/bash

# Agent.fun Backend - Production Startup Script

set -e

echo "🚀 Starting Agent.fun Backend in Production Mode"
echo "================================================"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "Copy .env.production to .env and fill in your values"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm ci --only=production
fi

# Build TypeScript if dist doesn't exist
if [ ! -d dist ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Create logs directory
mkdir -p logs

# Create .keys directory
mkdir -p .keys
chmod 700 .keys

# Stop PM2 if already running
echo "🛑 Stopping existing PM2 processes..."
pm2 delete agent-fun-backend 2>/dev/null || true

# Start with PM2
echo "▶️  Starting backend with PM2..."
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

echo ""
echo "✅ Backend started successfully!"
echo ""
echo "📊 View logs:"
echo "   pm2 logs agent-fun-backend"
echo ""
echo "📈 Monitor status:"
echo "   pm2 status"
echo "   pm2 monit"
echo ""
echo "🔄 Restart:"
echo "   pm2 restart agent-fun-backend"
echo ""
echo "🛑 Stop:"
echo "   pm2 stop agent-fun-backend"
echo ""
echo "🌐 API running at: http://localhost:3001"
echo "🏥 Health check: http://localhost:3001/health"
echo ""
