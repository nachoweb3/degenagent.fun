#!/usr/bin/env node

/**
 * Script para verificar manualmente los cálculos del sistema de revenue share
 *
 * Uso: node scripts/verify-revenue-calculations.js
 */

const LAMPORTS_PER_SOL = 1000000000;

function calculateRevenueShare(amountInSOL, actualOutputSOL) {
  const amountIn = amountInSOL * LAMPORTS_PER_SOL;
  const actualOutput = actualOutputSOL * LAMPORTS_PER_SOL;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`Trade: ${amountInSOL} SOL → ${actualOutputSOL} SOL`);
  console.log('═══════════════════════════════════════════════════════');

  if (actualOutput <= amountIn) {
    console.log('❌ No profit - No fees collected');
    console.log(`   Loss: ${((actualOutput - amountIn) / LAMPORTS_PER_SOL).toFixed(6)} SOL`);
    return {
      profit: 0,
      platformFee: 0,
      revenueForHolders: 0
    };
  }

  const profit = actualOutput - amountIn;
  const platformFee = Math.floor(profit / 100); // 1%
  const revenueForHolders = profit - platformFee;

  const profitSOL = profit / LAMPORTS_PER_SOL;
  const platformFeeSOL = platformFee / LAMPORTS_PER_SOL;
  const revenueForHoldersSOL = revenueForHolders / LAMPORTS_PER_SOL;

  console.log(`✅ Profit: ${profitSOL.toFixed(9)} SOL`);
  console.log(`   ├─ Platform Fee (1%):     ${platformFeeSOL.toFixed(9)} SOL`);
  console.log(`   └─ Revenue Pool (99%):    ${revenueForHoldersSOL.toFixed(9)} SOL`);
  console.log('');
  console.log(`📊 Breakdown:`);
  console.log(`   Total Profit:             ${profitSOL.toFixed(9)} SOL (100.0%)`);
  console.log(`   → Treasury receives:      ${platformFeeSOL.toFixed(9)} SOL (${((platformFee / profit) * 100).toFixed(2)}%)`);
  console.log(`   → Token holders receive:  ${revenueForHoldersSOL.toFixed(9)} SOL (${((revenueForHolders / profit) * 100).toFixed(2)}%)`);

  return {
    profit: profitSOL,
    platformFee: platformFeeSOL,
    revenueForHolders: revenueForHoldersSOL
  };
}

function calculateUserShare(revenuePoolSOL, userTokens, totalSupply) {
  const revenuePool = revenuePoolSOL * LAMPORTS_PER_SOL;
  const userShare = Math.floor((revenuePool * userTokens) / totalSupply);
  const userShareSOL = userShare / LAMPORTS_PER_SOL;

  console.log('\n═══════════════════════════════════════════════════════');
  console.log(`User Revenue Claim`);
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Revenue Pool:      ${revenuePoolSOL.toFixed(9)} SOL`);
  console.log(`User Tokens:       ${userTokens.toLocaleString()} (${((userTokens / totalSupply) * 100).toFixed(2)}%)`);
  console.log(`Total Supply:      ${totalSupply.toLocaleString()}`);
  console.log(`─────────────────────────────────────────────────────`);
  console.log(`User Share:        ${userShareSOL.toFixed(9)} SOL`);

  return userShareSOL;
}

function main() {
  console.log('\n🚀 AGENT.FUN Revenue Share Calculator');
  console.log('=====================================\n');

  // Example 1: Small profitable trade
  console.log('\n📝 Example 1: Small profitable trade');
  calculateRevenueShare(1, 1.2); // 1 SOL → 1.2 SOL (20% profit)

  // Example 2: Large profitable trade
  console.log('\n📝 Example 2: Large profitable trade');
  calculateRevenueShare(10, 15); // 10 SOL → 15 SOL (50% profit)

  // Example 3: Break-even
  console.log('\n📝 Example 3: Break-even trade');
  calculateRevenueShare(5, 5); // 5 SOL → 5 SOL (no profit)

  // Example 4: Loss
  console.log('\n📝 Example 4: Losing trade');
  calculateRevenueShare(2, 1.8); // 2 SOL → 1.8 SOL (10% loss)

  // Example 5: Multiple trades accumulation
  console.log('\n\n📝 Example 5: Multiple trades accumulation');
  console.log('═══════════════════════════════════════════════════════');

  const trades = [
    { input: 1, output: 1.2 },
    { input: 2, output: 2.5 },
    { input: 1.5, output: 1.8 },
    { input: 3, output: 2.9 }, // loss
  ];

  let totalPlatformFees = 0;
  let totalRevenuePool = 0;

  trades.forEach((trade, index) => {
    console.log(`\nTrade ${index + 1}:`);
    const result = calculateRevenueShare(trade.input, trade.output);
    totalPlatformFees += result.platformFee;
    totalRevenuePool += result.revenueForHolders;
  });

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 Total Accumulated:');
  console.log('═══════════════════════════════════════════════════════');
  console.log(`Total Platform Fees:      ${totalPlatformFees.toFixed(9)} SOL`);
  console.log(`Total Revenue Pool:       ${totalRevenuePool.toFixed(9)} SOL`);
  console.log(`Total to Distribute:      ${(totalPlatformFees + totalRevenuePool).toFixed(9)} SOL`);

  // Example 6: User claiming from revenue pool
  console.log('\n\n📝 Example 6: User claiming revenue share');
  calculateUserShare(totalRevenuePool, 1000, 10000); // User owns 10% of tokens

  console.log('\n\n📝 Example 7: Large holder claiming');
  calculateUserShare(totalRevenuePool, 5000, 10000); // User owns 50% of tokens

  console.log('\n\n📝 Example 8: Small holder claiming');
  calculateUserShare(totalRevenuePool, 100, 10000); // User owns 1% of tokens

  console.log('\n\n✅ All calculations completed!');
  console.log('═══════════════════════════════════════════════════════\n');
}

// Run
main();
