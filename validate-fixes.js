#!/usr/bin/env node

/**
 * Validation Script - Checks all fixes are applied correctly
 * Run: node validate-fixes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating Agent.fun Fixes...\n');

let errors = 0;
let warnings = 0;

// Check 1: Backend files exist
console.log('1️⃣ Checking backend files...');
const backendFiles = [
  'backend/src/controllers/agentController.ts',
  'backend/src/services/solana.ts',
  'backend/src/models/Agent.ts',
  'backend/src/models/TradingOrder.ts',
  'backend/src/database.ts',
  'backend/.env'
];

backendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    errors++;
  }
});

// Check 2: Frontend files exist
console.log('\n2️⃣ Checking frontend files...');
const frontendFiles = [
  'frontend/app/create/page.tsx',
  'frontend/.env.local'
];

frontendFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    errors++;
  }
});

// Check 3: Verify agentController has database save
console.log('\n3️⃣ Checking agentController fixes...');
const controllerPath = 'backend/src/controllers/agentController.ts';
if (fs.existsSync(controllerPath)) {
  const content = fs.readFileSync(controllerPath, 'utf8');
  
  if (content.includes('import Agent from')) {
    console.log('   ✅ Agent model imported');
  } else {
    console.log('   ❌ Agent model NOT imported');
    errors++;
  }
  
  if (content.includes('import crypto from')) {
    console.log('   ✅ crypto imported');
  } else {
    console.log('   ❌ crypto NOT imported');
    errors++;
  }
  
  if (content.includes('Agent.create(')) {
    console.log('   ✅ Database save implemented');
  } else {
    console.log('   ❌ Database save NOT implemented');
    errors++;
  }
  
  if (content.includes('tokenMintKeypair')) {
    console.log('   ✅ Token mint keypair returned');
  } else {
    console.log('   ❌ Token mint keypair NOT returned');
    errors++;
  }
}

// Check 4: Verify solana.ts transaction fix
console.log('\n4️⃣ Checking solana.ts fixes...');
const solanaPath = 'backend/src/services/solana.ts';
if (fs.existsSync(solanaPath)) {
  const content = fs.readFileSync(solanaPath, 'utf8');
  
  if (content.includes('tokenMintKeypair')) {
    console.log('   ✅ Token mint keypair returned');
  } else {
    console.log('   ❌ Token mint keypair NOT returned');
    errors++;
  }
  
  if (content.includes('Array.from(tokenMint.secretKey)')) {
    console.log('   ✅ Secret key serialized correctly');
  } else {
    console.log('   ⚠️  Secret key serialization might be missing');
    warnings++;
  }
}

// Check 5: Verify frontend transaction handling
console.log('\n5️⃣ Checking frontend fixes...');
const createPagePath = 'frontend/app/create/page.tsx';
if (fs.existsSync(createPagePath)) {
  const content = fs.readFileSync(createPagePath, 'utf8');
  
  if (content.includes('import { Transaction, Keypair }')) {
    console.log('   ✅ Keypair imported');
  } else {
    console.log('   ❌ Keypair NOT imported');
    errors++;
  }
  
  if (content.includes('Keypair.fromSecretKey')) {
    console.log('   ✅ Keypair recreation implemented');
  } else {
    console.log('   ❌ Keypair recreation NOT implemented');
    errors++;
  }
  
  if (content.includes('transaction.partialSign(tokenMint)')) {
    console.log('   ✅ Transaction signing implemented');
  } else {
    console.log('   ❌ Transaction signing NOT implemented');
    errors++;
  }
}

// Check 6: Environment variables
console.log('\n6️⃣ Checking environment variables...');
const backendEnvPath = 'backend/.env';
if (fs.existsSync(backendEnvPath)) {
  const content = fs.readFileSync(backendEnvPath, 'utf8');
  
  if (content.includes('ENCRYPTION_MASTER_KEY=') && !content.includes('GENERATE_YOUR_OWN')) {
    console.log('   ✅ ENCRYPTION_MASTER_KEY set');
  } else {
    console.log('   ❌ ENCRYPTION_MASTER_KEY not set or using placeholder');
    errors++;
  }
  
  if (content.includes('RPC_ENDPOINT=')) {
    console.log('   ✅ RPC_ENDPOINT set');
  } else {
    console.log('   ⚠️  RPC_ENDPOINT not set');
    warnings++;
  }
  
  if (content.includes('TREASURY_WALLET=')) {
    console.log('   ✅ TREASURY_WALLET set');
  } else {
    console.log('   ⚠️  TREASURY_WALLET not set');
    warnings++;
  }
}

// Check 7: Test files created
console.log('\n7️⃣ Checking test files...');
const testFiles = [
  'backend/src/tests/agentCreationTest.ts',
  'AGENT_CREATION_FIX.md',
  'QUICK_FIX_CHECKLIST.md',
  'COMPLETE_FIX_GUIDE.md'
];

testFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ⚠️  ${file} - Not found (optional)`);
    warnings++;
  }
});

// Check 8: Database directory
console.log('\n8️⃣ Checking database setup...');
if (fs.existsSync('backend/data')) {
  console.log('   ✅ backend/data directory exists');
} else {
  console.log('   ⚠️  backend/data directory missing (will be created on first run)');
  warnings++;
}

if (fs.existsSync('backend/.keys')) {
  console.log('   ✅ backend/.keys directory exists');
} else {
  console.log('   ⚠️  backend/.keys directory missing (will be created on first run)');
  warnings++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 VALIDATION SUMMARY');
console.log('='.repeat(50));

if (errors === 0 && warnings === 0) {
  console.log('✅ ALL CHECKS PASSED! Everything looks good!');
  console.log('\n🚀 Ready to test:');
  console.log('   1. cd backend && npm run dev');
  console.log('   2. cd frontend && npm run dev');
  console.log('   3. Open http://localhost:3000/create');
  process.exit(0);
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} ERROR(S) found - fixes may not be complete`);
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} WARNING(S) found - minor issues`);
  }
  
  console.log('\n📖 Check COMPLETE_FIX_GUIDE.md for details');
  
  if (errors > 0) {
    process.exit(1);
  } else {
    console.log('\n✅ No critical errors - should work with warnings');
    process.exit(0);
  }
}
