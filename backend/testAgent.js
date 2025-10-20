#!/usr/bin/env node

/**
 * Agent.fun Devnet Testing Script (Node.js)
 *
 * Usage:
 *   AGENT_WALLET=<wallet-address> node testAgent.js
 *
 * Or in Windows:
 *   set AGENT_WALLET=<wallet-address>
 *   node testAgent.js
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const AGENT_WALLET = process.env.AGENT_WALLET;

// ANSI colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log(title, 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
}

async function runTests() {
  log('========================================', 'blue');
  log('   Agent.fun Devnet Testing Script', 'blue');
  log('========================================', 'blue');
  console.log('');

  if (!AGENT_WALLET) {
    log('❌ Error: AGENT_WALLET environment variable not set', 'red');
    log('Usage: AGENT_WALLET=<your-agent-wallet> node testAgent.js', 'yellow');
    process.exit(1);
  }

  log(`🚀 Testing Agent: ${AGENT_WALLET}`, 'green');
  console.log('');

  const results = {
    solBalance: 0,
    solPrice: 'N/A',
    canTrade: 'Unknown',
    riskOk: 'Unknown',
  };

  // Test 1: Health Check
  section('Test 1: Backend Health Check');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/health`);
    console.log(JSON.stringify(data, null, 2));
    log('✅ Backend is healthy', 'green');
  } catch (error) {
    log(`❌ Failed to connect to backend: ${error.message}`, 'red');
  }

  // Test 2: Check Agent Balance
  section('Test 2: Checking Agent Portfolio');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/trading/portfolio/${AGENT_WALLET}`);
    console.log(JSON.stringify(data, null, 2));
    results.solBalance = data.totalValueSOL || 0;
    log(`💰 Total Balance: ${results.solBalance} SOL`, 'green');
  } catch (error) {
    log(`❌ Failed to fetch portfolio: ${error.message}`, 'red');
  }

  // Test 3: Get Swap Quote
  section('Test 3: Getting Swap Quote (0.01 SOL → USDC)');
  try {
    const { data } = await axios.post(`${BACKEND_URL}/api/trading/quote`, {
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: 10000000,
      slippageBps: 50,
    });
    console.log(JSON.stringify(data, null, 2));
    log(`📊 Estimated Output: ${data.outAmount} (USDC smallest units)`, 'green');
  } catch (error) {
    log(`❌ Failed to get quote: ${error.message}`, 'red');
  }

  // Test 4: Analyze Trade Opportunity
  section('Test 4: Analyzing Trade Opportunity');
  try {
    const { data } = await axios.post(`${BACKEND_URL}/api/trading/analyze`, {
      agentPubkey: AGENT_WALLET,
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: 10000000,
    });
    console.log(JSON.stringify(data, null, 2));

    if (data.canTrade) {
      log('✅ Trade is possible!', 'green');
      results.canTrade = 'Yes';
    } else {
      log(`❌ Cannot trade: ${data.reason}`, 'red');
      results.canTrade = 'No';
    }
  } catch (error) {
    log(`❌ Failed to analyze trade: ${error.message}`, 'red');
  }

  // Test 5: Check Risk Metrics
  section('Test 5: Risk Metrics');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/trading/risk/${AGENT_WALLET}`);
    console.log(JSON.stringify(data, null, 2));

    if (!data.isRiskLimitBreached) {
      log('✅ Risk limits OK', 'green');
      results.riskOk = 'Yes';
    } else {
      log('⚠️  Risk limits breached!', 'red');
      results.riskOk = 'No';
    }
  } catch (error) {
    log(`❌ Failed to fetch risk metrics: ${error.message}`, 'red');
  }

  // Test 6: Get Token Price
  section('Test 6: Get SOL Price');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/trading/price/So11111111111111111111111111111111111111112`);
    console.log(JSON.stringify(data, null, 2));
    results.solPrice = data.price || 'N/A';
    log(`💵 SOL Price: $${results.solPrice}`, 'green');
  } catch (error) {
    log(`❌ Failed to fetch price: ${error.message}`, 'red');
  }

  // Test 7: Simulate Trade
  section('Test 7: Simulate Trade (No Execution)');
  try {
    const { data } = await axios.post(`${BACKEND_URL}/api/trading/simulate`, {
      agentPubkey: AGENT_WALLET,
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: 10000000,
    });
    console.log(JSON.stringify(data, null, 2));
    log(`📈 Simulated Output: ${data.estimatedOutput}`, 'green');
    log(`📊 Price Impact: ${data.priceImpact}%`, 'green');
  } catch (error) {
    log(`❌ Failed to simulate trade: ${error.message}`, 'red');
  }

  // Test 8: Execute Real Trade (disabled by default)
  section('Test 8: Execute Real Trade (DISABLED)');
  log('⚠️  Real trading is disabled by default', 'red');
  log('To enable, uncomment the code below in the script', 'yellow');

  /* Uncomment to execute real trade:
  try {
    log('Executing real swap...', 'yellow');
    const { data } = await axios.post(`${BACKEND_URL}/api/trading/swap`, {
      agentPubkey: AGENT_WALLET,
      inputMint: 'So11111111111111111111111111111111111111112',
      outputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      amount: 10000000,
      slippageBps: 50,
    });
    console.log(JSON.stringify(data, null, 2));

    if (data.success) {
      log('✅ Trade executed successfully!', 'green');
      log(`🔗 Signature: ${data.signature}`, 'green');
      log(`🔍 View on Explorer: https://explorer.solana.com/tx/${data.signature}?cluster=devnet`, 'green');
    } else {
      log(`❌ Trade failed: ${data.error}`, 'red');
    }
  } catch (error) {
    log(`❌ Failed to execute trade: ${error.message}`, 'red');
  }
  */

  // Summary
  console.log('');
  log('========================================', 'blue');
  log('✅ Testing Complete!', 'green');
  log('========================================', 'blue');
  console.log('');

  log('Summary:', 'yellow');
  console.log(`  Agent Wallet: ${AGENT_WALLET}`);
  console.log(`  SOL Balance: ${results.solBalance} SOL`);
  console.log(`  SOL Price: $${results.solPrice}`);
  console.log(`  Can Trade: ${results.canTrade}`);
  console.log(`  Risk Limits OK: ${results.riskOk}`);

  console.log('');
  log('Next steps:', 'yellow');
  console.log('  1. If balance is low, fund the agent with devnet SOL');
  console.log('  2. Uncomment Test 8 to execute real trades');
  console.log(`  3. Monitor trades at: ${BACKEND_URL}/api/trading/history/<agent-id>`);
  console.log('');
}

// Run tests
runTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
