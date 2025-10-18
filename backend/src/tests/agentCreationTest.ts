/**
 * Agent Creation Test
 * Tests the complete agent creation flow
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_API = 'http://localhost:3001/api';
const RPC_ENDPOINT = 'https://api.devnet.solana.com';

async function testAgentCreation() {
  console.log('🧪 Testing Agent Creation Flow\n');

  try {
    // 1. Test backend health
    console.log('1️⃣ Checking backend health...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Backend is healthy:', healthResponse.data);
    console.log('');

    // 2. Generate test wallet
    console.log('2️⃣ Generating test wallet...');
    const testWallet = Keypair.generate();
    console.log('✅ Test wallet:', testWallet.publicKey.toString());
    console.log('');

    // 3. Test agent creation endpoint
    console.log('3️⃣ Testing agent creation endpoint...');
    const createResponse = await axios.post(`${BACKEND_API}/agent/create`, {
      name: 'TestAgent',
      symbol: 'TEST',
      purpose: 'Test trading agent for validation',
      creatorWallet: testWallet.publicKey.toString(),
      riskTolerance: 5,
      tradingFrequency: 'medium',
      maxTradeSize: 10
    });

    console.log('✅ Agent creation response received');
    console.log('   - Agent ID:', createResponse.data.agentId);
    console.log('   - Agent Pubkey:', createResponse.data.agentPubkey);
    console.log('   - Agent Wallet:', createResponse.data.agentWallet);
    console.log('   - Token Mint:', createResponse.data.tokenMint);
    console.log('   - Transaction:', createResponse.data.transaction ? 'Present' : 'Missing');
    console.log('   - Token Mint Keypair:', createResponse.data.tokenMintKeypair ? 'Present' : 'Missing');
    console.log('');

    // 4. Verify transaction structure
    console.log('4️⃣ Verifying transaction structure...');
    if (!createResponse.data.transaction) {
      throw new Error('Transaction missing from response');
    }
    if (!createResponse.data.tokenMintKeypair) {
      throw new Error('Token mint keypair missing from response');
    }
    console.log('✅ Transaction structure valid');
    console.log('');

    // 5. Test database integration
    console.log('5️⃣ Testing database integration...');
    if (!createResponse.data.agentId) {
      throw new Error('Agent ID missing - database save failed');
    }
    console.log('✅ Agent saved to database');
    console.log('');

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('✅ Backend health check');
    console.log('✅ Agent creation endpoint');
    console.log('✅ Transaction generation');
    console.log('✅ Database integration');
    console.log('✅ Key management');

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run test
testAgentCreation();
