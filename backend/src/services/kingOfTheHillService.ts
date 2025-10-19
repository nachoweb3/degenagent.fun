import { Op } from 'sequelize';
import { KingOfTheHill, KingLeaderboard } from '../models/KingOfTheHill';
import Agent from '../models/Agent';
import BondingCurve, { setupBondingCurveAssociations } from '../models/BondingCurve';
import { logger } from '../utils/logger';

// Setup associations
setupBondingCurveAssociations();

interface KingStats {
  agentId: string;
  agentName: string;
  tokenMint: string;
  marketCap: string;
  timeAsKing: number;
  points: number;
  crownedAt: Date;
  isCurrentKing: boolean;
}

interface LeaderboardEntry {
  agentId: string;
  agentName: string;
  tokenMint: string;
  totalTimeAsKing: number;
  totalPoints: number;
  totalCrowns: number;
  longestReign: number;
  currentlyKing: boolean;
  lastCrownedAt?: Date;
}

/**
 * Calculate market cap for an agent token
 * Market cap = total tokens * current price (from bonding curve TVL)
 */
async function calculateMarketCap(agentId: string): Promise<string> {
  try {
    const bondingCurve = await BondingCurve.findOne({
      where: { agentId },
    });

    if (!bondingCurve) {
      return '0';
    }

    // Market cap is approximately the total value locked in the bonding curve
    // For graduated tokens, we'd need to check Raydium pool
    return bondingCurve.totalValueLocked;
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error calculating market cap', { agentId, error });
    return '0';
  }
}

/**
 * Get the current king (agent with highest market cap)
 */
export async function getCurrentKing(): Promise<KingStats | null> {
  try {
    // Find current king (rank = 1, dethronedAt is null)
    const currentKing = await KingOfTheHill.findOne({
      where: {
        rank: 1,
        dethronedAt: null as any,
      },
      order: [['crownedAt', 'DESC']],
    });

    if (!currentKing) {
      return null;
    }

    // Calculate time as king
    const now = new Date();
    const crownedAt = new Date(currentKing.crownedAt);
    const timeAsKing = Math.floor((now.getTime() - crownedAt.getTime()) / 1000);

    return {
      agentId: currentKing.agentId,
      agentName: currentKing.agentName,
      tokenMint: currentKing.tokenMint,
      marketCap: currentKing.marketCap,
      timeAsKing,
      points: currentKing.points,
      crownedAt: currentKing.crownedAt,
      isCurrentKing: true,
    };
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error getting current king', { error });
    return null;
  }
}

/**
 * Find the agent with the highest market cap
 */
async function findTopAgent(): Promise<{ agentId: string; agentName: string; tokenMint: string; marketCap: string } | null> {
  try {
    // Get all agents with bonding curves
    const bondingCurves = await BondingCurve.findAll({
      include: [
        {
          model: Agent,
          as: 'agent',
          required: true,
        },
      ],
      order: [['totalValueLocked', 'DESC']],
      limit: 1,
    });

    if (bondingCurves.length === 0) {
      return null;
    }

    const topCurve = bondingCurves[0];
    const agent = (topCurve as any).agent;

    return {
      agentId: agent.id,
      agentName: agent.name,
      tokenMint: topCurve.tokenMint,
      marketCap: topCurve.totalValueLocked,
    };
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error finding top agent', { error });
    return null;
  }
}

/**
 * Get competition round identifier
 */
function getCompetitionRound(type: 'daily' | 'weekly'): string {
  const now = new Date();

  if (type === 'daily') {
    // Format: YYYY-MM-DD
    return now.toISOString().split('T')[0];
  } else {
    // Format: YYYY-Www (ISO week number)
    const year = now.getFullYear();
    const firstDay = new Date(year, 0, 1);
    const days = Math.floor((now.getTime() - firstDay.getTime()) / (24 * 60 * 60 * 1000));
    const week = Math.ceil((days + firstDay.getDay() + 1) / 7);
    return `${year}-W${week.toString().padStart(2, '0')}`;
  }
}

/**
 * Update the king - check if there's a new champion
 */
export async function updateKing(): Promise<void> {
  try {
    logger.info('KOTH_SERVICE', 'Updating king of the hill');

    // Find the agent with highest market cap
    const topAgent = await findTopAgent();
    if (!topAgent) {
      logger.info('KOTH_SERVICE', 'No agents with bonding curves found');
      return;
    }

    // Get current king
    const currentKing = await KingOfTheHill.findOne({
      where: {
        rank: 1,
        dethronedAt: null as any,
      },
    });

    const currentRound = getCompetitionRound('daily');

    // If no current king, crown the top agent
    if (!currentKing) {
      await crownNewKing(topAgent, currentRound);
      return;
    }

    // If the top agent is different from current king, dethrone and crown new king
    if (currentKing.agentId !== topAgent.agentId) {
      await dethroneKing(currentKing);
      await crownNewKing(topAgent, currentRound);
      logger.info('KOTH_SERVICE', 'New king crowned!', {
        oldKing: currentKing.agentName,
        newKing: topAgent.agentName,
      });
    } else {
      // Same king, update their stats
      await updateCurrentKing(currentKing, topAgent.marketCap);
    }
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error updating king', { error });
  }
}

/**
 * Crown a new king
 */
async function crownNewKing(
  agent: { agentId: string; agentName: string; tokenMint: string; marketCap: string },
  competitionRound: string
): Promise<void> {
  try {
    // Create new king record
    await KingOfTheHill.create({
      agentId: agent.agentId,
      agentName: agent.agentName,
      tokenMint: agent.tokenMint,
      marketCap: agent.marketCap,
      crownedAt: new Date(),
      rank: 1,
      competitionRound,
      roundType: 'daily',
      timeAsKing: 0,
      points: 0,
    });

    // Update leaderboard
    const leaderboardEntry = await KingLeaderboard.findOne({
      where: { agentId: agent.agentId },
    });

    if (leaderboardEntry) {
      await leaderboardEntry.update({
        agentName: agent.agentName,
        tokenMint: agent.tokenMint,
        totalCrowns: leaderboardEntry.totalCrowns + 1,
        currentlyKing: true,
        lastCrownedAt: new Date(),
      });
    } else {
      await KingLeaderboard.create({
        agentId: agent.agentId,
        agentName: agent.agentName,
        tokenMint: agent.tokenMint,
        totalCrowns: 1,
        currentlyKing: true,
        lastCrownedAt: new Date(),
      });
    }

    logger.info('KOTH_SERVICE', 'New king crowned', {
      agentName: agent.agentName,
      marketCap: agent.marketCap,
    });
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error crowning new king', { error });
    throw error;
  }
}

/**
 * Dethrone the current king
 */
async function dethroneKing(king: KingOfTheHill): Promise<void> {
  try {
    const now = new Date();
    const crownedAt = new Date(king.crownedAt);
    const timeAsKing = Math.floor((now.getTime() - crownedAt.getTime()) / 1000);
    const points = Math.floor(timeAsKing / 3600); // 1 point per hour

    // Update king record
    await king.update({
      dethronedAt: now,
      timeAsKing,
      points,
      rank: 2, // Move to rank 2
    });

    // Update leaderboard
    const leaderboardEntry = await KingLeaderboard.findOne({
      where: { agentId: king.agentId },
    });

    if (leaderboardEntry) {
      await leaderboardEntry.update({
        totalTimeAsKing: leaderboardEntry.totalTimeAsKing + timeAsKing,
        totalPoints: leaderboardEntry.totalPoints + points,
        longestReign: Math.max(leaderboardEntry.longestReign, timeAsKing),
        currentlyKing: false,
      });
    }

    logger.info('KOTH_SERVICE', 'King dethroned', {
      agentName: king.agentName,
      timeAsKing,
      points,
    });
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error dethroning king', { error });
    throw error;
  }
}

/**
 * Update the current king's stats
 */
async function updateCurrentKing(king: KingOfTheHill, newMarketCap: string): Promise<void> {
  try {
    const now = new Date();
    const crownedAt = new Date(king.crownedAt);
    const timeAsKing = Math.floor((now.getTime() - crownedAt.getTime()) / 1000);
    const points = Math.floor(timeAsKing / 3600); // 1 point per hour

    // Update king record
    await king.update({
      marketCap: newMarketCap,
      timeAsKing,
      points,
    });

    logger.debug('KOTH_SERVICE', 'Current king updated', {
      agentName: king.agentName,
      timeAsKing,
      points,
      marketCap: newMarketCap,
    });
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error updating current king', { error });
    throw error;
  }
}

/**
 * Get historical kings (dethroned kings)
 */
export async function getHistoricalKings(limit: number = 10): Promise<KingStats[]> {
  try {
    const historicalKings = await KingOfTheHill.findAll({
      where: {
        dethronedAt: {
          [Op.ne]: null as any,
        },
      },
      order: [['dethronedAt', 'DESC']],
      limit,
    });

    return historicalKings.map((king) => ({
      agentId: king.agentId,
      agentName: king.agentName,
      tokenMint: king.tokenMint,
      marketCap: king.marketCap,
      timeAsKing: king.timeAsKing,
      points: king.points,
      crownedAt: king.crownedAt,
      isCurrentKing: false,
    }));
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error getting historical kings', { error });
    return [];
  }
}

/**
 * Get all-time leaderboard
 */
export async function getLeaderboard(limit: number = 20): Promise<LeaderboardEntry[]> {
  try {
    const leaderboard = await KingLeaderboard.findAll({
      order: [['totalPoints', 'DESC']],
      limit,
    });

    return leaderboard.map((entry) => ({
      agentId: entry.agentId,
      agentName: entry.agentName,
      tokenMint: entry.tokenMint,
      totalTimeAsKing: entry.totalTimeAsKing,
      totalPoints: entry.totalPoints,
      totalCrowns: entry.totalCrowns,
      longestReign: entry.longestReign,
      currentlyKing: entry.currentlyKing,
      lastCrownedAt: entry.lastCrownedAt,
    }));
  } catch (error) {
    logger.error('KOTH_SERVICE', 'Error getting leaderboard', { error });
    return [];
  }
}

/**
 * Get time until next competition round
 */
export function getTimeUntilNextRound(type: 'daily' | 'weekly' = 'daily'): number {
  const now = new Date();

  if (type === 'daily') {
    // Time until midnight
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return Math.floor((tomorrow.getTime() - now.getTime()) / 1000);
  } else {
    // Time until next Monday
    const nextMonday = new Date(now);
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    return Math.floor((nextMonday.getTime() - now.getTime()) / 1000);
  }
}

/**
 * Start automated king tracking
 */
export function startKingTracking(intervalMs: number = 60000): void {
  logger.info('KOTH_SERVICE', 'Starting King of the Hill tracking', { intervalMs });

  // Initial update after 10 seconds
  setTimeout(() => {
    updateKing();
  }, 10000);

  // Then update at regular intervals
  setInterval(() => {
    updateKing();
  }, intervalMs);
}
