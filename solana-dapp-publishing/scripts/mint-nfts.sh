#!/bin/bash
# Script to mint NFTs for Solana dApp Store
# Usage: ./mint-nfts.sh <path-to-keypair>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   DegenAgent.fun - Solana dApp Store      ║${NC}"
echo -e "${GREEN}║        NFT Minting Script                  ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if keypair argument is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Keypair path required${NC}"
    echo "Usage: ./mint-nfts.sh <path-to-keypair>"
    echo "Example: ./mint-nfts.sh ~/degenagent-publisher.json"
    exit 1
fi

KEYPAIR_PATH="$1"
CONFIG_PATH="../config.yaml"
RPC_URL="https://api.mainnet-beta.solana.com"
OUTPUT_FILE="./nft-addresses.txt"

# Check if keypair exists
if [ ! -f "$KEYPAIR_PATH" ]; then
    echo -e "${RED}Error: Keypair file not found at $KEYPAIR_PATH${NC}"
    exit 1
fi

# Check if config exists
if [ ! -f "$CONFIG_PATH" ]; then
    echo -e "${RED}Error: config.yaml not found at $CONFIG_PATH${NC}"
    exit 1
fi

# Check balance
echo -e "${YELLOW}Checking SOL balance...${NC}"
BALANCE=$(solana balance "$KEYPAIR_PATH" --url mainnet-beta | awk '{print $1}')
echo -e "Balance: ${GREEN}$BALANCE SOL${NC}"

if (( $(echo "$BALANCE < 0.1" | bc -l) )); then
    echo -e "${RED}Error: Insufficient balance. Need at least 0.1 SOL${NC}"
    echo "Please deposit SOL to this wallet before continuing"
    solana address -k "$KEYPAIR_PATH"
    exit 1
fi

echo ""
echo -e "${GREEN}Starting NFT minting process...${NC}"
echo ""

# Step 1: Mint Publisher NFT
echo -e "${YELLOW}Step 1/3: Minting Publisher NFT...${NC}"
PUBLISHER_OUTPUT=$(npx @solana-mobile/dapp-store-cli@latest publish create \
    --keypair "$KEYPAIR_PATH" \
    --config "$CONFIG_PATH" \
    --type publisher \
    --url "$RPC_URL" 2>&1)

PUBLISHER_MINT=$(echo "$PUBLISHER_OUTPUT" | grep -oP 'mint address: \K[A-Za-z0-9]+' || echo "")

if [ -z "$PUBLISHER_MINT" ]; then
    echo -e "${RED}Error: Failed to mint Publisher NFT${NC}"
    echo "$PUBLISHER_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✓ Publisher NFT minted: $PUBLISHER_MINT${NC}"
echo "Publisher NFT: $PUBLISHER_MINT" > "$OUTPUT_FILE"
echo ""

# Step 2: Mint App NFT
echo -e "${YELLOW}Step 2/3: Minting App NFT...${NC}"
APP_OUTPUT=$(npx @solana-mobile/dapp-store-cli@latest publish create \
    --keypair "$KEYPAIR_PATH" \
    --config "$CONFIG_PATH" \
    --type app \
    --url "$RPC_URL" \
    --publisher-mint "$PUBLISHER_MINT" 2>&1)

APP_MINT=$(echo "$APP_OUTPUT" | grep -oP 'mint address: \K[A-Za-z0-9]+' || echo "")

if [ -z "$APP_MINT" ]; then
    echo -e "${RED}Error: Failed to mint App NFT${NC}"
    echo "$APP_OUTPUT"
    exit 1
fi

echo -e "${GREEN}✓ App NFT minted: $APP_MINT${NC}"
echo "App NFT: $APP_MINT" >> "$OUTPUT_FILE"
echo ""

# Step 3: Check if APK exists
APK_PATH="../build/app-release-signed.apk"
if [ ! -f "$APK_PATH" ]; then
    echo -e "${YELLOW}Warning: APK not found at $APK_PATH${NC}"
    echo "Please generate the APK using PWABuilder first, then run:"
    echo ""
    echo "npx @solana-mobile/dapp-store-cli@latest publish create \\"
    echo "  --keypair $KEYPAIR_PATH \\"
    echo "  --config $CONFIG_PATH \\"
    echo "  --type release \\"
    echo "  --url $RPC_URL \\"
    echo "  --app-mint $APP_MINT \\"
    echo "  --apk $APK_PATH"
    echo ""
else
    # Mint Release NFT
    echo -e "${YELLOW}Step 3/3: Minting Release NFT...${NC}"
    RELEASE_OUTPUT=$(npx @solana-mobile/dapp-store-cli@latest publish create \
        --keypair "$KEYPAIR_PATH" \
        --config "$CONFIG_PATH" \
        --type release \
        --url "$RPC_URL" \
        --app-mint "$APP_MINT" \
        --apk "$APK_PATH" 2>&1)

    RELEASE_MINT=$(echo "$RELEASE_OUTPUT" | grep -oP 'mint address: \K[A-Za-z0-9]+' || echo "")

    if [ -z "$RELEASE_MINT" ]; then
        echo -e "${RED}Error: Failed to mint Release NFT${NC}"
        echo "$RELEASE_OUTPUT"
        exit 1
    fi

    echo -e "${GREEN}✓ Release NFT minted: $RELEASE_MINT${NC}"
    echo "Release NFT: $RELEASE_MINT" >> "$OUTPUT_FILE"
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         NFT Minting Complete! ✓            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "NFT addresses saved to: ${GREEN}$OUTPUT_FILE${NC}"
echo ""
cat "$OUTPUT_FILE"
echo ""

if [ -n "$RELEASE_MINT" ]; then
    echo -e "${YELLOW}Next step: Submit for review${NC}"
    echo ""
    echo "Run this command to submit:"
    echo ""
    echo "npx @solana-mobile/dapp-store-cli@latest publish submit \\"
    echo "  -k $KEYPAIR_PATH \\"
    echo "  -u $RPC_URL \\"
    echo "  --release-mint $RELEASE_MINT \\"
    echo "  --requestor-is-authorized \\"
    echo "  --complies-with-solana-dapp-store-policies"
    echo ""
fi

echo -e "${GREEN}Done! 🚀${NC}"
