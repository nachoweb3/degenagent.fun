import cron from 'node-cron';
import dotenv from 'dotenv';
import { Connection, PublicKey } from '@solana/web3.js';
import { executeAgentCycle } from './executor';

dotenv.config();

const connection = new Connection(
  process.env.RPC_ENDPOINT || 'https://api.devnet.solana.com',
  'confirmed'
);

const INTERVAL = process.env.EXECUTION_INTERVAL_MINUTES || '5';

console.log('🤖 AGENT.FUN AI Executor starting...');
console.log(`📡 Connected to: ${process.env.RPC_ENDPOINT}`);
console.log(`⏰ Execution interval: Every ${INTERVAL} minutes`);

// Run immediately on startup
console.log('\n🚀 Running initial execution cycle...');
executeAgentCycle().catch(console.error);

// Schedule periodic execution
cron.schedule(`*/${INTERVAL} * * * *`, async () => {
  console.log(`\n⏰ [${new Date().toISOString()}] Starting execution cycle...`);
  try {
    await executeAgentCycle();
    console.log('✅ Execution cycle completed\n');
  } catch (error) {
    console.error('❌ Error in execution cycle:', error);
  }
});

console.log('\n✅ Executor is running. Press Ctrl+C to stop.\n');
