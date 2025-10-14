import { Request, Response } from 'express';
import {
  getCommissionStats,
  getCommissionsByOwner,
  getTotalUnclaimedCommissions,
  claimCommission,
  COMMISSION_CONFIG
} from '../services/commissionManager';
import { Commission } from '../models/Commission';

/**
 * GET /api/commission/stats
 * Get platform commission statistics
 */
export async function getStats(req: Request, res: Response) {
  try {
    const stats = await getCommissionStats();

    if (!stats) {
      return res.status(500).json({ error: 'Failed to get commission stats' });
    }

    res.json({
      success: true,
      stats: {
        ...stats,
        config: COMMISSION_CONFIG
      }
    });
  } catch (error) {
    console.error('Error getting commission stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/commission/owner/:address
 * Get commissions for a specific owner
 */
export async function getOwnerCommissions(req: Request, res: Response) {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: 'Owner address is required' });
    }

    const commissions = await getCommissionsByOwner(address);

    const totalEarned = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const unclaimed = commissions
      .filter(c => !c.claimed)
      .reduce((sum, c) => sum + c.commissionAmount, 0);

    res.json({
      success: true,
      commissions,
      summary: {
        totalCommissions: commissions.length,
        totalEarned,
        unclaimed,
        claimed: totalEarned - unclaimed
      }
    });
  } catch (error) {
    console.error('Error getting owner commissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/commission/unclaimed
 * Get total unclaimed commissions (admin)
 */
export async function getUnclaimed(req: Request, res: Response) {
  try {
    const total = await getTotalUnclaimedCommissions();

    res.json({
      success: true,
      unclaimedTotal: total
    });
  } catch (error) {
    console.error('Error getting unclaimed commissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * POST /api/commission/claim/:id
 * Mark a commission as claimed (admin only)
 */
export async function claim(req: Request, res: Response) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: 'Commission ID is required' });
    }

    const success = await claimCommission(id);

    if (!success) {
      return res.status(404).json({ error: 'Commission not found' });
    }

    res.json({
      success: true,
      message: 'Commission marked as claimed'
    });
  } catch (error) {
    console.error('Error claiming commission:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/commission/config
 * Get commission configuration
 */
export async function getConfig(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      config: COMMISSION_CONFIG
    });
  } catch (error) {
    console.error('Error getting commission config:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/commission/recent
 * Get recent commissions
 */
export async function getRecent(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 50;

    const commissions = await Commission.findAll({
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      commissions
    });
  } catch (error) {
    console.error('Error getting recent commissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default {
  getStats,
  getOwnerCommissions,
  getUnclaimed,
  claim,
  getConfig,
  getRecent
};
