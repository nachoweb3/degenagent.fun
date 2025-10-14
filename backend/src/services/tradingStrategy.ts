import { getTokenPrice, getCachedPrice, TOKENS } from './priceFeed';
import { executeBuyOrder, executeSellOrder, analyzeTradeOpportunity } from './tradingEngine';
import { validateTradeRisk, getRiskMetrics, DEFAULT_RISK_CONFIG, RiskConfig } from './riskManager';
import {
  createStopLossOrder,
  createTakeProfitOrder,
  getAgentOrders
} from './orderManager';
import { getTokenBalance } from './priceFeed';

export interface TradingSignal {
  action: 'buy' | 'sell' | 'hold';
  confidence: number; // 0-100
  reason: string;
  suggestedAmount?: number;
}

export interface StrategyConfig {
  riskConfig: RiskConfig;
  strategy: 'momentum' | 'mean_reversion' | 'trend_following' | 'scalping';
  minConfidence: number;
  useStopLoss: boolean;
  useTakeProfit: boolean;
  enableAutoTrading: boolean;
}

export const DEFAULT_STRATEGY_CONFIG: StrategyConfig = {
  riskConfig: DEFAULT_RISK_CONFIG,
  strategy: 'momentum',
  minConfidence: 60,
  useStopLoss: true,
  useTakeProfit: true,
  enableAutoTrading: false
};

/**
 * Analyze market and generate trading signal
 */
export async function generateTradingSignal(
  tokenMint: string,
  strategy: 'momentum' | 'mean_reversion' | 'trend_following' | 'scalping' = 'momentum'
): Promise<TradingSignal> {
  try {
    const priceData = await getTokenPrice(tokenMint, TOKENS.USDC);

    if (!priceData) {
      return {
        action: 'hold',
        confidence: 0,
        reason: 'Unable to fetch price data'
      };
    }

    const currentPrice = priceData.price;
    const extraInfo = priceData.extraInfo;

    // Get recent price action
    const lastBuyPrice = extraInfo?.lastSwappedPrice?.lastJupiterBuyPrice || 0;
    const lastSellPrice = extraInfo?.lastSwappedPrice?.lastJupiterSellPrice || 0;
    const quotedBuyPrice = extraInfo?.quotedPrice?.buyPrice || 0;
    const quotedSellPrice = extraInfo?.quotedPrice?.sellPrice || 0;

    // Strategy-specific logic
    switch (strategy) {
      case 'momentum':
        return analyzeMomentum(currentPrice, lastBuyPrice, lastSellPrice);

      case 'mean_reversion':
        return analyzeMeanReversion(currentPrice, quotedBuyPrice, quotedSellPrice);

      case 'trend_following':
        return analyzeTrendFollowing(currentPrice, lastBuyPrice, lastSellPrice);

      case 'scalping':
        return analyzeScalping(currentPrice, quotedBuyPrice, quotedSellPrice);

      default:
        return {
          action: 'hold',
          confidence: 50,
          reason: 'Unknown strategy'
        };
    }

  } catch (error: any) {
    console.error('Error generating trading signal:', error);
    return {
      action: 'hold',
      confidence: 0,
      reason: `Error: ${error.message}`
    };
  }
}

/**
 * Momentum strategy - Buy when price is rising
 */
function analyzeMomentum(
  currentPrice: number,
  lastBuyPrice: number,
  lastSellPrice: number
): TradingSignal {
  if (lastBuyPrice === 0 && lastSellPrice === 0) {
    return {
      action: 'hold',
      confidence: 30,
      reason: 'Insufficient historical data'
    };
  }

  const avgPrice = (lastBuyPrice + lastSellPrice) / 2;
  const priceChange = ((currentPrice - avgPrice) / avgPrice) * 100;

  if (priceChange > 5) {
    return {
      action: 'buy',
      confidence: 70,
      reason: `Strong momentum: +${priceChange.toFixed(2)}%`
    };
  } else if (priceChange < -5) {
    return {
      action: 'sell',
      confidence: 65,
      reason: `Negative momentum: ${priceChange.toFixed(2)}%`
    };
  } else {
    return {
      action: 'hold',
      confidence: 50,
      reason: 'Neutral momentum'
    };
  }
}

/**
 * Mean reversion strategy - Buy low, sell high
 */
function analyzeMeanReversion(
  currentPrice: number,
  buyPrice: number,
  sellPrice: number
): TradingSignal {
  if (buyPrice === 0 || sellPrice === 0) {
    return {
      action: 'hold',
      confidence: 30,
      reason: 'Insufficient price data'
    };
  }

  const spread = ((sellPrice - buyPrice) / buyPrice) * 100;

  // If current price is near buy price (support), buy
  if (currentPrice <= buyPrice * 1.02) {
    return {
      action: 'buy',
      confidence: 75,
      reason: `Near support level (spread: ${spread.toFixed(2)}%)`
    };
  }

  // If current price is near sell price (resistance), sell
  if (currentPrice >= sellPrice * 0.98) {
    return {
      action: 'sell',
      confidence: 75,
      reason: `Near resistance level (spread: ${spread.toFixed(2)}%)`
    };
  }

  return {
    action: 'hold',
    confidence: 50,
    reason: 'Price in middle range'
  };
}

/**
 * Trend following - Follow the trend
 */
function analyzeTrendFollowing(
  currentPrice: number,
  lastBuyPrice: number,
  lastSellPrice: number
): TradingSignal {
  if (lastBuyPrice === 0 && lastSellPrice === 0) {
    return {
      action: 'hold',
      confidence: 30,
      reason: 'Insufficient trend data'
    };
  }

  // Determine trend direction
  const isUptrend = lastBuyPrice > lastSellPrice;
  const trendStrength = Math.abs(lastBuyPrice - lastSellPrice) / Math.min(lastBuyPrice, lastSellPrice) * 100;

  if (isUptrend && trendStrength > 3) {
    return {
      action: 'buy',
      confidence: 70,
      reason: `Following uptrend (${trendStrength.toFixed(2)}% strength)`
    };
  } else if (!isUptrend && trendStrength > 3) {
    return {
      action: 'sell',
      confidence: 65,
      reason: `Following downtrend (${trendStrength.toFixed(2)}% strength)`
    };
  } else {
    return {
      action: 'hold',
      confidence: 45,
      reason: 'Weak or unclear trend'
    };
  }
}

/**
 * Scalping strategy - Quick small profits
 */
function analyzeScalping(
  currentPrice: number,
  buyPrice: number,
  sellPrice: number
): TradingSignal {
  if (buyPrice === 0 || sellPrice === 0) {
    return {
      action: 'hold',
      confidence: 30,
      reason: 'No price quotes available'
    };
  }

  const spread = ((sellPrice - buyPrice) / buyPrice) * 100;

  // Look for tight spreads to scalp
  if (spread > 0.5 && spread < 2) {
    return {
      action: 'buy',
      confidence: 80,
      reason: `Scalping opportunity (${spread.toFixed(2)}% spread)`
    };
  }

  return {
    action: 'hold',
    confidence: 40,
    reason: 'Waiting for scalping opportunity'
  };
}

/**
 * Execute trading strategy for an agent
 */
export async function executeTradingStrategy(
  agentId: string,
  agentPubkey: string,
  tokenMint: string,
  config: StrategyConfig = DEFAULT_STRATEGY_CONFIG
): Promise<{
  executed: boolean;
  action?: 'buy' | 'sell';
  signal?: TradingSignal;
  result?: any;
  reason?: string;
}> {
  try {
    // Check if auto-trading is enabled
    if (!config.enableAutoTrading) {
      return {
        executed: false,
        reason: 'Auto-trading is disabled'
      };
    }

    // Generate trading signal
    const signal = await generateTradingSignal(tokenMint, config.strategy);

    // Check confidence threshold
    if (signal.confidence < config.minConfidence) {
      return {
        executed: false,
        signal,
        reason: `Signal confidence ${signal.confidence} below threshold ${config.minConfidence}`
      };
    }

    // If hold signal, don't trade
    if (signal.action === 'hold') {
      return {
        executed: false,
        signal,
        reason: 'Signal suggests holding'
      };
    }

    // Get risk metrics
    const riskMetrics = await getRiskMetrics(agentPubkey, [TOKENS.SOL, tokenMint], config.riskConfig);

    if (riskMetrics.isRiskLimitBreached) {
      return {
        executed: false,
        signal,
        reason: 'Risk limits breached'
      };
    }

    // Calculate trade amount
    const solBalance = await getTokenBalance(agentPubkey, TOKENS.SOL);
    const tradeAmount = Math.min(
      solBalance * 0.1, // 10% of SOL balance
      config.riskConfig.maxTradeSize
    );

    if (tradeAmount < 0.01) {
      return {
        executed: false,
        signal,
        reason: 'Insufficient balance for trade'
      };
    }

    // Validate risk
    const riskValidation = await validateTradeRisk(
      agentPubkey,
      tokenMint,
      tradeAmount,
      signal.action,
      config.riskConfig
    );

    if (!riskValidation.allowed) {
      return {
        executed: false,
        signal,
        reason: riskValidation.reason
      };
    }

    // Execute trade
    let result;
    let entryPrice = 0;

    if (signal.action === 'buy') {
      // Analyze trade before executing
      const analysis = await analyzeTradeOpportunity(agentPubkey, TOKENS.SOL, tokenMint, tradeAmount);

      if (!analysis.canTrade) {
        return {
          executed: false,
          signal,
          reason: analysis.reason
        };
      }

      entryPrice = analysis.currentPrice;

      // Execute buy
      result = await executeBuyOrder(agentPubkey, tokenMint, tradeAmount);

      // Create stop loss and take profit orders if enabled
      if (result.success && result.outputAmount) {
        if (config.useStopLoss) {
          await createStopLossOrder(
            agentId,
            agentPubkey,
            tokenMint,
            result.outputAmount / 1e9,
            entryPrice,
            config.riskConfig.stopLossPercent,
            7 // 7 days expiry
          );
        }

        if (config.useTakeProfit) {
          await createTakeProfitOrder(
            agentId,
            agentPubkey,
            tokenMint,
            result.outputAmount / 1e9,
            entryPrice,
            config.riskConfig.takeProfitPercent,
            7 // 7 days expiry
          );
        }
      }

    } else {
      // Sell
      const tokenBalance = await getTokenBalance(agentPubkey, tokenMint);
      const sellAmount = Math.min(tokenBalance * 0.5, tradeAmount); // Sell max 50% of position

      if (sellAmount < 0.001) {
        return {
          executed: false,
          signal,
          reason: 'Insufficient token balance to sell'
        };
      }

      result = await executeSellOrder(agentPubkey, tokenMint, sellAmount);
    }

    return {
      executed: true,
      action: signal.action,
      signal,
      result
    };

  } catch (error: any) {
    console.error('Error executing trading strategy:', error);
    return {
      executed: false,
      reason: `Strategy execution error: ${error.message}`
    };
  }
}

/**
 * Run automated trading bot for an agent
 */
export async function runTradingBot(
  agentId: string,
  agentPubkey: string,
  watchlist: string[],
  config: StrategyConfig = DEFAULT_STRATEGY_CONFIG
): Promise<void> {
  console.log(`Starting trading bot for agent ${agentId}`);
  console.log(`Watching ${watchlist.length} tokens`);

  for (const tokenMint of watchlist) {
    try {
      const result = await executeTradingStrategy(agentId, agentPubkey, tokenMint, config);

      if (result.executed) {
        console.log(`✅ Trade executed: ${result.action} ${tokenMint}`);
      } else {
        console.log(`⏸️  No trade: ${result.reason}`);
      }

      // Small delay between tokens
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error: any) {
      console.error(`Error trading ${tokenMint}:`, error);
    }
  }
}

/**
 * Start automated trading bot with interval
 */
export function startTradingBot(
  agentId: string,
  agentPubkey: string,
  watchlist: string[],
  config: StrategyConfig = DEFAULT_STRATEGY_CONFIG,
  intervalMinutes: number = 5
): NodeJS.Timeout {
  console.log(`Starting trading bot service (runs every ${intervalMinutes} minutes)`);

  // Initial run
  runTradingBot(agentId, agentPubkey, watchlist, config);

  // Set up interval
  return setInterval(() => {
    runTradingBot(agentId, agentPubkey, watchlist, config);
  }, intervalMinutes * 60 * 1000);
}

export default {
  generateTradingSignal,
  executeTradingStrategy,
  runTradingBot,
  startTradingBot,
  DEFAULT_STRATEGY_CONFIG
};
