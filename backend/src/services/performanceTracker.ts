import Performance from '../models/Performance';
import Trade from '../models/Trade';
import { Op } from 'sequelize';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalProfitLoss: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  roi: number;
  volume24h: number;
  volume7d: number;
  volume30d: number;
  volumeAllTime: number;
}

/**
 * Calculate performance metrics for an agent
 */
export async function calculatePerformanceMetrics(
  agentId: string,
  timeframe?: { start: Date; end: Date }
): Promise<PerformanceMetrics> {
  try {
    const whereClause: any = { agentId };

    if (timeframe) {
      whereClause.createdAt = {
        [Op.between]: [timeframe.start, timeframe.end],
      };
    }

    // Fetch all trades for the agent
    const trades = await Trade.findAll({
      where: whereClause,
      order: [['createdAt', 'ASC']],
    });

    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfitLoss: 0,
        winRate: 0,
        averageProfit: 0,
        averageLoss: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        roi: 0,
        volume24h: 0,
        volume7d: 0,
        volume30d: 0,
        volumeAllTime: 0,
      };
    }

    // Calculate basic metrics
    const totalTrades = trades.length;
    const profitableTrades = trades.filter((t) => {
      const profitLoss = parseFloat(t.profitLoss || '0');
      return profitLoss > 0;
    });
    const losingTrades = trades.filter((t) => {
      const profitLoss = parseFloat(t.profitLoss || '0');
      return profitLoss < 0;
    });

    const winningTrades = profitableTrades.length;
    const losingCount = losingTrades.length;

    const totalProfitLoss = trades.reduce(
      (sum, t) => sum + parseFloat(t.profitLoss || '0'),
      0
    );

    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    const averageProfit =
      winningTrades > 0
        ? profitableTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) /
          winningTrades
        : 0;

    const averageLoss =
      losingCount > 0
        ? Math.abs(
            losingTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0) /
              losingCount
          )
        : 0;

    // Calculate profit factor (total profit / total loss)
    const totalProfit = profitableTrades.reduce(
      (sum, t) => sum + parseFloat(t.profitLoss || '0'),
      0
    );
    const totalLoss = Math.abs(
      losingTrades.reduce((sum, t) => sum + parseFloat(t.profitLoss || '0'), 0)
    );
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    // Calculate Sharpe Ratio (simplified)
    const returns = trades.map((t) => parseFloat(t.profitLoss || '0'));
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance =
      returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    const sharpeRatio = stdDev > 0 ? meanReturn / stdDev : 0;

    // Calculate Maximum Drawdown
    let maxDrawdown = 0;
    let peak = 0;
    let runningTotal = 0;

    trades.forEach((trade) => {
      runningTotal += parseFloat(trade.profitLoss || '0');
      if (runningTotal > peak) {
        peak = runningTotal;
      }
      const drawdown = peak - runningTotal;
      if (drawdown > maxDrawdown) {
        maxDrawdown = drawdown;
      }
    });

    // Calculate ROI (simplified - total profit / initial capital)
    // Assuming initial capital of 10 SOL for now
    const initialCapital = 10;
    const roi = (totalProfitLoss / initialCapital) * 100;

    // Calculate volume metrics
    const now = new Date();
    const volume24h = calculateVolume(trades, 24);
    const volume7d = calculateVolume(trades, 24 * 7);
    const volume30d = calculateVolume(trades, 24 * 30);
    const volumeAllTime = trades.reduce(
      (sum, t) => sum + parseFloat(t.amountIn || '0'),
      0
    );

    return {
      totalTrades,
      winningTrades,
      losingTrades: losingCount,
      totalProfitLoss,
      winRate,
      averageProfit,
      averageLoss,
      profitFactor: isFinite(profitFactor) ? profitFactor : 0,
      sharpeRatio: isFinite(sharpeRatio) ? sharpeRatio : 0,
      maxDrawdown,
      roi,
      volume24h,
      volume7d,
      volume30d,
      volumeAllTime,
    };
  } catch (error) {
    logger.error('PERFORMANCE', 'Error calculating performance metrics', error, { agentId });
    throw error;
  }
}

/**
 * Calculate volume within a time window (in hours)
 */
function calculateVolume(trades: Trade[], hoursAgo: number): number {
  const cutoff = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  return trades
    .filter((t) => new Date(t.createdAt) >= cutoff)
    .reduce((sum, t) => sum + parseFloat(t.amountIn || '0'), 0);
}

/**
 * Update performance record for an agent
 */
export async function updateAgentPerformance(agentId: string): Promise<Performance> {
  try {
    const metrics = await calculatePerformanceMetrics(agentId);

    // Get or create performance record
    const [performance] = await Performance.findOrCreate({
      where: { agentId },
      defaults: {
        agentId,
        timestamp: new Date(),
        ...metrics,
        rank: 0,
        rankChange: 0,
      },
    });

    // Update the record
    await performance.update({
      timestamp: new Date(),
      totalTrades: metrics.totalTrades,
      winningTrades: metrics.winningTrades,
      losingTrades: metrics.losingTrades,
      totalProfitLoss: metrics.totalProfitLoss.toString(),
      winRate: metrics.winRate,
      averageProfit: metrics.averageProfit.toString(),
      averageLoss: metrics.averageLoss.toString(),
      profitFactor: metrics.profitFactor,
      sharpeRatio: metrics.sharpeRatio,
      maxDrawdown: metrics.maxDrawdown.toString(),
      roi: metrics.roi,
      volume24h: metrics.volume24h.toString(),
      volume7d: metrics.volume7d.toString(),
      volume30d: metrics.volume30d.toString(),
      volumeAllTime: metrics.volumeAllTime.toString(),
    });

    logger.info('PERFORMANCE', 'Performance updated', {
      agentId,
      totalTrades: metrics.totalTrades,
      winRate: metrics.winRate.toFixed(2),
      roi: metrics.roi.toFixed(2),
    });

    return performance;
  } catch (error) {
    logger.error('PERFORMANCE', 'Error updating agent performance', error, { agentId });
    throw error;
  }
}

/**
 * Update rankings for all agents
 */
export async function updateRankings(): Promise<void> {
  try {
    // Get all performances sorted by ROI
    const performances = await Performance.findAll({
      order: [['roi', 'DESC']],
    });

    // Update ranks
    for (let i = 0; i < performances.length; i++) {
      const performance = performances[i];
      const oldRank = performance.rank;
      const newRank = i + 1;
      const rankChange = oldRank > 0 ? oldRank - newRank : 0;

      await performance.update({
        rank: newRank,
        rankChange,
      });
    }

    logger.info('PERFORMANCE', 'Rankings updated', {
      totalAgents: performances.length,
    });
  } catch (error) {
    logger.error('PERFORMANCE', 'Error updating rankings', error);
    throw error;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 100): Promise<Performance[]> {
  try {
    return await Performance.findAll({
      order: [['rank', 'ASC']],
      limit,
    });
  } catch (error) {
    logger.error('PERFORMANCE', 'Error fetching leaderboard', error);
    throw error;
  }
}

/**
 * Get performance history for an agent
 */
export async function getPerformanceHistory(
  agentId: string,
  days: number = 30
): Promise<Performance[]> {
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    return await Performance.findAll({
      where: {
        agentId,
        timestamp: {
          [Op.gte]: cutoff,
        },
      },
      order: [['timestamp', 'ASC']],
    });
  } catch (error) {
    logger.error('PERFORMANCE', 'Error fetching performance history', error, { agentId });
    throw error;
  }
}

/**
 * Schedule performance updates (call this from a cron job or interval)
 */
export async function schedulePerformanceUpdates(): Promise<void> {
  try {
    logger.info('PERFORMANCE', 'Starting scheduled performance updates');

    // Get all unique agent IDs from trades
    const trades = await Trade.findAll({
      attributes: ['agentId'],
      group: ['agentId'],
    });

    const agentIds = trades.map((t) => t.agentId);

    // Update performance for each agent
    for (const agentId of agentIds) {
      try {
        await updateAgentPerformance(agentId);
      } catch (error) {
        logger.error('PERFORMANCE', 'Error updating agent performance in batch', error, {
          agentId,
        });
        // Continue with next agent
      }
    }

    // Update rankings
    await updateRankings();

    logger.info('PERFORMANCE', 'Scheduled performance updates completed', {
      agentsUpdated: agentIds.length,
    });
  } catch (error) {
    logger.error('PERFORMANCE', 'Error in scheduled performance updates', error);
  }
}
