#!/bin/bash

# 🚀 Agent.fun Mainnet Deployment Script
# Este script automatiza el despliegue completo a mainnet

set -e  # Exit on error

echo "🚀 Agent.fun - Mainnet Deployment"
echo "=================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Solana CLI
if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    echo "Install from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi
echo -e "${GREEN}✅ Solana CLI found${NC}"

# Check Anchor
if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor not found${NC}"
    echo "Install with: cargo install --git https://github.com/coral-xyz/anchor avm --locked --force"
    exit 1
fi
echo -e "${GREEN}✅ Anchor found${NC}"

# Check Rust
if ! command -v cargo &> /dev/null; then
    echo -e "${RED}❌ Rust not found${NC}"
    echo "Install from: https://rustup.rs/"
    exit 1
fi
echo -e "${GREEN}✅ Rust found${NC}"

echo ""

# Verify we're on mainnet
CURRENT_CLUSTER=$(solana config get | grep "RPC URL" | awk '{print $3}')
if [[ $CURRENT_CLUSTER != *"mainnet"* ]]; then
    echo -e "${YELLOW}⚠️  Not on mainnet. Current cluster: $CURRENT_CLUSTER${NC}"
    read -p "Switch to mainnet? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        solana config set --url https://api.mainnet-beta.solana.com
        echo -e "${GREEN}✅ Switched to mainnet${NC}"
    else
        echo -e "${RED}❌ Deployment cancelled${NC}"
        exit 1
    fi
fi

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Wallet balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 50" | bc -l) )); then
    echo -e "${RED}❌ Insufficient balance. Need at least 50 SOL for deployment${NC}"
    echo "Current balance: $BALANCE SOL"
    exit 1
fi
echo -e "${GREEN}✅ Sufficient balance${NC}"

echo ""
echo "⚠️  WARNING: This will deploy to MAINNET and cost ~40 SOL"
read -p "Continue? (yes/no) " -r
echo
if [[ ! $REPLY == "yes" ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "🏗️  Step 1: Cleaning previous builds..."
anchor clean
echo -e "${GREEN}✅ Clean complete${NC}"

echo ""
echo "🔨 Step 2: Building programs..."
anchor build --verifiable
echo -e "${GREEN}✅ Build complete${NC}"

echo ""
echo "📦 Step 3: Checking program sizes..."
FACTORY_SIZE=$(stat -f%z target/deploy/agent_factory.so 2>/dev/null || stat -c%s target/deploy/agent_factory.so)
MANAGER_SIZE=$(stat -f%z target/deploy/agent_manager.so 2>/dev/null || stat -c%s target/deploy/agent_manager.so)

echo "Factory: $(echo "scale=2; $FACTORY_SIZE / 1024" | bc) KB"
echo "Manager: $(echo "scale=2; $MANAGER_SIZE / 1024" | bc) KB"

# Estimate cost (very rough)
FACTORY_COST=$(echo "scale=2; $FACTORY_SIZE / 1024 * 0.015" | bc)
MANAGER_COST=$(echo "scale=2; $MANAGER_SIZE / 1024 * 0.015" | bc)
TOTAL_COST=$(echo "$FACTORY_COST + $MANAGER_COST" | bc)

echo "Estimated deployment cost: ~$TOTAL_COST SOL"
echo ""

# Generate keypairs if they don't exist
if [ ! -f "target/deploy/agent_factory-keypair.json" ]; then
    echo "🔑 Generating Factory program keypair..."
    solana-keygen new -o target/deploy/agent_factory-keypair.json --no-bip39-passphrase
fi

if [ ! -f "target/deploy/agent_manager-keypair.json" ]; then
    echo "🔑 Generating Manager program keypair..."
    solana-keygen new -o target/deploy/agent_manager-keypair.json --no-bip39-passphrase
fi

FACTORY_ID=$(solana address -k target/deploy/agent_factory-keypair.json)
MANAGER_ID=$(solana address -k target/deploy/agent_manager-keypair.json)

echo ""
echo "📝 Program IDs:"
echo "Factory: $FACTORY_ID"
echo "Manager: $MANAGER_ID"
echo ""

# Update program IDs in code
echo "📝 Updating program IDs in source code..."

# Update lib.rs files
sed -i.bak "s/declare_id!(\".*\");/declare_id!(\"$FACTORY_ID\");/" programs/agent-factory/src/lib.rs
sed -i.bak "s/declare_id!(\".*\");/declare_id!(\"$MANAGER_ID\");/" programs/agent-manager/src/lib.rs

# Update Anchor.toml
sed -i.bak "s/agent_factory = \".*\"/agent_factory = \"$FACTORY_ID\"/" Anchor.toml
sed -i.bak "s/agent_manager = \".*\"/agent_manager = \"$MANAGER_ID\"/" Anchor.toml

echo -e "${GREEN}✅ Program IDs updated${NC}"

# Rebuild with correct IDs
echo ""
echo "🔨 Rebuilding with correct program IDs..."
anchor build
echo -e "${GREEN}✅ Rebuild complete${NC}"

echo ""
echo "🚀 Step 4: Deploying Factory to mainnet..."
solana program deploy \
  target/deploy/agent_factory.so \
  --program-id target/deploy/agent_factory-keypair.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Factory deployed successfully${NC}"
else
    echo -e "${RED}❌ Factory deployment failed${NC}"
    exit 1
fi

echo ""
echo "🚀 Step 5: Deploying Manager to mainnet..."
solana program deploy \
  target/deploy/agent_manager.so \
  --program-id target/deploy/agent_manager-keypair.json

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Manager deployed successfully${NC}"
else
    echo -e "${RED}❌ Manager deployment failed${NC}"
    exit 1
fi

echo ""
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo ""
echo "📝 Next steps:"
echo "1. Update backend/.env with:"
echo "   FACTORY_PROGRAM_ID=$FACTORY_ID"
echo "   MANAGER_PROGRAM_ID=$MANAGER_ID"
echo ""
echo "2. Initialize factory:"
echo "   ts-node scripts/initialize-mainnet.ts"
echo ""
echo "3. Test creation of first agent"
echo ""
echo "4. Deploy frontend to Vercel"
echo ""
echo "🔗 Verify on Solscan:"
echo "   Factory: https://solscan.io/account/$FACTORY_ID"
echo "   Manager: https://solscan.io/account/$MANAGER_ID"
echo ""
