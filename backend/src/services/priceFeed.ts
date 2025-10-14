import axios from 'axios';
import { PublicKey } from '@solana/web3.js';
import { connection } from '../index';

// Jupiter Price API v2
const JUPITER_PRICE_API = 'https://api.jup.ag/price/v2';
const JUPITER_QUOTE_API = 'https://quote-api.jup.ag/v6';

// Common token addresses
export const TOKENS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
};

interface TokenPrice {
  id: string;
  mintSymbol?: string;
  vsToken: string;
  vsTokenSymbol: string;
  price: number;
  extraInfo?: {
    lastSwappedPrice?: {
      lastJupiterSellAt?: number;
      lastJupiterSellPrice?: number;
      lastJupiterBuyAt?: number;
      lastJupiterBuyPrice?: number;
    };
    quotedPrice?: {
      buyPrice?: number;
      sellPrice?: number;
    };
    confidenceLevel?: string;
  };
}

interface JupiterPriceResponse {
  data: {
    [key: string]: TokenPrice;
  };
  timeTaken: number;
}

interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  priceImpactPct: number;
  routePlan: any[];
}

/**
 * Get current price for token(s) from Jupiter
 */
export async function getTokenPrice(
  tokenMint: string,
  vsToken: string = TOKENS.USDC
): Promise<TokenPrice | null> {
  try {
    const response = await axios.get<JupiterPriceResponse>(JUPITER_PRICE_API, {
      params: {
        ids: tokenMint,
        vsToken: vsToken,
        showExtraInfo: true
      }
    });

    if (response.data?.data?.[tokenMint]) {
      return response.data.data[tokenMint];
    }

    return null;
  } catch (error: any) {
    console.error('Error fetching token price:', error.message);
    return null;
  }
}

/**
 * Get prices for multiple tokens at once
 */
export async function getMultipleTokenPrices(
  tokenMints: string[],
  vsToken: string = TOKENS.USDC
): Promise<{ [key: string]: TokenPrice }> {
  try {
    const ids = tokenMints.join(',');
    const response = await axios.get<JupiterPriceResponse>(JUPITER_PRICE_API, {
      params: {
        ids,
        vsToken: vsToken,
        showExtraInfo: true
      }
    });

    return response.data?.data || {};
  } catch (error: any) {
    console.error('Error fetching multiple token prices:', error.message);
    return {};
  }
}

/**
 * Get quote for a swap (estimates output amount)
 */
export async function getSwapQuote(
  inputMint: string,
  outputMint: string,
  amount: number,
  slippageBps: number = 50 // 0.5%
): Promise<QuoteResponse | null> {
  try {
    const response = await axios.get<QuoteResponse>(`${JUPITER_QUOTE_API}/quote`, {
      params: {
        inputMint,
        outputMint,
        amount: amount.toString(),
        slippageBps,
        onlyDirectRoutes: false,
        asLegacyTransaction: false
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Error fetching swap quote:', error.message);
    return null;
  }
}

/**
 * Calculate price impact for a trade
 */
export async function calculatePriceImpact(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<number> {
  const quote = await getSwapQuote(inputMint, outputMint, amount);

  if (quote) {
    return quote.priceImpactPct;
  }

  return 0;
}

/**
 * Get SOL price in USD
 */
export async function getSolPrice(): Promise<number> {
  const priceData = await getTokenPrice(TOKENS.SOL, TOKENS.USDC);
  return priceData?.price || 0;
}

/**
 * Get token balance for an address
 */
export async function getTokenBalance(
  walletAddress: string,
  tokenMint: string
): Promise<number> {
  try {
    const publicKey = new PublicKey(walletAddress);

    // For SOL
    if (tokenMint === TOKENS.SOL) {
      const balance = await connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    }

    // For SPL tokens
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
      mint: new PublicKey(tokenMint)
    });

    if (tokenAccounts.value.length === 0) {
      return 0;
    }

    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance || 0;
  } catch (error: any) {
    console.error('Error fetching token balance:', error.message);
    return 0;
  }
}

/**
 * Get portfolio value in USD
 */
export async function getPortfolioValue(
  walletAddress: string,
  tokenMints: string[] = [TOKENS.SOL]
): Promise<{ total: number; breakdown: { [key: string]: { amount: number; value: number } } }> {
  try {
    const balances: { [key: string]: number } = {};

    // Get balances
    for (const mint of tokenMints) {
      balances[mint] = await getTokenBalance(walletAddress, mint);
    }

    // Get prices
    const prices = await getMultipleTokenPrices(tokenMints, TOKENS.USDC);

    // Calculate values
    const breakdown: { [key: string]: { amount: number; value: number } } = {};
    let total = 0;

    for (const mint of tokenMints) {
      const amount = balances[mint] || 0;
      const price = prices[mint]?.price || 0;
      const value = amount * price;

      breakdown[mint] = { amount, value };
      total += value;
    }

    return { total, breakdown };
  } catch (error: any) {
    console.error('Error calculating portfolio value:', error.message);
    return { total: 0, breakdown: {} };
  }
}

/**
 * Price monitoring cache with TTL
 */
class PriceCache {
  private cache: Map<string, { price: TokenPrice; timestamp: number }> = new Map();
  private ttl: number = 30000; // 30 seconds

  get(key: string): TokenPrice | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.price;
  }

  set(key: string, price: TokenPrice): void {
    this.cache.set(key, { price, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

export const priceCache = new PriceCache();

/**
 * Get cached or fresh price
 */
export async function getCachedPrice(
  tokenMint: string,
  vsToken: string = TOKENS.USDC
): Promise<TokenPrice | null> {
  const cacheKey = `${tokenMint}-${vsToken}`;

  // Check cache first
  const cached = priceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch fresh price
  const price = await getTokenPrice(tokenMint, vsToken);
  if (price) {
    priceCache.set(cacheKey, price);
  }

  return price;
}

/**
 * Monitor price changes with callback
 */
export class PriceMonitor {
  private intervals: Map<string, NodeJS.Timeout> = new Map();

  startMonitoring(
    tokenMint: string,
    callback: (price: TokenPrice) => void,
    intervalMs: number = 30000
  ): void {
    // Clear existing monitor if any
    this.stopMonitoring(tokenMint);

    // Initial fetch
    this.fetchAndNotify(tokenMint, callback);

    // Set up interval
    const interval = setInterval(() => {
      this.fetchAndNotify(tokenMint, callback);
    }, intervalMs);

    this.intervals.set(tokenMint, interval);
  }

  private async fetchAndNotify(
    tokenMint: string,
    callback: (price: TokenPrice) => void
  ): Promise<void> {
    const price = await getTokenPrice(tokenMint);
    if (price) {
      callback(price);
    }
  }

  stopMonitoring(tokenMint: string): void {
    const interval = this.intervals.get(tokenMint);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(tokenMint);
    }
  }

  stopAll(): void {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }
}

export default {
  getTokenPrice,
  getMultipleTokenPrices,
  getSwapQuote,
  calculatePriceImpact,
  getSolPrice,
  getTokenBalance,
  getPortfolioValue,
  getCachedPrice,
  PriceMonitor,
  TOKENS
};
