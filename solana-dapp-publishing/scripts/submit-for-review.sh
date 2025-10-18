#!/bin/bash
# Script to submit dApp for review to Solana dApp Store
# Usage: ./submit-for-review.sh <path-to-keypair> <release-nft-mint>

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   DegenAgent.fun - Solana dApp Store      ║${NC}"
echo -e "${GREEN}║        Submission Script                   ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check arguments
if [ -z "$1" ]; then
    echo -e "${RED}Error: Keypair path required${NC}"
    echo "Usage: ./submit-for-review.sh <path-to-keypair> <release-nft-mint>"
    exit 1
fi

if [ -z "$2" ]; then
    echo -e "${RED}Error: Release NFT mint address required${NC}"
    echo "Usage: ./submit-for-review.sh <path-to-keypair> <release-nft-mint>"
    exit 1
fi

KEYPAIR_PATH="$1"
RELEASE_MINT="$2"
RPC_URL="https://api.mainnet-beta.solana.com"

# Verify files
if [ ! -f "$KEYPAIR_PATH" ]; then
    echo -e "${RED}Error: Keypair file not found at $KEYPAIR_PATH${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}You are about to submit DegenAgent.fun for review${NC}"
echo ""
echo "Release NFT: $RELEASE_MINT"
echo "Keypair: $KEYPAIR_PATH"
echo ""
echo -e "${YELLOW}Please confirm:${NC}"
echo "- Have you tested the APK on an Android device?"
echo "- Have you deployed assetlinks.json to your domain?"
echo "- Have you read and agree to Solana dApp Store policies?"
echo ""
read -p "Continue? (yes/no): " -r
echo ""

if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo -e "${YELLOW}Submission cancelled${NC}"
    exit 0
fi

# Submit
echo -e "${GREEN}Submitting to Solana dApp Store...${NC}"
echo ""

npx @solana-mobile/dapp-store-cli@latest publish submit \
    -k "$KEYPAIR_PATH" \
    -u "$RPC_URL" \
    --release-mint "$RELEASE_MINT" \
    --requestor-is-authorized \
    --complies-with-solana-dapp-store-policies

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║       Submission Complete! ✓               ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}What happens next:${NC}"
echo ""
echo "1. Solana Mobile team will review your submission"
echo "2. Review typically takes 2-3 days"
echo "3. You'll receive an email when review is complete"
echo "4. If approved, your app will appear in the dApp Store"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
