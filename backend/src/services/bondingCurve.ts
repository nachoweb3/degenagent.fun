import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from '@solana/spl-token';

/**
 * Bonding Curve Configuration
 * Inspired by Pump.fun mechanism
 */
export const BONDING_CURVE_CONFIG = {
  TOTAL_SUPPLY: 1_000_000_000, // 1 billion tokens
  CURVE_SUPPLY: 800_000_000, // 800M in bonding curve
  CREATOR_SUPPLY: 200_000_000, // 200M for creator

  // Linear curve parameters
  INITIAL_PRICE: 0.00000001, // Starting price in SOL per token
  SLOPE: 0.00000000001, // Price increase per token sold

  // Graduation threshold
  GRADUATION_MARKET_CAP: 69_000, // $69k in SOL (using SOL price)
  RAYDIUM_LIQUIDITY: 12_000, // $12k liquidity to Raydium

  // Platform fees
  PLATFORM_FEE_PERCENT: 1, // 1% fee on each trade
};

/**
 * Calculate current token price based on supply sold
 * Formula: P = initial_price + (slope * tokens_sold)
 */
export function calculatePrice(tokensSold: number): number {
  return BONDING_CURVE_CONFIG.INITIAL_PRICE + (BONDING_CURVE_CONFIG.SLOPE * tokensSold);
}

/**
 * Calculate cost to buy a certain amount of tokens
 * This is the integral of the price function
 * Cost = initial_price * amount + (slope * amount^2) / 2 + (slope * tokens_sold * amount)
 */
export function calculateBuyCost(tokensSold: number, amountToBuy: number): number {
  const initialCost = BONDING_CURVE_CONFIG.INITIAL_PRICE * amountToBuy;
  const incrementalCost = (BONDING_CURVE_CONFIG.SLOPE * amountToBuy * amountToBuy) / 2;
  const currentPositionCost = BONDING_CURVE_CONFIG.SLOPE * tokensSold * amountToBuy;

  return initialCost + incrementalCost + currentPositionCost;
}

/**
 * Calculate proceeds from selling tokens
 * Same as buy cost but for selling
 */
export function calculateSellProceeds(tokensSold: number, amountToSell: number): number {
  const newTokensSold = tokensSold - amountToSell;
  const currentValue = calculateBuyCost(0, tokensSold);
  const newValue = calculateBuyCost(0, newTokensSold);

  return currentValue - newValue;
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(amount: number): number {
  return amount * (BONDING_CURVE_CONFIG.PLATFORM_FEE_PERCENT / 100);
}

/**
 * Check if token should graduate to Raydium
 */
export function shouldGraduate(tokensSold: number, solPrice: number): boolean {
  const currentMarketCap = calculateBuyCost(0, tokensSold) * solPrice;
  return currentMarketCap >= BONDING_CURVE_CONFIG.GRADUATION_MARKET_CAP;
}

/**
 * Get bonding curve statistics
 */
export function getBondingCurveStats(tokensSold: number) {
  const currentPrice = calculatePrice(tokensSold);
  const tokensRemaining = BONDING_CURVE_CONFIG.CURVE_SUPPLY - tokensSold;
  const progress = (tokensSold / BONDING_CURVE_CONFIG.CURVE_SUPPLY) * 100;

  // Calculate market cap (approximate)
  const totalValue = calculateBuyCost(0, tokensSold);

  return {
    tokensSold,
    tokensRemaining,
    currentPrice,
    progress,
    totalValueLocked: totalValue,
    canGraduate: tokensSold >= BONDING_CURVE_CONFIG.CURVE_SUPPLY,
  };
}

/**
 * Simulate buying tokens - returns quote
 */
export function getQuoteBuy(tokensSold: number, amountToBuy: number) {
  if (tokensSold + amountToBuy > BONDING_CURVE_CONFIG.CURVE_SUPPLY) {
    throw new Error('Not enough tokens available in bonding curve');
  }

  const cost = calculateBuyCost(tokensSold, amountToBuy);
  const platformFee = calculatePlatformFee(cost);
  const totalCost = cost + platformFee;
  const priceImpact = ((calculatePrice(tokensSold + amountToBuy) - calculatePrice(tokensSold)) / calculatePrice(tokensSold)) * 100;

  return {
    amountToBuy,
    cost,
    platformFee,
    totalCost,
    pricePerToken: cost / amountToBuy,
    newPrice: calculatePrice(tokensSold + amountToBuy),
    priceImpact,
  };
}

/**
 * Simulate selling tokens - returns quote
 */
export function getQuoteSell(tokensSold: number, amountToSell: number) {
  if (amountToSell > tokensSold) {
    throw new Error('Cannot sell more tokens than have been sold');
  }

  const proceeds = calculateSellProceeds(tokensSold, amountToSell);
  const platformFee = calculatePlatformFee(proceeds);
  const netProceeds = proceeds - platformFee;
  const priceImpact = ((calculatePrice(tokensSold) - calculatePrice(tokensSold - amountToSell)) / calculatePrice(tokensSold)) * 100;

  return {
    amountToSell,
    proceeds,
    platformFee,
    netProceeds,
    pricePerToken: proceeds / amountToSell,
    newPrice: calculatePrice(tokensSold - amountToSell),
    priceImpact,
  };
}

/**
 * Calculate slippage for a trade
 */
export function calculateSlippage(expectedPrice: number, actualPrice: number): number {
  return ((actualPrice - expectedPrice) / expectedPrice) * 100;
}
