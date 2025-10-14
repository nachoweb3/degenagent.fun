import { TradingOrder, TradeHistory } from '../models/TradingOrder';
import { getTokenPrice, PriceMonitor, TOKENS } from './priceFeed';
import { executeSellOrder, executeBuyOrder } from './tradingEngine';
import { Op } from 'sequelize';

/**
 * Create a stop loss order
 */
export async function createStopLossOrder(
  agentId: string,
  agentPubkey: string,
  tokenMint: string,
  amount: number,
  entryPrice: number,
  stopLossPercent: number,
  expiresInDays?: number
): Promise<TradingOrder> {
  const triggerPrice = entryPrice * (1 - stopLossPercent / 100);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const order = await TradingOrder.create({
    agentId,
    agentPubkey,
    tokenMint,
    orderType: 'stop_loss',
    entryPrice,
    triggerPrice,
    amount,
    status: 'active',
    expiresAt
  });

  console.log(`Stop loss order created: ${order.id} at ${triggerPrice}`);
  return order;
}

/**
 * Create a take profit order
 */
export async function createTakeProfitOrder(
  agentId: string,
  agentPubkey: string,
  tokenMint: string,
  amount: number,
  entryPrice: number,
  takeProfitPercent: number,
  expiresInDays?: number
): Promise<TradingOrder> {
  const triggerPrice = entryPrice * (1 + takeProfitPercent / 100);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const order = await TradingOrder.create({
    agentId,
    agentPubkey,
    tokenMint,
    orderType: 'take_profit',
    entryPrice,
    triggerPrice,
    amount,
    status: 'active',
    expiresAt
  });

  console.log(`Take profit order created: ${order.id} at ${triggerPrice}`);
  return order;
}

/**
 * Create a limit buy order
 */
export async function createLimitBuyOrder(
  agentId: string,
  agentPubkey: string,
  tokenMint: string,
  amount: number,
  limitPrice: number,
  expiresInDays?: number
): Promise<TradingOrder> {
  const currentPrice = await getTokenPrice(tokenMint, TOKENS.SOL);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const order = await TradingOrder.create({
    agentId,
    agentPubkey,
    tokenMint,
    orderType: 'limit_buy',
    entryPrice: currentPrice?.price || 0,
    triggerPrice: limitPrice,
    amount,
    status: 'active',
    expiresAt
  });

  console.log(`Limit buy order created: ${order.id} at ${limitPrice}`);
  return order;
}

/**
 * Create a limit sell order
 */
export async function createLimitSellOrder(
  agentId: string,
  agentPubkey: string,
  tokenMint: string,
  amount: number,
  limitPrice: number,
  expiresInDays?: number
): Promise<TradingOrder> {
  const currentPrice = await getTokenPrice(tokenMint, TOKENS.SOL);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : undefined;

  const order = await TradingOrder.create({
    agentId,
    agentPubkey,
    tokenMint,
    orderType: 'limit_sell',
    entryPrice: currentPrice?.price || 0,
    triggerPrice: limitPrice,
    amount,
    status: 'active',
    expiresAt
  });

  console.log(`Limit sell order created: ${order.id} at ${limitPrice}`);
  return order;
}

/**
 * Check if order should be triggered
 */
function shouldTriggerOrder(order: TradingOrder, currentPrice: number): boolean {
  switch (order.orderType) {
    case 'stop_loss':
      // Trigger if price falls below trigger
      return currentPrice <= order.triggerPrice;

    case 'take_profit':
      // Trigger if price rises above trigger
      return currentPrice >= order.triggerPrice;

    case 'limit_buy':
      // Trigger if price falls to or below limit
      return currentPrice <= order.triggerPrice;

    case 'limit_sell':
      // Trigger if price rises to or above limit
      return currentPrice >= order.triggerPrice;

    default:
      return false;
  }
}

/**
 * Execute a triggered order
 */
async function executeOrder(order: TradingOrder, currentPrice: number): Promise<void> {
  try {
    // Mark as triggered
    await order.update({ status: 'triggered' });

    let result;

    // Execute trade based on order type
    switch (order.orderType) {
      case 'stop_loss':
      case 'limit_sell':
        // Sell order
        result = await executeSellOrder(
          order.agentPubkey,
          order.tokenMint,
          order.amount
        );
        break;

      case 'take_profit':
        // Also a sell order
        result = await executeSellOrder(
          order.agentPubkey,
          order.tokenMint,
          order.amount
        );
        break;

      case 'limit_buy':
        // Buy order
        result = await executeBuyOrder(
          order.agentPubkey,
          order.tokenMint,
          order.amount
        );
        break;

      default:
        throw new Error(`Unknown order type: ${order.orderType}`);
    }

    if (result.success && result.signature) {
      // Update order as executed
      await order.update({
        status: 'executed',
        executedPrice: currentPrice,
        executedAmount: result.outputAmount,
        executedTxSignature: result.signature,
        executedAt: new Date()
      });

      // Record trade history
      await TradeHistory.create({
        agentId: order.agentId,
        agentPubkey: order.agentPubkey,
        tradeType: order.orderType.includes('buy') ? 'buy' : 'sell',
        inputMint: result.inputMint,
        outputMint: result.outputMint,
        inputAmount: result.inputAmount,
        outputAmount: result.outputAmount,
        price: currentPrice,
        priceImpact: result.priceImpact,
        txSignature: result.signature,
        success: true,
        orderId: order.id
      });

      console.log(`Order ${order.id} executed successfully: ${result.signature}`);
    } else {
      // Execution failed
      await order.update({ status: 'active' }); // Revert to active to retry

      // Record failed trade
      await TradeHistory.create({
        agentId: order.agentId,
        agentPubkey: order.agentPubkey,
        tradeType: order.orderType.includes('buy') ? 'buy' : 'sell',
        inputMint: result.inputMint,
        outputMint: result.outputMint,
        inputAmount: result.inputAmount,
        outputAmount: result.outputAmount,
        price: currentPrice,
        priceImpact: result.priceImpact,
        txSignature: result.signature || 'none',
        success: false,
        error: result.error,
        orderId: order.id
      });

      console.error(`Order ${order.id} execution failed:`, result.error);
    }

  } catch (error: any) {
    console.error(`Error executing order ${order.id}:`, error);
    await order.update({ status: 'active' }); // Revert to retry
  }
}

/**
 * Monitor orders and execute when triggered
 */
export async function monitorOrders(): Promise<void> {
  try {
    // Get all active orders (either no expiry or not yet expired)
    const now = new Date();
    const orders = await TradingOrder.findAll({
      where: {
        [Op.and]: [
          { status: 'active' },
          {
            [Op.or]: [
              { expiresAt: null as any },
              { expiresAt: { [Op.gt]: now } }
            ]
          }
        ]
      }
    });

    if (orders.length === 0) {
      return;
    }

    console.log(`Monitoring ${orders.length} active orders`);

    // Group orders by token
    const ordersByToken = new Map<string, TradingOrder[]>();
    for (const order of orders) {
      const existing = ordersByToken.get(order.tokenMint) || [];
      existing.push(order);
      ordersByToken.set(order.tokenMint, existing);
    }

    // Check each token's orders
    for (const [tokenMint, tokenOrders] of ordersByToken.entries()) {
      try {
        const priceData = await getTokenPrice(tokenMint, TOKENS.SOL);
        if (!priceData) continue;

        const currentPrice = priceData.price;

        // Check each order
        for (const order of tokenOrders) {
          if (shouldTriggerOrder(order, currentPrice)) {
            console.log(`Order ${order.id} triggered at price ${currentPrice}`);
            await executeOrder(order, currentPrice);
          }
        }
      } catch (error: any) {
        console.error(`Error checking orders for ${tokenMint}:`, error);
      }
    }

    // Expire old orders
    await TradingOrder.update(
      { status: 'expired' },
      {
        where: {
          status: 'active',
          expiresAt: { [Op.lte]: new Date() }
        }
      }
    );

  } catch (error: any) {
    console.error('Error monitoring orders:', error);
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string): Promise<boolean> {
  try {
    const order = await TradingOrder.findByPk(orderId);
    if (!order) {
      return false;
    }

    if (order.status !== 'active') {
      return false;
    }

    await order.update({ status: 'cancelled' });
    console.log(`Order ${orderId} cancelled`);
    return true;

  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return false;
  }
}

/**
 * Get active orders for an agent
 */
export async function getAgentOrders(
  agentId: string,
  status?: 'active' | 'triggered' | 'executed' | 'cancelled' | 'expired'
): Promise<TradingOrder[]> {
  const where: any = { agentId };
  if (status) {
    where.status = status;
  }

  return TradingOrder.findAll({
    where,
    order: [['createdAt', 'DESC']]
  });
}

/**
 * Get trade history for an agent
 */
export async function getAgentTradeHistory(
  agentId: string,
  limit: number = 50
): Promise<TradeHistory[]> {
  return TradeHistory.findAll({
    where: { agentId },
    order: [['createdAt', 'DESC']],
    limit
  });
}

/**
 * Calculate trading statistics for an agent
 */
export async function getAgentTradingStats(agentId: string): Promise<{
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  winRate: number;
  totalVolume: number;
  avgPriceImpact: number;
}> {
  const trades = await TradeHistory.findAll({ where: { agentId } });

  const totalTrades = trades.length;
  const successfulTrades = trades.filter(t => t.success).length;
  const failedTrades = totalTrades - successfulTrades;
  const winRate = totalTrades > 0 ? (successfulTrades / totalTrades) * 100 : 0;

  const totalVolume = trades.reduce((sum, t) => sum + t.inputAmount, 0);
  const avgPriceImpact = totalTrades > 0
    ? trades.reduce((sum, t) => sum + t.priceImpact, 0) / totalTrades
    : 0;

  return {
    totalTrades,
    successfulTrades,
    failedTrades,
    winRate,
    totalVolume,
    avgPriceImpact
  };
}

/**
 * Start order monitoring service
 */
export function startOrderMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
  console.log('Starting order monitoring service...');

  // Initial check
  monitorOrders();

  // Set up interval
  return setInterval(() => {
    monitorOrders();
  }, intervalMs);
}

export default {
  createStopLossOrder,
  createTakeProfitOrder,
  createLimitBuyOrder,
  createLimitSellOrder,
  monitorOrders,
  cancelOrder,
  getAgentOrders,
  getAgentTradeHistory,
  getAgentTradingStats,
  startOrderMonitoring
};
