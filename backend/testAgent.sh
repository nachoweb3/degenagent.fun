#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"
AGENT_WALLET="${AGENT_WALLET:-}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Agent.fun Devnet Testing Script${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if AGENT_WALLET is set
if [ -z "$AGENT_WALLET" ]; then
    echo -e "${RED}❌ Error: AGENT_WALLET environment variable not set${NC}"
    echo -e "${YELLOW}Usage: AGENT_WALLET=<your-agent-wallet> ./testAgent.sh${NC}\n"
    exit 1
fi

echo -e "${GREEN}🚀 Testing Agent: ${AGENT_WALLET}${NC}\n"

# Test 1: Health Check
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 1: Backend Health Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
curl -s "$BACKEND_URL/health" | jq '.' || echo -e "${RED}Failed to connect to backend${NC}"
echo -e "\n"

# Test 2: Check Agent Balance
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 2: Checking Agent Portfolio${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
PORTFOLIO=$(curl -s "$BACKEND_URL/api/trading/portfolio/$AGENT_WALLET")
echo "$PORTFOLIO" | jq '.'
SOL_BALANCE=$(echo "$PORTFOLIO" | jq -r '.totalValueSOL // 0')
echo -e "${GREEN}💰 Total Balance: ${SOL_BALANCE} SOL${NC}\n"

# Test 3: Get Swap Quote
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 3: Getting Swap Quote (0.01 SOL → USDC)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
QUOTE=$(curl -s -X POST "$BACKEND_URL/api/trading/quote" \
  -H "Content-Type: application/json" \
  -d '{
    "inputMint": "So11111111111111111111111111111111111111112",
    "outputMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "amount": 10000000,
    "slippageBps": 50
  }')
echo "$QUOTE" | jq '.'
ESTIMATED_OUTPUT=$(echo "$QUOTE" | jq -r '.outAmount // 0')
echo -e "${GREEN}📊 Estimated Output: ${ESTIMATED_OUTPUT} (USDC smallest units)${NC}\n"

# Test 4: Analyze Trade Opportunity
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 4: Analyzing Trade Opportunity${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
ANALYSIS=$(curl -s -X POST "$BACKEND_URL/api/trading/analyze" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentPubkey\": \"$AGENT_WALLET\",
    \"inputMint\": \"So11111111111111111111111111111111111111112\",
    \"outputMint\": \"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\",
    \"amount\": 10000000
  }")
echo "$ANALYSIS" | jq '.'
CAN_TRADE=$(echo "$ANALYSIS" | jq -r '.canTrade')
if [ "$CAN_TRADE" = "true" ]; then
    echo -e "${GREEN}✅ Trade is possible!${NC}\n"
else
    REASON=$(echo "$ANALYSIS" | jq -r '.reason')
    echo -e "${RED}❌ Cannot trade: $REASON${NC}\n"
fi

# Test 5: Check Risk Metrics
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 5: Risk Metrics${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
RISK=$(curl -s "$BACKEND_URL/api/trading/risk/$AGENT_WALLET")
echo "$RISK" | jq '.'
IS_RISK_LIMIT_BREACHED=$(echo "$RISK" | jq -r '.isRiskLimitBreached // false')
if [ "$IS_RISK_LIMIT_BREACHED" = "false" ]; then
    echo -e "${GREEN}✅ Risk limits OK${NC}\n"
else
    echo -e "${RED}⚠️  Risk limits breached!${NC}\n"
fi

# Test 6: Get Token Price
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 6: Get SOL Price${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
PRICE=$(curl -s "$BACKEND_URL/api/trading/price/So11111111111111111111111111111111111111112")
echo "$PRICE" | jq '.'
SOL_PRICE=$(echo "$PRICE" | jq -r '.price // "N/A"')
echo -e "${GREEN}💵 SOL Price: \$${SOL_PRICE}${NC}\n"

# Test 7: Simulate Trade
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 7: Simulate Trade (No Execution)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
SIMULATION=$(curl -s -X POST "$BACKEND_URL/api/trading/simulate" \
  -H "Content-Type: application/json" \
  -d "{
    \"agentPubkey\": \"$AGENT_WALLET\",
    \"inputMint\": \"So11111111111111111111111111111111111111112\",
    \"outputMint\": \"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\",
    \"amount\": 10000000
  }")
echo "$SIMULATION" | jq '.'
SIMULATED_OUTPUT=$(echo "$SIMULATION" | jq -r '.estimatedOutput // 0')
PRICE_IMPACT=$(echo "$SIMULATION" | jq -r '.priceImpact // 0')
echo -e "${GREEN}📈 Simulated Output: ${SIMULATED_OUTPUT}${NC}"
echo -e "${GREEN}📊 Price Impact: ${PRICE_IMPACT}%${NC}\n"

# Optional Test 8: Execute Real Trade (commented by default)
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 8: Execute Real Trade (DISABLED)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  Real trading is disabled by default${NC}"
echo -e "${YELLOW}To enable, uncomment the code below in the script${NC}\n"

# Uncomment to execute real trade:
# echo -e "${YELLOW}Executing real swap...${NC}"
# SWAP_RESULT=$(curl -s -X POST "$BACKEND_URL/api/trading/swap" \
#   -H "Content-Type: application/json" \
#   -d "{
#     \"agentPubkey\": \"$AGENT_WALLET\",
#     \"inputMint\": \"So11111111111111111111111111111111111111112\",
#     \"outputMint\": \"EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v\",
#     \"amount\": 10000000,
#     \"slippageBps\": 50
#   }")
# echo "$SWAP_RESULT" | jq '.'
# SUCCESS=$(echo "$SWAP_RESULT" | jq -r '.success')
# if [ "$SUCCESS" = "true" ]; then
#     SIGNATURE=$(echo "$SWAP_RESULT" | jq -r '.signature')
#     echo -e "${GREEN}✅ Trade executed successfully!${NC}"
#     echo -e "${GREEN}🔗 Signature: ${SIGNATURE}${NC}"
#     echo -e "${GREEN}🔍 View on Explorer: https://explorer.solana.com/tx/${SIGNATURE}?cluster=devnet${NC}\n"
# else
#     ERROR=$(echo "$SWAP_RESULT" | jq -r '.error')
#     echo -e "${RED}❌ Trade failed: ${ERROR}${NC}\n"
# fi

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}\n"

echo -e "${YELLOW}Summary:${NC}"
echo -e "  Agent Wallet: ${AGENT_WALLET}"
echo -e "  SOL Balance: ${SOL_BALANCE} SOL"
echo -e "  SOL Price: \$${SOL_PRICE}"
echo -e "  Can Trade: ${CAN_TRADE}"
echo -e "  Risk Limits OK: $([ "$IS_RISK_LIMIT_BREACHED" = "false" ] && echo "Yes" || echo "No")"
echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "  1. If balance is low, fund the agent with devnet SOL"
echo -e "  2. Uncomment Test 8 to execute real trades"
echo -e "  3. Monitor trades at: ${BACKEND_URL}/api/trading/history/<agent-id>"
echo -e "\n"
