import { getTokenBalance, getPortfolioValue, getTokenPrice, TOKENS } from './priceFeed';

export interface RiskConfig {
  maxPositionSize: number; // Max % of portfolio in single position
  maxDailyLoss: number; // Max % loss per day
  maxTradeSize: number; // Max SOL per trade
  maxSlippage: number; // Max slippage in bps
  maxPriceImpact: number; // Max price impact %
  stopLossPercent: number; // Stop loss trigger %
  takeProfitPercent: number; // Take profit trigger %
  minLiquidity: number; // Min liquidity required (USD)
}

// Production-ready conservative risk parameters for mainnet
export const PRODUCTION_RISK_CONFIG: RiskConfig = {
  maxPositionSize: 5, // 5% per position (very conservative)
  maxDailyLoss: 5, // 5% daily loss limit
  maxTradeSize: 0.5, // 0.5 SOL max per trade (~$100 at $200/SOL)
  maxSlippage: 50, // 0.5% (50 bps)
  maxPriceImpact: 1, // 1% max price impact
  stopLossPercent: 10, // 10% stop loss (tighter for mainnet)
  takeProfitPercent: 25, // 25% take profit (more realistic)
  minLiquidity: 50000 // $50k min liquidity (safer pools)
};

// Development/testnet risk parameters (less conservative)
export const DEVNET_RISK_CONFIG: RiskConfig = {
  maxPositionSize: 20, // 20% per position
  maxDailyLoss: 10, // 10% daily loss limit
  maxTradeSize: 1.0, // 1 SOL max per trade
  maxSlippage: 100, // 1%
  maxPriceImpact: 2, // 2%
  stopLossPercent: 15, // 15% stop loss
  takeProfitPercent: 50, // 50% take profit
  minLiquidity: 10000 // $10k min liquidity
};

// Auto-select based on environment
export const DEFAULT_RISK_CONFIG: RiskConfig =
  process.env.NODE_ENV === 'production'
    ? PRODUCTION_RISK_CONFIG
    : DEVNET_RISK_CONFIG;

export interface Position {
  tokenMint: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface RiskMetrics {
  totalValue: number;
  positions: Position[];
  largestPosition: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  isRiskLimitBreached: boolean;
  warnings: string[];
}

/**
 * Calculate position size based on risk
 */
export function calculatePositionSize(
  portfolioValue: number,
  riskConfig: RiskConfig,
  tokenPrice: number
): number {
  // Max position value in USD
  const maxPositionValue = portfolioValue * (riskConfig.maxPositionSize / 100);

  // Convert to tokens
  const maxTokens = maxPositionValue / tokenPrice;

  return maxTokens;
}

/**
 * Check if trade is within risk limits
 */
export async function validateTradeRisk(
  agentPubkey: string,
  tokenMint: string,
  tradeAmount: number,
  tradeType: 'buy' | 'sell',
  riskConfig: RiskConfig = DEFAULT_RISK_CONFIG
): Promise<{ allowed: boolean; reason?: string }> {
  try {
    // Get current portfolio
    const portfolio = await getPortfolioValue(agentPubkey, [TOKENS.SOL, tokenMint]);

    // Check max trade size
    if (tradeType === 'buy' && tradeAmount > riskConfig.maxTradeSize) {
      return {
        allowed: false,
        reason: `Trade size ${tradeAmount} SOL exceeds max trade size ${riskConfig.maxTradeSize} SOL`
      };
    }

    // Check if buying would exceed max position size
    if (tradeType === 'buy') {
      const tokenPrice = await getTokenPrice(tokenMint, TOKENS.USDC);
      const currentPrice = tokenPrice?.price || 0;

      if (currentPrice === 0) {
        return {
          allowed: false,
          reason: 'Unable to determine token price'
        };
      }

      const estimatedTokens = tradeAmount / currentPrice;
      const newPositionValue = (portfolio.breakdown[tokenMint]?.amount || 0 + estimatedTokens) * currentPrice;
      const positionPercent = (newPositionValue / portfolio.total) * 100;

      if (positionPercent > riskConfig.maxPositionSize) {
        return {
          allowed: false,
          reason: `Position would be ${positionPercent.toFixed(2)}% of portfolio, exceeds max ${riskConfig.maxPositionSize}%`
        };
      }
    }

    // Check daily loss limit (would need historical data)
    // Simplified: check if portfolio is down significantly
    const solBalance = await getTokenBalance(agentPubkey, TOKENS.SOL);
    const minSolBalance = process.env.NODE_ENV === 'production' ? 0.05 : 0.01;
    if (solBalance < minSolBalance) {
      return {
        allowed: false,
        reason: `Insufficient SOL balance for trading (< ${minSolBalance} SOL). Need buffer for transaction fees.`
      };
    }

    // Production-only: Additional safety checks
    if (process.env.NODE_ENV === 'production') {
      // Require higher minimum liquidity for production
      // This check would need to be implemented with actual liquidity data

      // Check if trade size is suspiciously large
      if (tradeType === 'buy' && tradeAmount > 5) {
        return {
          allowed: false,
          reason: `Trade size ${tradeAmount} SOL is too large for production safety (max 5 SOL per trade)`
        };
      }
    }

    return { allowed: true };

  } catch (error: any) {
    return {
      allowed: false,
      reason: `Risk validation error: ${error.message}`
    };
  }
}

/**
 * Get current risk metrics for agent
 */
export async function getRiskMetrics(
  agentPubkey: string,
  tokenMints: string[] = [TOKENS.SOL],
  riskConfig: RiskConfig = DEFAULT_RISK_CONFIG
): Promise<RiskMetrics> {
  const warnings: string[] = [];
  const positions: Position[] = [];

  try {
    // Get portfolio value
    const portfolio = await getPortfolioValue(agentPubkey, tokenMints);

    // Calculate positions
    let largestPosition = 0;

    for (const mint of tokenMints) {
      if (!portfolio.breakdown[mint]) continue;

      const { amount, value } = portfolio.breakdown[mint];
      const positionPercent = (value / portfolio.total) * 100;

      // Get current price
      const priceData = await getTokenPrice(mint, TOKENS.USDC);
      const currentPrice = priceData?.price || 0;

      // For now, we don't have entry price stored, so PnL is 0
      // This would need to be tracked in database
      positions.push({
        tokenMint: mint,
        amount,
        entryPrice: currentPrice, // Would come from DB
        currentPrice,
        value,
        pnl: 0,
        pnlPercent: 0
      });

      if (value > largestPosition) {
        largestPosition = value;
      }

      // Check position size warning
      if (positionPercent > riskConfig.maxPositionSize) {
        warnings.push(
          `Position ${mint.slice(0, 8)}... is ${positionPercent.toFixed(2)}% of portfolio (max: ${riskConfig.maxPositionSize}%)`
        );
      }
    }

    // Check largest position percentage
    const largestPositionPercent = (largestPosition / portfolio.total) * 100;
    const isRiskLimitBreached = largestPositionPercent > riskConfig.maxPositionSize;

    return {
      totalValue: portfolio.total,
      positions,
      largestPosition: largestPositionPercent,
      dailyPnl: 0, // Would need historical data
      dailyPnlPercent: 0,
      isRiskLimitBreached,
      warnings
    };

  } catch (error: any) {
    console.error('Error calculating risk metrics:', error);
    return {
      totalValue: 0,
      positions: [],
      largestPosition: 0,
      dailyPnl: 0,
      dailyPnlPercent: 0,
      isRiskLimitBreached: false,
      warnings: [`Error calculating metrics: ${error.message}`]
    };
  }
}

/**
 * Calculate stop loss price
 */
export function calculateStopLoss(
  entryPrice: number,
  stopLossPercent: number
): number {
  return entryPrice * (1 - stopLossPercent / 100);
}

/**
 * Calculate take profit price
 */
export function calculateTakeProfit(
  entryPrice: number,
  takeProfitPercent: number
): number {
  return entryPrice * (1 + takeProfitPercent / 100);
}

/**
 * Check if stop loss or take profit triggered
 */
export function checkPriceTargets(
  currentPrice: number,
  entryPrice: number,
  stopLossPercent: number,
  takeProfitPercent: number
): {
  shouldExit: boolean;
  reason?: 'stop_loss' | 'take_profit';
  pnlPercent: number;
} {
  const pnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;

  // Check stop loss
  if (pnlPercent <= -stopLossPercent) {
    return {
      shouldExit: true,
      reason: 'stop_loss',
      pnlPercent
    };
  }

  // Check take profit
  if (pnlPercent >= takeProfitPercent) {
    return {
      shouldExit: true,
      reason: 'take_profit',
      pnlPercent
    };
  }

  return {
    shouldExit: false,
    pnlPercent
  };
}

/**
 * Calculate Kelly Criterion for position sizing
 */
export function calculateKellySize(
  winRate: number,
  avgWin: number,
  avgLoss: number,
  portfolioValue: number
): number {
  // Kelly Criterion: f = (p * b - q) / b
  // f = fraction of capital to bet
  // p = probability of winning
  // q = probability of losing (1-p)
  // b = win/loss ratio

  const p = winRate / 100;
  const q = 1 - p;
  const b = avgWin / Math.abs(avgLoss);

  const kellyFraction = (p * b - q) / b;

  // Use fractional Kelly (0.5x) for safety
  const fractionalKelly = Math.max(0, Math.min(kellyFraction * 0.5, 0.25)); // Cap at 25%

  return portfolioValue * fractionalKelly;
}

/**
 * Calculate Value at Risk (VaR)
 */
export function calculateVaR(
  positions: Position[],
  confidenceLevel: number = 0.95
): number {
  // Simplified VaR calculation
  // In production, would use historical volatility and correlation

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

  // Assuming 2% daily volatility (conservative estimate)
  const dailyVolatility = 0.02;

  // Z-score for 95% confidence is 1.645
  const zScore = confidenceLevel === 0.95 ? 1.645 : 2.326;

  const var95 = totalValue * dailyVolatility * zScore;

  return var95;
}

/**
 * Diversification score (0-100)
 */
export function calculateDiversificationScore(positions: Position[]): number {
  if (positions.length === 0) return 0;
  if (positions.length === 1) return 20;

  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

  // Calculate Herfindahl-Hirschman Index (HHI)
  let hhi = 0;
  for (const position of positions) {
    const marketShare = position.value / totalValue;
    hhi += marketShare * marketShare;
  }

  // Convert HHI to diversification score (0-100)
  // HHI ranges from 1/n (perfectly diversified) to 1 (concentrated)
  const minHHI = 1 / positions.length;
  const normalizedHHI = (hhi - minHHI) / (1 - minHHI);
  const diversificationScore = (1 - normalizedHHI) * 100;

  return Math.round(diversificationScore);
}

/**
 * Check if position needs rebalancing
 */
export function needsRebalancing(
  positions: Position[],
  targetAllocation: { [tokenMint: string]: number },
  threshold: number = 5 // 5% deviation threshold
): { needsRebalancing: boolean; adjustments: { [tokenMint: string]: number } } {
  const totalValue = positions.reduce((sum, p) => sum + p.value, 0);
  const adjustments: { [tokenMint: string]: number } = {};
  let needsRebalancing = false;

  for (const position of positions) {
    const currentAllocation = (position.value / totalValue) * 100;
    const targetAllocation_ = targetAllocation[position.tokenMint] || 0;
    const deviation = Math.abs(currentAllocation - targetAllocation_);

    if (deviation > threshold) {
      needsRebalancing = true;
      adjustments[position.tokenMint] = targetAllocation_ - currentAllocation;
    }
  }

  return { needsRebalancing, adjustments };
}

export default {
  calculatePositionSize,
  validateTradeRisk,
  getRiskMetrics,
  calculateStopLoss,
  calculateTakeProfit,
  checkPriceTargets,
  calculateKellySize,
  calculateVaR,
  calculateDiversificationScore,
  needsRebalancing,
  DEFAULT_RISK_CONFIG
};
