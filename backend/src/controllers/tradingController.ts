import { Request, Response } from 'express';
import {
  getTokenPrice,
  getMultipleTokenPrices,
  getSwapQuote,
  getSolPrice,
  getTokenBalance,
  getPortfolioValue,
  TOKENS
} from '../services/priceFeed';
import {
  executeSwap,
  executeBuyOrder,
  executeSellOrder,
  analyzeTradeOpportunity,
  simulateTrade,
  isTokenTradeable,
  getBestRoute
} from '../services/tradingEngine';
import {
  validateTradeRisk,
  getRiskMetrics,
  calculateStopLoss,
  calculateTakeProfit,
  DEFAULT_RISK_CONFIG
} from '../services/riskManager';
import {
  createStopLossOrder,
  createTakeProfitOrder,
  createLimitBuyOrder,
  createLimitSellOrder,
  cancelOrder,
  getAgentOrders,
  getAgentTradeHistory,
  getAgentTradingStats
} from '../services/orderManager';
import {
  generateTradingSignal,
  executeTradingStrategy,
  DEFAULT_STRATEGY_CONFIG
} from '../services/tradingStrategy';

/**
 * Get token price
 * GET /api/trading/price/:tokenMint
 */
export async function getTokenPriceHandler(req: Request, res: Response) {
  try {
    const { tokenMint } = req.params;
    const { vsToken } = req.query;

    const price = await getTokenPrice(
      tokenMint,
      vsToken as string || TOKENS.USDC
    );

    if (!price) {
      return res.status(404).json({
        error: 'Token price not found'
      });
    }

    res.json({
      success: true,
      tokenMint,
      price: price.price,
      vsToken: price.vsToken,
      extraInfo: price.extraInfo
    });
  } catch (error: any) {
    console.error('Error getting token price:', error);
    res.status(500).json({
      error: 'Failed to get token price',
      details: error.message
    });
  }
}

/**
 * Get multiple token prices
 * POST /api/trading/prices
 */
export async function getMultiplePricesHandler(req: Request, res: Response) {
  try {
    const { tokenMints, vsToken } = req.body;

    if (!Array.isArray(tokenMints) || tokenMints.length === 0) {
      return res.status(400).json({
        error: 'tokenMints must be a non-empty array'
      });
    }

    const prices = await getMultipleTokenPrices(
      tokenMints,
      vsToken || TOKENS.USDC
    );

    res.json({
      success: true,
      prices
    });
  } catch (error: any) {
    console.error('Error getting multiple prices:', error);
    res.status(500).json({
      error: 'Failed to get prices',
      details: error.message
    });
  }
}

/**
 * Get swap quote
 * POST /api/trading/quote
 */
export async function getQuoteHandler(req: Request, res: Response) {
  try {
    const { inputMint, outputMint, amount, slippageBps } = req.body;

    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: inputMint, outputMint, amount'
      });
    }

    const quote = await getSwapQuote(
      inputMint,
      outputMint,
      amount,
      slippageBps || 50
    );

    if (!quote) {
      return res.status(404).json({
        error: 'No quote available for this swap'
      });
    }

    res.json({
      success: true,
      quote: {
        inputMint: quote.inputMint,
        outputMint: quote.outputMint,
        inAmount: quote.inAmount,
        outAmount: quote.outAmount,
        priceImpactPct: quote.priceImpactPct,
        slippageBps: quote.slippageBps
      }
    });
  } catch (error: any) {
    console.error('Error getting quote:', error);
    res.status(500).json({
      error: 'Failed to get quote',
      details: error.message
    });
  }
}

/**
 * Execute a swap
 * POST /api/trading/swap
 */
export async function executeSwapHandler(req: Request, res: Response) {
  try {
    const {
      agentPubkey,
      inputMint,
      outputMint,
      amount,
      slippageBps,
      priorityFee
    } = req.body;

    if (!agentPubkey || !inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Missing required fields: agentPubkey, inputMint, outputMint, amount'
      });
    }

    const result = await executeSwap({
      agentPubkey,
      inputMint,
      outputMint,
      amount,
      slippageBps,
      priorityFee
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      signature: result.signature,
      inputAmount: result.inputAmount,
      outputAmount: result.outputAmount,
      priceImpact: result.priceImpact
    });
  } catch (error: any) {
    console.error('Error executing swap:', error);
    res.status(500).json({
      error: 'Failed to execute swap',
      details: error.message
    });
  }
}

/**
 * Execute buy order
 * POST /api/trading/buy
 */
export async function buyHandler(req: Request, res: Response) {
  try {
    const { agentPubkey, tokenMint, solAmount, slippageBps } = req.body;

    if (!agentPubkey || !tokenMint || !solAmount) {
      return res.status(400).json({
        error: 'Missing required fields: agentPubkey, tokenMint, solAmount'
      });
    }

    const result = await executeBuyOrder(
      agentPubkey,
      tokenMint,
      solAmount,
      slippageBps || 50
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      signature: result.signature,
      inputAmount: result.inputAmount / 1e9,
      outputAmount: result.outputAmount / 1e9,
      priceImpact: result.priceImpact,
      message: 'Buy order executed successfully'
    });
  } catch (error: any) {
    console.error('Error executing buy:', error);
    res.status(500).json({
      error: 'Failed to execute buy',
      details: error.message
    });
  }
}

/**
 * Execute sell order
 * POST /api/trading/sell
 */
export async function sellHandler(req: Request, res: Response) {
  try {
    const { agentPubkey, tokenMint, tokenAmount, slippageBps } = req.body;

    if (!agentPubkey || !tokenMint || !tokenAmount) {
      return res.status(400).json({
        error: 'Missing required fields: agentPubkey, tokenMint, tokenAmount'
      });
    }

    const result = await executeSellOrder(
      agentPubkey,
      tokenMint,
      tokenAmount,
      slippageBps || 50
    );

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      signature: result.signature,
      inputAmount: result.inputAmount / 1e9,
      outputAmount: result.outputAmount / 1e9,
      priceImpact: result.priceImpact,
      message: 'Sell order executed successfully'
    });
  } catch (error: any) {
    console.error('Error executing sell:', error);
    res.status(500).json({
      error: 'Failed to execute sell',
      details: error.message
    });
  }
}

/**
 * Analyze trade opportunity
 * POST /api/trading/analyze
 */
export async function analyzeTradeHandler(req: Request, res: Response) {
  try {
    const { agentPubkey, inputMint, outputMint, amount, maxPriceImpact } = req.body;

    if (!agentPubkey || !inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const analysis = await analyzeTradeOpportunity(
      agentPubkey,
      inputMint,
      outputMint,
      amount,
      maxPriceImpact
    );

    res.json({
      success: true,
      analysis
    });
  } catch (error: any) {
    console.error('Error analyzing trade:', error);
    res.status(500).json({
      error: 'Failed to analyze trade',
      details: error.message
    });
  }
}

/**
 * Simulate trade
 * POST /api/trading/simulate
 */
export async function simulateTradeHandler(req: Request, res: Response) {
  try {
    const { inputMint, outputMint, amount } = req.body;

    if (!inputMint || !outputMint || !amount) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const simulation = await simulateTrade(inputMint, outputMint, amount);

    res.json({
      success: true,
      simulation
    });
  } catch (error: any) {
    console.error('Error simulating trade:', error);
    res.status(500).json({
      error: 'Failed to simulate trade',
      details: error.message
    });
  }
}

/**
 * Get portfolio value
 * GET /api/trading/portfolio/:walletAddress
 */
export async function getPortfolioHandler(req: Request, res: Response) {
  try {
    const { walletAddress } = req.params;
    const { tokens } = req.query;

    let tokenMints = [TOKENS.SOL];
    if (tokens && typeof tokens === 'string') {
      tokenMints = tokens.split(',');
    }

    const portfolio = await getPortfolioValue(walletAddress, tokenMints);

    res.json({
      success: true,
      walletAddress,
      totalValue: portfolio.total,
      breakdown: portfolio.breakdown
    });
  } catch (error: any) {
    console.error('Error getting portfolio:', error);
    res.status(500).json({
      error: 'Failed to get portfolio',
      details: error.message
    });
  }
}

/**
 * Get risk metrics
 * GET /api/trading/risk/:agentPubkey
 */
export async function getRiskMetricsHandler(req: Request, res: Response) {
  try {
    const { agentPubkey } = req.params;
    const { tokens } = req.query;

    let tokenMints = [TOKENS.SOL];
    if (tokens && typeof tokens === 'string') {
      tokenMints = tokens.split(',');
    }

    const metrics = await getRiskMetrics(agentPubkey, tokenMints);

    res.json({
      success: true,
      metrics
    });
  } catch (error: any) {
    console.error('Error getting risk metrics:', error);
    res.status(500).json({
      error: 'Failed to get risk metrics',
      details: error.message
    });
  }
}

/**
 * Create stop loss order
 * POST /api/trading/orders/stop-loss
 */
export async function createStopLossHandler(req: Request, res: Response) {
  try {
    const {
      agentId,
      agentPubkey,
      tokenMint,
      amount,
      entryPrice,
      stopLossPercent,
      expiresInDays
    } = req.body;

    if (!agentId || !agentPubkey || !tokenMint || !amount || !entryPrice || !stopLossPercent) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const order = await createStopLossOrder(
      agentId,
      agentPubkey,
      tokenMint,
      amount,
      entryPrice,
      stopLossPercent,
      expiresInDays
    );

    res.json({
      success: true,
      order: {
        id: order.id,
        orderType: order.orderType,
        triggerPrice: order.triggerPrice,
        amount: order.amount,
        status: order.status,
        expiresAt: order.expiresAt
      },
      message: 'Stop loss order created'
    });
  } catch (error: any) {
    console.error('Error creating stop loss:', error);
    res.status(500).json({
      error: 'Failed to create stop loss',
      details: error.message
    });
  }
}

/**
 * Create take profit order
 * POST /api/trading/orders/take-profit
 */
export async function createTakeProfitHandler(req: Request, res: Response) {
  try {
    const {
      agentId,
      agentPubkey,
      tokenMint,
      amount,
      entryPrice,
      takeProfitPercent,
      expiresInDays
    } = req.body;

    if (!agentId || !agentPubkey || !tokenMint || !amount || !entryPrice || !takeProfitPercent) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const order = await createTakeProfitOrder(
      agentId,
      agentPubkey,
      tokenMint,
      amount,
      entryPrice,
      takeProfitPercent,
      expiresInDays
    );

    res.json({
      success: true,
      order: {
        id: order.id,
        orderType: order.orderType,
        triggerPrice: order.triggerPrice,
        amount: order.amount,
        status: order.status,
        expiresAt: order.expiresAt
      },
      message: 'Take profit order created'
    });
  } catch (error: any) {
    console.error('Error creating take profit:', error);
    res.status(500).json({
      error: 'Failed to create take profit',
      details: error.message
    });
  }
}

/**
 * Create limit order
 * POST /api/trading/orders/limit
 */
export async function createLimitOrderHandler(req: Request, res: Response) {
  try {
    const {
      agentId,
      agentPubkey,
      tokenMint,
      amount,
      limitPrice,
      side,
      expiresInDays
    } = req.body;

    if (!agentId || !agentPubkey || !tokenMint || !amount || !limitPrice || !side) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    let order;
    if (side === 'buy') {
      order = await createLimitBuyOrder(
        agentId,
        agentPubkey,
        tokenMint,
        amount,
        limitPrice,
        expiresInDays
      );
    } else if (side === 'sell') {
      order = await createLimitSellOrder(
        agentId,
        agentPubkey,
        tokenMint,
        amount,
        limitPrice,
        expiresInDays
      );
    } else {
      return res.status(400).json({
        error: 'Invalid side. Must be "buy" or "sell"'
      });
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        orderType: order.orderType,
        triggerPrice: order.triggerPrice,
        amount: order.amount,
        status: order.status,
        expiresAt: order.expiresAt
      },
      message: `Limit ${side} order created`
    });
  } catch (error: any) {
    console.error('Error creating limit order:', error);
    res.status(500).json({
      error: 'Failed to create limit order',
      details: error.message
    });
  }
}

/**
 * Cancel order
 * DELETE /api/trading/orders/:orderId
 */
export async function cancelOrderHandler(req: Request, res: Response) {
  try {
    const { orderId } = req.params;

    const cancelled = await cancelOrder(orderId);

    if (!cancelled) {
      return res.status(404).json({
        error: 'Order not found or cannot be cancelled'
      });
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    res.status(500).json({
      error: 'Failed to cancel order',
      details: error.message
    });
  }
}

/**
 * Get agent orders
 * GET /api/trading/orders/:agentId
 */
export async function getOrdersHandler(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { status } = req.query;

    const orders = await getAgentOrders(
      agentId,
      status as any
    );

    res.json({
      success: true,
      count: orders.length,
      orders: orders.map(order => ({
        id: order.id,
        tokenMint: order.tokenMint,
        orderType: order.orderType,
        entryPrice: order.entryPrice,
        triggerPrice: order.triggerPrice,
        amount: order.amount,
        status: order.status,
        executedPrice: order.executedPrice,
        executedAt: order.executedAt,
        expiresAt: order.expiresAt,
        createdAt: order.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error getting orders:', error);
    res.status(500).json({
      error: 'Failed to get orders',
      details: error.message
    });
  }
}

/**
 * Get trade history
 * GET /api/trading/history/:agentId
 */
export async function getTradeHistoryHandler(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const trades = await getAgentTradeHistory(agentId, limit);

    res.json({
      success: true,
      count: trades.length,
      trades: trades.map(trade => ({
        id: trade.id,
        tradeType: trade.tradeType,
        inputMint: trade.inputMint,
        outputMint: trade.outputMint,
        inputAmount: trade.inputAmount,
        outputAmount: trade.outputAmount,
        price: trade.price,
        priceImpact: trade.priceImpact,
        txSignature: trade.txSignature,
        success: trade.success,
        error: trade.error,
        createdAt: trade.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error getting trade history:', error);
    res.status(500).json({
      error: 'Failed to get trade history',
      details: error.message
    });
  }
}

/**
 * Get trading statistics
 * GET /api/trading/stats/:agentId
 */
export async function getTradingStatsHandler(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    const stats = await getAgentTradingStats(agentId);

    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    console.error('Error getting trading stats:', error);
    res.status(500).json({
      error: 'Failed to get trading stats',
      details: error.message
    });
  }
}

/**
 * Generate trading signal
 * POST /api/trading/signal
 */
export async function generateSignalHandler(req: Request, res: Response) {
  try {
    const { tokenMint, strategy } = req.body;

    if (!tokenMint) {
      return res.status(400).json({
        error: 'Missing required field: tokenMint'
      });
    }

    const signal = await generateTradingSignal(
      tokenMint,
      strategy || 'momentum'
    );

    res.json({
      success: true,
      signal
    });
  } catch (error: any) {
    console.error('Error generating signal:', error);
    res.status(500).json({
      error: 'Failed to generate signal',
      details: error.message
    });
  }
}

/**
 * Execute trading strategy
 * POST /api/trading/strategy/execute
 */
export async function executeStrategyHandler(req: Request, res: Response) {
  try {
    const { agentId, agentPubkey, tokenMint, config } = req.body;

    if (!agentId || !agentPubkey || !tokenMint) {
      return res.status(400).json({
        error: 'Missing required fields: agentId, agentPubkey, tokenMint'
      });
    }

    const result = await executeTradingStrategy(
      agentId,
      agentPubkey,
      tokenMint,
      config || DEFAULT_STRATEGY_CONFIG
    );

    res.json({
      success: true,
      result
    });
  } catch (error: any) {
    console.error('Error executing strategy:', error);
    res.status(500).json({
      error: 'Failed to execute strategy',
      details: error.message
    });
  }
}

export default {
  getTokenPriceHandler,
  getMultiplePricesHandler,
  getQuoteHandler,
  executeSwapHandler,
  buyHandler,
  sellHandler,
  analyzeTradeHandler,
  simulateTradeHandler,
  getPortfolioHandler,
  getRiskMetricsHandler,
  createStopLossHandler,
  createTakeProfitHandler,
  createLimitOrderHandler,
  cancelOrderHandler,
  getOrdersHandler,
  getTradeHistoryHandler,
  getTradingStatsHandler,
  generateSignalHandler,
  executeStrategyHandler
};
