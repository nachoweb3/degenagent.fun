import { Request, Response } from 'express';
import {
  getCurrentKing,
  getHistoricalKings,
  getLeaderboard,
  getTimeUntilNextRound,
} from '../services/kingOfTheHillService';
import { logger } from '../utils/logger';

/**
 * Get current king
 * GET /api/king-of-the-hill/current
 */
export const getCurrent = async (req: Request, res: Response) => {
  try {
    const currentKing = await getCurrentKing();

    if (!currentKing) {
      return res.json({
        king: null,
        message: 'No king has been crowned yet',
        timeUntilNextRound: getTimeUntilNextRound('daily'),
      });
    }

    res.json({
      king: currentKing,
      timeUntilNextRound: getTimeUntilNextRound('daily'),
    });
  } catch (error) {
    logger.error('KOTH_CONTROLLER', 'Error getting current king', { error });
    res.status(500).json({
      error: 'Failed to get current king',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get historical kings (recently dethroned)
 * GET /api/king-of-the-hill/history
 */
export const getHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const historicalKings = await getHistoricalKings(limit);

    res.json({
      history: historicalKings,
      total: historicalKings.length,
    });
  } catch (error) {
    logger.error('KOTH_CONTROLLER', 'Error getting historical kings', { error });
    res.status(500).json({
      error: 'Failed to get historical kings',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get all-time leaderboard
 * GET /api/king-of-the-hill/leaderboard
 */
export const getLeaderboardData = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const leaderboard = await getLeaderboard(limit);

    res.json({
      leaderboard,
      total: leaderboard.length,
    });
  } catch (error) {
    logger.error('KOTH_CONTROLLER', 'Error getting leaderboard', { error });
    res.status(500).json({
      error: 'Failed to get leaderboard',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

/**
 * Get competition stats and info
 * GET /api/king-of-the-hill/stats
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const currentKing = await getCurrentKing();
    const recentHistory = await getHistoricalKings(5);
    const topLeaderboard = await getLeaderboard(5);

    res.json({
      currentKing: currentKing || null,
      recentHistory,
      topLeaderboard,
      timeUntilNextRound: getTimeUntilNextRound('daily'),
      competitionInfo: {
        roundType: 'daily',
        pointsPerHour: 1,
        description: 'The agent with the highest market cap becomes King of the Hill. The longer you hold the crown, the more points you earn!',
        rules: [
          'Market cap is calculated from bonding curve TVL',
          'King is updated every minute',
          'Earn 1 point per hour as king',
          'Competition resets daily at midnight UTC',
        ],
        rewards: [
          'Glory and bragging rights',
          'Featured on the leaderboard',
          'Historical hall of fame entry',
        ],
      },
    });
  } catch (error) {
    logger.error('KOTH_CONTROLLER', 'Error getting stats', { error });
    res.status(500).json({
      error: 'Failed to get competition stats',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
