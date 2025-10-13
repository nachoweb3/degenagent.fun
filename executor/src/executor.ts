import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { fetchActiveAgents, fetchAgentState } from './services/agentService';
import { queryAI, AIDecision } from './services/aiService';
import { getJupiterQuote, buildSwapTransaction } from './services/jupiterService';
import { getAgentKeypair } from './services/keyService';

const connection = new Connection(
  process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  'confirmed'
);

export async function executeAgentCycle() {
  try {
    // 1. Fetch all active agents
    const agents = await fetchActiveAgents();

    if (agents.length === 0) {
      console.log('ℹ️  No active agents found');
      return;
    }

    console.log(`📊 Processing ${agents.length} active agent(s)...`);

    // 2. Process each agent
    for (const agent of agents) {
      try {
        await processAgent(agent);
      } catch (error) {
        console.error(`❌ Error processing agent ${agent.pubkey}:`, error);
        // Continue with next agent
      }
    }

  } catch (error) {
    console.error('❌ Error in execution cycle:', error);
    throw error;
  }
}

async function processAgent(agent: any) {
  console.log(`\n🤖 Processing agent: ${agent.name} (${agent.pubkey})`);

  // 1. Fetch agent state from blockchain
  const agentState = await fetchAgentState(agent.pubkey);

  if (!agentState) {
    console.log(`⚠️  Could not fetch state for agent ${agent.pubkey}`);
    return;
  }

  // Check if agent is active
  if (agentState.status !== 'Active') {
    console.log(`⏸️  Agent ${agent.name} is paused, skipping`);
    return;
  }

  // Check if agent has funds
  if (agentState.vaultBalance < 0.01) {
    console.log(`💰 Agent ${agent.name} has insufficient funds (${agentState.vaultBalance} SOL)`);
    return;
  }

  console.log(`📈 Agent state:`);
  console.log(`   Purpose: ${agentState.purpose}`);
  console.log(`   Balance: ${agentState.vaultBalance} SOL`);
  console.log(`   Total Trades: ${agentState.totalTrades}`);

  // 2. Get market data
  const marketData = await fetchMarketData();

  // 3. Query AI for decision
  console.log(`🧠 Consulting AI for trading decision...`);
  const decision = await queryAI(agentState, marketData);

  console.log(`💡 AI Decision: ${decision.action}`);
  if (decision.reasoning) {
    console.log(`   Reasoning: ${decision.reasoning}`);
  }

  // 4. Execute decision
  if (decision.action === 'SWAP') {
    await executeSwap(agent, agentState, decision);
  } else if (decision.action === 'HOLD') {
    console.log(`⏳ Holding position, no trade executed`);
  }
}

async function executeSwap(agent: any, agentState: any, decision: AIDecision) {
  try {
    console.log(`\n💱 Executing swap:`);
    console.log(`   From: ${decision.fromToken}`);
    console.log(`   To: ${decision.toToken}`);
    console.log(`   Amount: ${decision.amount}`);

    // 1. Get Jupiter quote
    const quote = await getJupiterQuote(
      decision.fromToken,
      decision.toToken,
      parseFloat(decision.amount)
    );

    if (!quote) {
      console.log(`❌ Could not get quote from Jupiter`);
      return;
    }

    console.log(`✅ Got quote: ${quote.outAmount} expected output`);

    // 2. Get agent keypair
    const agentKeypair = await getAgentKeypair(agentState.agentWallet);

    // 3. Build swap transaction from Jupiter
    const { transaction: swapTx, expectedOutput } = await buildSwapTransaction(
      agent.pubkey,
      agentState,
      decision,
      quote
    );

    console.log(`💰 Expected output: ${expectedOutput} lamports`);

    // 4. Calculate platform fee (1% of profit)
    const amountIn = parseFloat(decision.amount) * 1e9; // Convert to lamports
    let platformFee = 0;

    if (expectedOutput > amountIn) {
      const profit = expectedOutput - amountIn;
      platformFee = Math.floor(profit / 100); // 1% fee
      console.log(`💵 Estimated platform fee: ${platformFee} lamports (${(platformFee / 1e9).toFixed(6)} SOL)`);
    }

    // 5. In production: Add execute_trade instruction to record trade and collect fee
    // For MVP, we just execute the Jupiter swap
    // TODO: Import and use buildExecuteTradeInstruction from agentManagerService

    swapTx.sign(agentKeypair);

    // 6. Send transaction
    const signature = await connection.sendRawTransaction(
      swapTx.serialize()
    );

    console.log(`📤 Transaction sent: ${signature}`);

    // 7. Confirm transaction
    const confirmation = await connection.confirmTransaction(signature);

    if (confirmation.value.err) {
      console.error(`❌ Transaction failed:`, confirmation.value.err);
    } else {
      console.log(`✅ Trade executed successfully!`);
      console.log(`   Signature: ${signature}`);

      // 8. Get actual output amount from transaction logs
      // In production, parse the transaction to get actual output
      const actualOutput = expectedOutput; // For MVP, assume quote was accurate

      console.log(`📊 Trade Summary:`);
      console.log(`   Input: ${(amountIn / 1e9).toFixed(6)} SOL`);
      console.log(`   Output: ${(actualOutput / 1e9).toFixed(6)} tokens`);
      if (platformFee > 0) {
        console.log(`   Platform Fee Collected: ${(platformFee / 1e9).toFixed(6)} SOL`);
      }
    }

  } catch (error) {
    console.error(`❌ Error executing swap:`, error);
  }
}

async function fetchMarketData() {
  // For MVP, return mock market data
  // In production, fetch from Birdeye, CoinGecko, etc.

  return {
    trending: [
      { symbol: 'WIF', change24h: 12.5, volume: 15000000 },
      { symbol: 'BONK', change24h: -3.2, volume: 8000000 },
      { symbol: 'MYRO', change24h: 45.8, volume: 3000000 },
    ],
    sentiment: 'bullish',
    marketCap: {
      total: 2400000000,
      change24h: 5.3
    }
  };
}
