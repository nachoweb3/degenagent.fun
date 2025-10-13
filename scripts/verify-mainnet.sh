#!/bin/bash

# 🔍 Agent.fun Mainnet Verification Script
# Verifica que todo esté correctamente desplegado

set -e

echo "🔍 Agent.fun - Mainnet Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load .env
if [ -f backend/.env ]; then
    export $(cat backend/.env | grep -v '^#' | xargs)
fi

echo "📋 Configuration:"
echo "   RPC: $RPC_ENDPOINT"
echo "   Factory: $FACTORY_PROGRAM_ID"
echo "   Manager: $MANAGER_PROGRAM_ID"
echo "   Treasury: $TREASURY_WALLET"
echo ""

# Check Solana cluster
echo "🌐 Checking Solana cluster..."
CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
if [[ $CLUSTER != *"mainnet"* ]]; then
    echo -e "${RED}❌ Not connected to mainnet${NC}"
    echo "   Current: $CLUSTER"
    exit 1
fi
echo -e "${GREEN}✅ Connected to mainnet${NC}"
echo ""

# Check wallet balance
echo "💰 Checking wallet balance..."
BALANCE=$(solana balance | awk '{print $1}')
echo "   Balance: $BALANCE SOL"
if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance (< 1 SOL)${NC}"
else
    echo -e "${GREEN}✅ Sufficient balance${NC}"
fi
echo ""

# Verify Factory program
echo "🏭 Verifying Factory program..."
if solana program show $FACTORY_PROGRAM_ID &> /dev/null; then
    echo -e "${GREEN}✅ Factory program deployed${NC}"

    FACTORY_SIZE=$(solana program show $FACTORY_PROGRAM_ID | grep "ProgramData" -A 2 | grep "Length" | awk '{print $2}')
    echo "   Size: $FACTORY_SIZE bytes"
    echo "   Link: https://solscan.io/account/$FACTORY_PROGRAM_ID"
else
    echo -e "${RED}❌ Factory program not found${NC}"
    exit 1
fi
echo ""

# Verify Manager program
echo "🔧 Verifying Manager program..."
if solana program show $MANAGER_PROGRAM_ID &> /dev/null; then
    echo -e "${GREEN}✅ Manager program deployed${NC}"

    MANAGER_SIZE=$(solana program show $MANAGER_PROGRAM_ID | grep "ProgramData" -A 2 | grep "Length" | awk '{print $2}')
    echo "   Size: $MANAGER_SIZE bytes"
    echo "   Link: https://solscan.io/account/$MANAGER_PROGRAM_ID"
else
    echo -e "${RED}❌ Manager program not found${NC}"
    exit 1
fi
echo ""

# Check Treasury wallet
echo "🏦 Checking Treasury wallet..."
if solana account $TREASURY_WALLET &> /dev/null; then
    TREASURY_BALANCE=$(solana balance $TREASURY_WALLET | awk '{print $1}')
    echo -e "${GREEN}✅ Treasury wallet exists${NC}"
    echo "   Balance: $TREASURY_BALANCE SOL"
    echo "   Link: https://solscan.io/account/$TREASURY_WALLET"
else
    echo -e "${RED}❌ Treasury wallet not found${NC}"
    exit 1
fi
echo ""

# Check Backend health
echo "🔌 Checking Backend API..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:3001/health)
    echo -e "${GREEN}✅ Backend is running${NC}"
    echo "   Response: $HEALTH"
else
    echo -e "${YELLOW}⚠️  Backend not running locally${NC}"
    echo "   Start with: cd backend && npm run dev"
fi
echo ""

# Check Frontend
echo "🌐 Checking Frontend..."
if curl -s http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
    echo "   URL: http://localhost:3002"
else
    echo -e "${YELLOW}⚠️  Frontend not running locally${NC}"
    echo "   Start with: cd frontend && npm run dev"
fi
echo ""

# Summary
echo "📊 Verification Summary"
echo "======================="
echo ""
echo "Smart Contracts:"
echo "   Factory: ✅ $FACTORY_PROGRAM_ID"
echo "   Manager: ✅ $MANAGER_PROGRAM_ID"
echo ""
echo "Wallets:"
echo "   Treasury: ✅ $TREASURY_WALLET ($TREASURY_BALANCE SOL)"
echo "   Deploy: ✅ $(solana address) ($BALANCE SOL)"
echo ""
echo "🔗 Quick Links:"
echo "   Factory: https://solscan.io/account/$FACTORY_PROGRAM_ID"
echo "   Manager: https://solscan.io/account/$MANAGER_PROGRAM_ID"
echo "   Treasury: https://solscan.io/account/$TREASURY_WALLET"
echo ""
echo "✅ All verifications passed!"
echo ""
