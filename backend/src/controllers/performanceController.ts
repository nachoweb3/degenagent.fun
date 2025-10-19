import { Request, Response } from 'express';
import Performance from '../models/Performance';
import {
  calculatePerformanceMetrics,
  updateAgentPerformance,
  getLeaderboard,
  getPerformanceHistory,
} from '../services/performanceTracker';
import { logger } from '../utils/logger';

/**
 * GET /api/performance/:agentId
 * Get current performance metrics for an agent
 */
export async function getAgentPerformance(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    logger.info('PERFORMANCE', `Fetching performance for agent ${agentId}`);

    // Try to get existing performance record
    let performance = await Performance.findOne({
      where: { agentId },
    });

    // If not found or outdated (> 5 minutes), recalculate
    if (
      !performance ||
      new Date().getTime() - new Date(performance.updatedAt).getTime() > 5 * 60 * 1000
    ) {
      performance = await updateAgentPerformance(agentId);
    }

    res.json({
      success: true,
      performance: {
        agentId: performance.agentId,
        totalTrades: performance.totalTrades,
        winningTrades: performance.winningTrades,
        losingTrades: performance.losingTrades,
        totalProfitLoss: performance.totalProfitLoss,
        winRate: performance.winRate,
        averageProfit: performance.averageProfit,
        averageLoss: performance.averageLoss,
        profitFactor: performance.profitFactor,
        sharpeRatio: performance.sharpeRatio,
        maxDrawdown: performance.maxDrawdown,
        roi: performance.roi,
        volume24h: performance.volume24h,
        volume7d: performance.volume7d,
        volume30d: performance.volume30d,
        volumeAllTime: performance.volumeAllTime,
        rank: performance.rank,
        rankChange: performance.rankChange,
        lastUpdated: performance.updatedAt,
      },
    });

    logger.info('PERFORMANCE', 'Performance fetched successfully', {
      agentId,
      totalTrades: performance.totalTrades,
      roi: performance.roi,
    });
  } catch (error: any) {
    logger.error('PERFORMANCE', 'Error fetching agent performance', error, {
      agentId: req.params.agentId,
    });

    res.status(500).json({
      error: 'Failed to fetch agent performance',
      details: error.message,
    });
  }
}

/**
 * GET /api/performance/:agentId/history
 * Get performance history for an agent
 */
export async function getAgentPerformanceHistory(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { days = 30 } = req.query;

    logger.info('PERFORMANCE', `Fetching performance history for agent ${agentId}`, {
      days,
    });

    const history = await getPerformanceHistory(agentId, parseInt(days as string));

    res.json({
      success: true,
      agentId,
      days: parseInt(days as string),
      history: history.map((p) => ({
        timestamp: p.timestamp,
        totalTrades: p.totalTrades,
        winRate: p.winRate,
        roi: p.roi,
        totalProfitLoss: p.totalProfitLoss,
        rank: p.rank,
        volume24h: p.volume24h,
      })),
    });

    logger.info('PERFORMANCE', 'Performance history fetched successfully', {
      agentId,
      records: history.length,
    });
  } catch (error: any) {
    logger.error('PERFORMANCE', 'Error fetching performance history', error, {
      agentId: req.params.agentId,
    });

    res.status(500).json({
      error: 'Failed to fetch performance history',
      details: error.message,
    });
  }
}

/**
 * GET /api/performance/leaderboard
 * Get global performance leaderboard
 */
export async function getPerformanceLeaderboard(req: Request, res: Response) {
  try {
    const { limit = 100, sortBy = 'roi' } = req.query;

    logger.info('PERFORMANCE', 'Fetching leaderboard', { limit, sortBy });

    const leaderboard = await getLeaderboard(parseInt(limit as string));

    res.json({
      success: true,
      limit: parseInt(limit as string),
      sortBy,
      leaderboard: leaderboard.map((p) => ({
        agentId: p.agentId,
        rank: p.rank,
        rankChange: p.rankChange,
        totalTrades: p.totalTrades,
        winRate: p.winRate,
        roi: p.roi,
        totalProfitLoss: p.totalProfitLoss,
        profitFactor: p.profitFactor,
        sharpeRatio: p.sharpeRatio,
        volume24h: p.volume24h,
        volume7d: p.volume7d,
        volume30d: p.volume30d,
        volumeAllTime: p.volumeAllTime,
      })),
    });

    logger.info('PERFORMANCE', 'Leaderboard fetched successfully', {
      entries: leaderboard.length,
    });
  } catch (error: any) {
    logger.error('PERFORMANCE', 'Error fetching leaderboard', error);

    res.status(500).json({
      error: 'Failed to fetch leaderboard',
      details: error.message,
    });
  }
}

/**
 * POST /api/performance/:agentId/update
 * Force update performance metrics for an agent
 */
export async function forceUpdatePerformance(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    logger.info('PERFORMANCE', `Force updating performance for agent ${agentId}`);

    const performance = await updateAgentPerformance(agentId);

    res.json({
      success: true,
      message: 'Performance updated successfully',
      performance: {
        agentId: performance.agentId,
        totalTrades: performance.totalTrades,
        winRate: performance.winRate,
        roi: performance.roi,
        rank: performance.rank,
        lastUpdated: performance.updatedAt,
      },
    });

    logger.info('PERFORMANCE', 'Performance force updated successfully', {
      agentId,
      totalTrades: performance.totalTrades,
    });
  } catch (error: any) {
    logger.error('PERFORMANCE', 'Error force updating performance', error, {
      agentId: req.params.agentId,
    });

    res.status(500).json({
      error: 'Failed to update performance',
      details: error.message,
    });
  }
}

/**
 * GET /api/performance/stats
 * Get global performance statistics
 */
export async function getGlobalStats(req: Request, res: Response) {
  try {
    logger.info('PERFORMANCE', 'Fetching global performance stats');

    const allPerformances = await Performance.findAll();

    if (allPerformances.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalAgents: 0,
          totalTrades: 0,
          totalVolume: '0',
          averageWinRate: 0,
          averageROI: 0,
          topPerformers: [],
        },
      });
    }

    const totalAgents = allPerformances.length;
    const totalTrades = allPerformances.reduce((sum, p) => sum + p.totalTrades, 0);
    const totalVolume = allPerformances
      .reduce((sum, p) => sum + parseFloat(p.volumeAllTime), 0)
      .toString();
    const averageWinRate =
      allPerformances.reduce((sum, p) => sum + p.winRate, 0) / totalAgents;
    const averageROI = allPerformances.reduce((sum, p) => sum + p.roi, 0) / totalAgents;

    const topPerformers = await getLeaderboard(10);

    res.json({
      success: true,
      stats: {
        totalAgents,
        totalTrades,
        totalVolume,
        averageWinRate,
        averageROI,
        topPerformers: topPerformers.map((p) => ({
          agentId: p.agentId,
          rank: p.rank,
          roi: p.roi,
          winRate: p.winRate,
          totalTrades: p.totalTrades,
        })),
      },
    });

    logger.info('PERFORMANCE', 'Global stats fetched successfully', {
      totalAgents,
      totalTrades,
    });
  } catch (error: any) {
    logger.error('PERFORMANCE', 'Error fetching global stats', error);

    res.status(500).json({
      error: 'Failed to fetch global stats',
      details: error.message,
    });
  }
}
