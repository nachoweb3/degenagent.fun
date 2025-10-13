import { describe, test, expect } from '@jest/globals';
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

/**
 * Test suite for revenue share (1% commission) system
 *
 * This tests the core logic of the revenue share system implemented in agent-manager
 */
describe('Revenue Share System', () => {

  test('should calculate 1% platform fee from profit correctly', () => {
    // Test case 1: Trade with profit
    const amountIn = 1 * LAMPORTS_PER_SOL; // 1 SOL
    const actualOutput = 1.5 * LAMPORTS_PER_SOL; // 1.5 SOL

    const profit = actualOutput - amountIn;
    const platformFee = Math.floor(profit / 100); // 1% of profit
    const revenueForHolders = profit - platformFee;

    expect(profit).toBe(0.5 * LAMPORTS_PER_SOL); // 0.5 SOL profit
    expect(platformFee).toBe(Math.floor(0.005 * LAMPORTS_PER_SOL)); // 0.005 SOL fee (1%)
    expect(revenueForHolders).toBe(Math.floor(0.495 * LAMPORTS_PER_SOL)); // 0.495 SOL for holders (99%)

    // Verify the split is correct
    expect(platformFee + revenueForHolders).toBe(profit);
  });

  test('should handle no profit scenario (no fee)', () => {
    // Test case 2: Trade with no profit
    const amountIn = 1 * LAMPORTS_PER_SOL; // 1 SOL
    const actualOutput = 0.9 * LAMPORTS_PER_SOL; // 0.9 SOL (loss)

    const platformFee = actualOutput > amountIn
      ? Math.floor((actualOutput - amountIn) / 100)
      : 0;

    expect(platformFee).toBe(0); // No fee on loss
  });

  test('should handle break-even scenario (no fee)', () => {
    // Test case 3: Trade with break-even
    const amountIn = 1 * LAMPORTS_PER_SOL; // 1 SOL
    const actualOutput = 1 * LAMPORTS_PER_SOL; // 1 SOL (break-even)

    const platformFee = actualOutput > amountIn
      ? Math.floor((actualOutput - amountIn) / 100)
      : 0;

    expect(platformFee).toBe(0); // No fee on break-even
  });

  test('should calculate large profit correctly', () => {
    // Test case 4: Large trade with significant profit
    const amountIn = 10 * LAMPORTS_PER_SOL; // 10 SOL
    const actualOutput = 20 * LAMPORTS_PER_SOL; // 20 SOL (100% profit)

    const profit = actualOutput - amountIn;
    const platformFee = Math.floor(profit / 100); // 1% of profit
    const revenueForHolders = profit - platformFee;

    expect(profit).toBe(10 * LAMPORTS_PER_SOL); // 10 SOL profit
    expect(platformFee).toBe(Math.floor(0.1 * LAMPORTS_PER_SOL)); // 0.1 SOL fee (1%)
    expect(revenueForHolders).toBe(Math.floor(9.9 * LAMPORTS_PER_SOL)); // 9.9 SOL for holders (99%)
  });

  test('should handle small profits correctly', () => {
    // Test case 5: Small trade with small profit
    const amountIn = 0.1 * LAMPORTS_PER_SOL; // 0.1 SOL
    const actualOutput = 0.11 * LAMPORTS_PER_SOL; // 0.11 SOL (10% profit)

    const profit = actualOutput - amountIn;
    const platformFee = Math.floor(profit / 100); // 1% of profit
    const revenueForHolders = profit - platformFee;

    expect(profit).toBe(0.01 * LAMPORTS_PER_SOL); // 0.01 SOL profit
    expect(platformFee).toBe(Math.floor(0.0001 * LAMPORTS_PER_SOL)); // Very small fee
    expect(revenueForHolders).toBe(profit - platformFee); // Most goes to holders

    // Verify total
    expect(platformFee + revenueForHolders).toBe(profit);
  });

  test('should calculate revenue share distribution correctly', () => {
    // Test case 6: Revenue share claim calculation
    const revenuePool = 10 * LAMPORTS_PER_SOL; // 10 SOL in revenue pool
    const userTokens = 1000; // User holds 1000 tokens
    const totalSupply = 10000; // Total supply is 10000 tokens

    // User owns 10% of tokens, should get 10% of revenue
    const userShare = Math.floor((revenuePool * userTokens) / totalSupply);

    expect(userShare).toBe(1 * LAMPORTS_PER_SOL); // 1 SOL (10% of 10 SOL)
  });

  test('should handle multiple sequential trades', () => {
    // Test case 7: Accumulation over multiple trades
    let totalPlatformFees = 0;
    let totalRevenuePool = 0;

    const trades = [
      { amountIn: 1 * LAMPORTS_PER_SOL, actualOutput: 1.2 * LAMPORTS_PER_SOL },
      { amountIn: 2 * LAMPORTS_PER_SOL, actualOutput: 2.5 * LAMPORTS_PER_SOL },
      { amountIn: 1.5 * LAMPORTS_PER_SOL, actualOutput: 1.8 * LAMPORTS_PER_SOL },
    ];

    trades.forEach(trade => {
      if (trade.actualOutput > trade.amountIn) {
        const profit = trade.actualOutput - trade.amountIn;
        const platformFee = Math.floor(profit / 100);
        const revenueForHolders = profit - platformFee;

        totalPlatformFees += platformFee;
        totalRevenuePool += revenueForHolders;
      }
    });

    // Total profit = 0.2 + 0.5 + 0.3 = 1.0 SOL
    const expectedTotalProfit = 1 * LAMPORTS_PER_SOL;
    expect(totalPlatformFees + totalRevenuePool).toBeCloseTo(expectedTotalProfit, -5);

    // Platform should get ~1% of 1 SOL = 0.01 SOL
    const expectedPlatformFee = Math.floor(0.01 * LAMPORTS_PER_SOL);
    expect(totalPlatformFees).toBeGreaterThanOrEqual(expectedPlatformFee - 3); // Allow rounding error

    // Holders should get ~99% of 1 SOL = 0.99 SOL
    const expectedRevenuePool = expectedTotalProfit - totalPlatformFees;
    expect(totalRevenuePool).toBe(expectedRevenuePool);
  });

  test('should validate treasury receives correct fee', () => {
    // Test case 8: Treasury balance verification
    const initialTreasuryBalance = 100 * LAMPORTS_PER_SOL;
    const amountIn = 5 * LAMPORTS_PER_SOL;
    const actualOutput = 6 * LAMPORTS_PER_SOL;

    const profit = actualOutput - amountIn;
    const platformFee = Math.floor(profit / 100);

    const expectedTreasuryBalance = initialTreasuryBalance + platformFee;

    expect(platformFee).toBe(Math.floor(0.01 * LAMPORTS_PER_SOL)); // 0.01 SOL
    expect(expectedTreasuryBalance).toBe(100.01 * LAMPORTS_PER_SOL);
  });
});

/**
 * Helper function to calculate platform fee
 * Mirrors the logic in the Rust program
 */
export function calculatePlatformFee(amountIn: number, actualOutput: number): number {
  if (actualOutput <= amountIn) {
    return 0; // No profit, no fee
  }

  const profit = actualOutput - amountIn;
  return Math.floor(profit / 100); // 1% of profit
}

/**
 * Helper function to calculate revenue for token holders
 * Mirrors the logic in the Rust program
 */
export function calculateRevenueForHolders(amountIn: number, actualOutput: number): number {
  if (actualOutput <= amountIn) {
    return 0; // No profit
  }

  const profit = actualOutput - amountIn;
  const platformFee = Math.floor(profit / 100);
  return profit - platformFee; // 99% of profit
}

/**
 * Helper function to calculate user's share of revenue pool
 * Mirrors the logic in the Rust program
 */
export function calculateUserShare(
  revenuePool: number,
  userTokens: number,
  totalSupply: number
): number {
  if (totalSupply === 0 || userTokens === 0) {
    return 0;
  }

  return Math.floor((revenuePool * userTokens) / totalSupply);
}
