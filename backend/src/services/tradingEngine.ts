import {
  PublicKey,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  ComputeBudgetProgram,
  Keypair
} from '@solana/web3.js';
import axios from 'axios';
import { connection } from '../index';
import { getAgentKeypair } from './keyManager';
import {
  getTokenPrice,
  getSwapQuote,
  getTokenBalance,
  TOKENS
} from './priceFeed';
import { recordTradeCommission } from './commissionManager';

const JUPITER_SWAP_API = 'https://quote-api.jup.ag/v6';

export interface SwapParams {
  agentPubkey: string;
  inputMint: string;
  outputMint: string;
  amount: number;
  slippageBps?: number;
  priorityFee?: number;
}

export interface SwapResult {
  success: boolean;
  signature?: string;
  inputAmount: number;
  outputAmount: number;
  inputMint: string;
  outputMint: string;
  priceImpact: number;
  error?: string;
}

export interface TradeAnalysis {
  canTrade: boolean;
  reason?: string;
  inputAmount: number;
  estimatedOutput: number;
  priceImpact: number;
  currentPrice: number;
}

/**
 * Execute a swap using Jupiter Aggregator
 */
export async function executeSwap(params: SwapParams): Promise<SwapResult> {
  try {
    const {
      agentPubkey,
      inputMint,
      outputMint,
      amount,
      slippageBps = 50, // 0.5%
      priorityFee = 0
    } = params;

    // Get agent keypair
    const agentKeypair = await getAgentKeypair(agentPubkey);
    if (!agentKeypair) {
      throw new Error('Agent keypair not found');
    }

    // Step 1: Get quote
    const quote = await getSwapQuote(inputMint, outputMint, amount, slippageBps);
    if (!quote) {
      throw new Error('Failed to get swap quote');
    }

    console.log('Swap quote received:', {
      input: amount,
      estimatedOutput: quote.outAmount,
      priceImpact: quote.priceImpactPct
    });

    // Step 2: Get swap transaction
    const swapResponse = await axios.post(`${JUPITER_SWAP_API}/swap`, {
      quoteResponse: quote,
      userPublicKey: agentPubkey,
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: priorityFee > 0 ? priorityFee : 'auto'
    });

    const { swapTransaction } = swapResponse.data;

    // Step 3: Deserialize transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
    let transaction = VersionedTransaction.deserialize(swapTransactionBuf);

    // Step 4: Sign transaction
    transaction.sign([agentKeypair]);

    // Step 5: Send transaction
    const rawTransaction = transaction.serialize();
    const signature = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: false,
      maxRetries: 3
    });

    // Step 6: Confirm transaction
    const confirmation = await connection.confirmTransaction(signature, 'confirmed');

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
    }

    console.log('Swap executed successfully:', signature);

    // Record commission for the trade
    const tradeValueInUSD = amount / 1e9; // Convert from lamports, approximate USD value
    await recordTradeCommission(
      agentPubkey,
      agentPubkey, // Owner will be determined by agent lookup
      tradeValueInUSD,
      inputMint,
      signature
    );

    return {
      success: true,
      signature,
      inputAmount: amount,
      outputAmount: parseFloat(quote.outAmount),
      inputMint,
      outputMint,
      priceImpact: quote.priceImpactPct
    };

  } catch (error: any) {
    console.error('Error executing swap:', error);
    return {
      success: false,
      inputAmount: params.amount,
      outputAmount: 0,
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      priceImpact: 0,
      error: error.message
    };
  }
}

/**
 * Analyze if a trade should be executed
 */
export async function analyzeTradeOpportunity(
  agentPubkey: string,
  inputMint: string,
  outputMint: string,
  amount: number,
  maxPriceImpact: number = 2 // 2%
): Promise<TradeAnalysis> {
  try {
    // Check balance
    const balance = await getTokenBalance(agentPubkey, inputMint);
    if (balance < amount) {
      return {
        canTrade: false,
        reason: `Insufficient balance. Has ${balance}, needs ${amount}`,
        inputAmount: amount,
        estimatedOutput: 0,
        priceImpact: 0,
        currentPrice: 0
      };
    }

    // Get quote
    const quote = await getSwapQuote(inputMint, outputMint, amount);
    if (!quote) {
      return {
        canTrade: false,
        reason: 'Failed to get swap quote',
        inputAmount: amount,
        estimatedOutput: 0,
        priceImpact: 0,
        currentPrice: 0
      };
    }

    // Check price impact
    if (Math.abs(quote.priceImpactPct) > maxPriceImpact) {
      return {
        canTrade: false,
        reason: `Price impact too high: ${quote.priceImpactPct.toFixed(2)}%`,
        inputAmount: amount,
        estimatedOutput: parseFloat(quote.outAmount),
        priceImpact: quote.priceImpactPct,
        currentPrice: parseFloat(quote.outAmount) / amount
      };
    }

    // Get current price
    const price = await getTokenPrice(outputMint, inputMint);
    const currentPrice = price?.price || (parseFloat(quote.outAmount) / amount);

    return {
      canTrade: true,
      inputAmount: amount,
      estimatedOutput: parseFloat(quote.outAmount),
      priceImpact: quote.priceImpactPct,
      currentPrice
    };

  } catch (error: any) {
    console.error('Error analyzing trade:', error);
    return {
      canTrade: false,
      reason: error.message,
      inputAmount: amount,
      estimatedOutput: 0,
      priceImpact: 0,
      currentPrice: 0
    };
  }
}

/**
 * Execute a buy order (SOL -> Token)
 */
export async function executeBuyOrder(
  agentPubkey: string,
  tokenMint: string,
  solAmount: number,
  slippageBps: number = 50
): Promise<SwapResult> {
  console.log(`Executing BUY: ${solAmount} SOL -> ${tokenMint}`);

  return executeSwap({
    agentPubkey,
    inputMint: TOKENS.SOL,
    outputMint: tokenMint,
    amount: Math.floor(solAmount * 1e9), // Convert SOL to lamports
    slippageBps
  });
}

/**
 * Execute a sell order (Token -> SOL)
 */
export async function executeSellOrder(
  agentPubkey: string,
  tokenMint: string,
  tokenAmount: number,
  slippageBps: number = 50
): Promise<SwapResult> {
  console.log(`Executing SELL: ${tokenAmount} ${tokenMint} -> SOL`);

  return executeSwap({
    agentPubkey,
    inputMint: tokenMint,
    outputMint: TOKENS.SOL,
    amount: Math.floor(tokenAmount * 1e9), // Convert to smallest unit
    slippageBps
  });
}

/**
 * Calculate optimal trade size based on available balance and risk
 */
export function calculateTradeSize(
  totalBalance: number,
  riskPercentage: number,
  maxTradeSize?: number
): number {
  const calculatedSize = totalBalance * (riskPercentage / 100);

  if (maxTradeSize && calculatedSize > maxTradeSize) {
    return maxTradeSize;
  }

  return calculatedSize;
}

/**
 * Check if token is tradeable (has liquidity)
 */
export async function isTokenTradeable(tokenMint: string): Promise<boolean> {
  try {
    // Try to get a small quote to check liquidity
    const quote = await getSwapQuote(
      TOKENS.SOL,
      tokenMint,
      1000000, // 0.001 SOL
      50
    );

    return quote !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Get minimum tradeable amount for a token
 */
export async function getMinimumTradeAmount(tokenMint: string): Promise<number> {
  // Try increasingly larger amounts until we get a valid quote
  const testAmounts = [100000, 500000, 1000000, 5000000]; // lamports

  for (const amount of testAmounts) {
    const quote = await getSwapQuote(TOKENS.SOL, tokenMint, amount, 50);
    if (quote) {
      return amount / 1e9; // Convert to SOL
    }
  }

  return 0.01; // Default 0.01 SOL
}

/**
 * Simulate a trade without executing
 */
export async function simulateTrade(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<{
  estimatedOutput: number;
  priceImpact: number;
  minimumOutput: number;
  route: string[];
}> {
  const quote = await getSwapQuote(inputMint, outputMint, amount, 50);

  if (!quote) {
    throw new Error('Failed to simulate trade');
  }

  const route = quote.routePlan.map((step: any) => {
    return step.swapInfo?.label || 'Unknown';
  });

  return {
    estimatedOutput: parseFloat(quote.outAmount),
    priceImpact: quote.priceImpactPct,
    minimumOutput: parseFloat(quote.otherAmountThreshold),
    route
  };
}

/**
 * Batch execute multiple swaps
 */
export async function executeBatchSwaps(
  swaps: SwapParams[]
): Promise<SwapResult[]> {
  const results: SwapResult[] = [];

  for (const swap of swaps) {
    const result = await executeSwap(swap);
    results.push(result);

    // Small delay between swaps to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return results;
}

/**
 * Get best route for a swap
 */
export async function getBestRoute(
  inputMint: string,
  outputMint: string,
  amount: number
): Promise<{
  route: string[];
  estimatedOutput: number;
  priceImpact: number;
}> {
  try {
    const quote = await getSwapQuote(inputMint, outputMint, amount, 50);

    if (!quote) {
      throw new Error('No route found');
    }

    const route = quote.routePlan.map((step: any) => {
      const swapInfo = step.swapInfo;
      return `${swapInfo?.label || 'Unknown'} (${swapInfo?.outputMint || ''})`;
    });

    return {
      route,
      estimatedOutput: parseFloat(quote.outAmount),
      priceImpact: quote.priceImpactPct
    };
  } catch (error: any) {
    throw new Error(`Failed to get best route: ${error.message}`);
  }
}

export default {
  executeSwap,
  analyzeTradeOpportunity,
  executeBuyOrder,
  executeSellOrder,
  calculateTradeSize,
  isTokenTradeable,
  getMinimumTradeAmount,
  simulateTrade,
  executeBatchSwaps,
  getBestRoute
};
