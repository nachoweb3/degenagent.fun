#!/usr/bin/env node

/**
 * Agent.fun Interactive Demo
 * Demuestra las capacidades del sistema sin necesidad de un agente
 */

const axios = require('axios');
const readline = require('readline');

const BACKEND_URL = 'http://localhost:3001';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'blue');
  console.log('='.repeat(60) + '\n');
}

async function demo() {
  console.clear();
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║         AGENT.FUN - Interactive System Demo               ║', 'blue');
  log('║         Devnet Testing Environment                         ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  console.log('\n');

  // Demo 1: System Health
  section('1️⃣  System Health Check');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/health`);
    log('✅ Backend Status: ONLINE', 'green');
    log(`   Network: ${data.network}`, 'blue');
    log(`   Block Height: ${data.blockHeight.toLocaleString()}`, 'blue');
    log(`   Timestamp: ${data.timestamp}`, 'blue');
  } catch (error) {
    log('❌ Backend is offline. Please start it with: npm run dev', 'red');
    process.exit(1);
  }

  // Demo 2: Available Vaults
  section('2️⃣  Yield Vaults Available');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/vaults`);
    log(`Found ${data.total} vaults:\n`, 'green');

    data.vaults.forEach((vault, i) => {
      log(`${i + 1}. ${vault.name}`, 'yellow');
      log(`   Strategy: ${vault.strategy.toUpperCase()}`, 'blue');
      log(`   Current APY: ${vault.currentAPY}%`, 'green');
      log(`   Risk Level: ${vault.riskLevel}/10`, vault.riskLevel > 7 ? 'red' : vault.riskLevel > 4 ? 'yellow' : 'green');
      log(`   Min Deposit: ${vault.minDeposit} SOL`, 'blue');
      log(`   Lock Period: ${vault.lockPeriod} days`, 'blue');
      log(`   Available Capacity: ${vault.available} SOL`, 'magenta');
      console.log('');
    });
  } catch (error) {
    log('❌ Failed to fetch vaults', 'red');
  }

  // Demo 3: Treasury Info
  section('3️⃣  Platform Treasury');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/agent/treasury`);
    log('✅ Treasury Wallet:', 'green');
    log(`   Address: ${data.treasuryWallet}`, 'blue');
    log(`   Fee: 1% of agent creation`, 'blue');
  } catch (error) {
    log('❌ Failed to fetch treasury info', 'red');
  }

  // Demo 4: Active Agents
  section('4️⃣  Active Trading Agents');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/agent/all`);
    if (data.count === 0) {
      log('ℹ️  No agents created yet', 'yellow');
      log('   To create an agent:', 'blue');
      log('   1. Get devnet SOL from https://faucet.solana.com/', 'blue');
      log('   2. Visit http://localhost:3000/create', 'blue');
      log('   3. Fill in agent details and submit', 'blue');
    } else {
      log(`Found ${data.count} active agents:\n`, 'green');
      data.agents.forEach((agent, i) => {
        log(`${i + 1}. ${agent.name}`, 'yellow');
        log(`   Owner: ${agent.owner}`, 'blue');
        log(`   Trades: ${agent.totalTrades}`, 'green');
        log(`   Volume: $${agent.totalVolume.toLocaleString()}`, 'magenta');
        console.log('');
      });
    }
  } catch (error) {
    log('❌ Failed to fetch agents', 'red');
  }

  // Demo 5: WebSocket Info
  section('5️⃣  Real-time WebSocket Server');
  log('✅ WebSocket URL: ws://localhost:3001/ws', 'green');
  log('\nAvailable channels:', 'blue');
  const channels = [
    'trades - All trade executions',
    'prices - Price updates',
    'activities - General activity feed',
    'kings - King of the Hill changes',
    'olympics - Olympics events',
    'graduations - Agent graduations',
    'staking - Staking events',
    'vaults - Vault updates',
    'agent:{pubkey} - Agent-specific events',
    'vault:{id} - Vault-specific events'
  ];
  channels.forEach(ch => log(`  • ${ch}`, 'yellow'));

  // Demo 6: API Capabilities
  section('6️⃣  Available API Endpoints');
  log('Trading APIs:', 'yellow');
  log('  • POST /api/trading/swap - Execute swap', 'blue');
  log('  • POST /api/trading/quote - Get swap quote', 'blue');
  log('  • POST /api/trading/analyze - Analyze trade', 'blue');
  log('  • POST /api/trading/simulate - Simulate trade', 'blue');
  log('  • GET  /api/trading/portfolio/:wallet - Get portfolio', 'blue');
  log('  • GET  /api/trading/risk/:wallet - Get risk metrics', 'blue');

  console.log('');
  log('Agent Management:', 'yellow');
  log('  • POST /api/agent/create - Create new agent', 'blue');
  log('  • GET  /api/agent/all - Get all agents', 'blue');
  log('  • GET  /api/agent/:pubkey - Get agent details', 'blue');
  log('  • POST /api/agent/:pubkey/deposit - Deposit funds', 'blue');

  console.log('');
  log('Vaults & Staking:', 'yellow');
  log('  • GET  /api/vaults - Get all vaults', 'blue');
  log('  • POST /api/vaults/deposit - Deposit to vault', 'blue');
  log('  • POST /api/vaults/withdraw - Withdraw from vault', 'blue');
  log('  • POST /api/staking/stake - Stake tokens', 'blue');

  console.log('');
  log('Advanced Features:', 'yellow');
  log('  • POST /api/trading/strategy/execute - Execute strategy', 'blue');
  log('  • POST /api/trading/orders/stop-loss - Create stop-loss', 'blue');
  log('  • POST /api/trading/orders/take-profit - Create take-profit', 'blue');
  log('  • GET  /api/performance/:agentId - Get performance metrics', 'blue');

  // Interactive Menu
  section('🎮  Interactive Demo');
  console.log('What would you like to do?\n');
  console.log('1. View vault details');
  console.log('2. Simulate creating an agent (show request)');
  console.log('3. Show WebSocket connection example');
  console.log('4. Show trading example');
  console.log('5. Exit\n');

  rl.question('Enter your choice (1-5): ', async (choice) => {
    console.log('\n');

    switch (choice) {
      case '1':
        await showVaultDetails();
        break;
      case '2':
        showAgentCreationExample();
        break;
      case '3':
        showWebSocketExample();
        break;
      case '4':
        showTradingExample();
        break;
      case '5':
        log('👋 Thanks for exploring Agent.fun!', 'green');
        rl.close();
        return;
      default:
        log('Invalid choice', 'red');
        rl.close();
        return;
    }

    rl.close();
  });
}

async function showVaultDetails() {
  section('💰 Vault Details');
  try {
    const { data } = await axios.get(`${BACKEND_URL}/api/vaults`);
    const vault = data.vaults[0]; // Show first vault

    log('Conservative SOL Vault - Detailed View\n', 'yellow');
    log(`📊 Performance Metrics:`, 'blue');
    log(`   Current APY: ${vault.currentAPY}%`);
    log(`   Historical APY: ${vault.historicalAPY}%`);
    log(`   Daily Return: ${vault.dailyReturn}%`);
    console.log('');

    log(`💵 Financial Details:`, 'blue');
    log(`   Total Value Locked: ${vault.totalValueLocked} SOL`);
    log(`   Available Capacity: ${vault.available} SOL`);
    log(`   Utilization Rate: ${vault.utilizationRate}%`);
    console.log('');

    log(`📋 Terms & Conditions:`, 'blue');
    log(`   Min Deposit: ${vault.minDeposit} SOL`);
    log(`   Max Capacity: ${vault.maxCapacity} SOL`);
    log(`   Deposit Fee: ${vault.depositFee}%`);
    log(`   Withdrawal Fee: ${vault.withdrawalFee}%`);
    log(`   Performance Fee: ${vault.performanceFee}%`);
    log(`   Lock Period: ${vault.lockPeriod} days`);
    log(`   Auto-compound: ${vault.autoCompound ? 'Yes' : 'No'}`);
    console.log('');

    log(`⚠️  Risk Assessment:`, 'blue');
    log(`   Risk Level: ${vault.riskLevel}/10`);
    log(`   Strategy: ${vault.strategy.toUpperCase()}`);
    log(`   Total Depositors: ${vault.totalDepositors}`);

    console.log('\n');
    log('💡 To deposit:', 'green');
    log(`curl -X POST ${BACKEND_URL}/api/vaults/deposit \\`, 'yellow');
    log(`  -d '{"vaultId":"${vault.id}","amount":1,"userAddress":"YOUR_WALLET"}'`, 'yellow');
  } catch (error) {
    log('Failed to fetch vault details', 'red');
  }
}

function showAgentCreationExample() {
  section('🤖 Agent Creation Example');

  log('To create a trading agent, send this request:\n', 'green');

  const exampleRequest = {
    creator: 'YOUR_WALLET_PUBKEY_HERE',
    name: 'Alpha Trader Bot',
    purpose: 'Automated memecoin trading with AI',
    riskLevel: 'medium',
    riskTolerance: 6,
    maxTradeSize: 10,
    tradingFrequency: 'medium',
    aiModel: 'gemini-pro',
    useSubagents: true
  };

  log('POST http://localhost:3001/api/agent/create', 'blue');
  log('Content-Type: application/json\n', 'blue');
  log(JSON.stringify(exampleRequest, null, 2), 'yellow');

  console.log('\n');
  log('📝 Field Explanations:', 'green');
  log('  • creator: Your Solana wallet address', 'blue');
  log('  • name: Agent display name', 'blue');
  log('  • purpose: What the agent will trade', 'blue');
  log('  • riskLevel: low | medium | high', 'blue');
  log('  • riskTolerance: 1-10 (higher = more aggressive)', 'blue');
  log('  • maxTradeSize: Max % of portfolio per trade', 'blue');
  log('  • tradingFrequency: low | medium | high | very-high', 'blue');
  log('  • useSubagents: Enable 3-agent AI system', 'blue');

  console.log('\n');
  log('🎯 What happens next:', 'green');
  log('  1. Agent wallet is created and encrypted', 'blue');
  log('  2. SPL token is minted for the agent', 'blue');
  log('  3. Bonding curve is initialized', 'blue');
  log('  4. You can deposit SOL and start trading!', 'blue');
}

function showWebSocketExample() {
  section('🔌 WebSocket Connection Example');

  log('JavaScript/TypeScript example:\n', 'green');

  const wsCode = `
const ws = new WebSocket('ws://localhost:3001/ws');

// Connection established
ws.onopen = () => {
  console.log('✅ Connected to Agent.fun WebSocket');

  // Subscribe to channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['trades', 'prices', 'activities']
  }));
};

// Receive messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.type) {
    case 'trade':
      console.log('🔄 New trade:', data.payload);
      break;
    case 'price_update':
      console.log('💹 Price update:', data.payload);
      break;
    case 'activity':
      console.log('📢 Activity:', data.payload);
      break;
  }
};

// Handle errors
ws.onerror = (error) => {
  console.error('❌ WebSocket error:', error);
};

// Handle disconnection
ws.onclose = () => {
  console.log('🔌 Disconnected');
};`;

  log(wsCode, 'yellow');

  console.log('\n');
  log('📡 Available event types:', 'green');
  log('  • trade - Trade executed', 'blue');
  log('  • price_update - Token price changed', 'blue');
  log('  • new_agent - Agent created', 'blue');
  log('  • graduation - Agent graduated to mainnet', 'blue');
  log('  • king_change - New King of the Hill', 'blue');
  log('  • olympics_update - Olympics event', 'blue');
}

function showTradingExample() {
  section('💱 Trading Example');

  log('Step 1: Get a swap quote\n', 'green');
  log('POST http://localhost:3001/api/trading/quote', 'blue');
  log(JSON.stringify({
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'TOKEN_MINT_ADDRESS',
    amount: 10000000, // 0.01 SOL in lamports
    slippageBps: 50 // 0.5%
  }, null, 2), 'yellow');

  console.log('\n');
  log('Step 2: Analyze the trade\n', 'green');
  log('POST http://localhost:3001/api/trading/analyze', 'blue');
  log(JSON.stringify({
    agentPubkey: 'AGENT_WALLET',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'TOKEN_MINT',
    amount: 10000000
  }, null, 2), 'yellow');

  console.log('\n');
  log('Step 3: Execute the swap\n', 'green');
  log('POST http://localhost:3001/api/trading/swap', 'blue');
  log(JSON.stringify({
    agentPubkey: 'AGENT_WALLET',
    inputMint: 'So11111111111111111111111111111111111111112',
    outputMint: 'TOKEN_MINT',
    amount: 10000000,
    slippageBps: 50
  }, null, 2), 'yellow');

  console.log('\n');
  log('🤖 Or use the 3-Subagent AI System:\n', 'green');
  log('POST http://localhost:3001/api/trading/strategy/execute', 'blue');
  log(JSON.stringify({
    agentPubkey: 'AGENT_WALLET',
    strategy: 'momentum', // or: mean_reversion, trend_following, scalping
    tokenMint: 'TOKEN_MINT'
  }, null, 2), 'yellow');

  console.log('\n');
  log('📊 This triggers the full AI pipeline:', 'green');
  log('  1. Market Analyzer - Finds opportunities', 'blue');
  log('  2. Risk Manager - Evaluates risk', 'blue');
  log('  3. Execution Optimizer - Executes trade', 'blue');
}

// Run demo
demo().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});
