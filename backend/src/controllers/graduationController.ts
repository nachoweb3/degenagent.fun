import { Request, Response } from 'express';
import {
  graduateBondingCurve,
  checkGraduationEligibility,
} from '../services/raydiumGraduation';
import BondingCurve from '../models/BondingCurve';

/**
 * POST /api/graduation/graduate/:agentId
 * Manually trigger graduation for an agent
 */
export async function manualGraduation(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }

    // Check eligibility first
    const eligibility = await checkGraduationEligibility(agentId);
    if (!eligibility.eligible) {
      return res.status(400).json({
        error: 'Agent not eligible for graduation',
        eligibility,
      });
    }

    // Perform graduation
    const result = await graduateBondingCurve(agentId);

    if (result.success) {
      return res.json({
        success: true,
        message: 'Agent successfully graduated to Raydium!',
        data: result.data,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.message,
        details: result.error,
      });
    }
  } catch (error: any) {
    console.error('Error in manual graduation:', error);
    res.status(500).json({
      error: 'Failed to graduate agent',
      details: error.message,
    });
  }
}

/**
 * GET /api/graduation/status/:agentId
 * Check graduation status and eligibility
 */
export async function getGraduationStatus(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Bonding curve not found' });
    }

    // Check eligibility
    const eligibility = await checkGraduationEligibility(agentId);

    // Return status
    res.json({
      success: true,
      graduated: bondingCurve.graduated,
      graduatedAt: bondingCurve.graduatedAt,
      raydiumPoolAddress: bondingCurve.raydiumPoolAddress,
      eligibility,
    });
  } catch (error: any) {
    console.error('Error checking graduation status:', error);
    res.status(500).json({
      error: 'Failed to check graduation status',
      details: error.message,
    });
  }
}

/**
 * GET /api/graduation/graduated
 * Get list of all graduated agents
 */
export async function getGraduatedAgents(req: Request, res: Response) {
  try {
    const graduated = await BondingCurve.findAll({
      where: { graduated: true },
      order: [['graduatedAt', 'DESC']],
      limit: 50,
    });

    res.json({
      success: true,
      count: graduated.length,
      agents: graduated.map((bc) => ({
        agentId: bc.agentId,
        tokenMint: bc.tokenMint,
        graduatedAt: bc.graduatedAt,
        raydiumPoolAddress: bc.raydiumPoolAddress,
        tokensSold: bc.tokensSold,
        totalValueLocked: bc.totalValueLocked,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching graduated agents:', error);
    res.status(500).json({
      error: 'Failed to fetch graduated agents',
      details: error.message,
    });
  }
}
