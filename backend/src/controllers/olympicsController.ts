import { Request, Response } from 'express';
import olympicsService from '../services/olympicsService';

export async function getCurrentOlympics(req: Request, res: Response) {
  try {
    const olympics = await olympicsService.getCurrentOlympics();

    if (!olympics) {
      return res.json({
        success: false,
        message: 'No active Olympics at the moment'
      });
    }

    res.json({
      success: true,
      olympics: {
        id: olympics.id,
        name: olympics.name,
        description: olympics.description,
        status: olympics.status,
        startDate: olympics.startDate,
        endDate: olympics.endDate,
        entryFee: olympics.entryFee,
        prizePool: olympics.prizePool,
        platformCut: olympics.platformCut,
        maxParticipants: olympics.maxParticipants,
      }
    });
  } catch (error: any) {
    console.error('Error getting current Olympics:', error);
    res.status(500).json({
      error: 'Failed to get Olympics',
      details: error.message
    });
  }
}

export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { olympicsId } = req.params;
    const { category = 'roi' } = req.query;

    const leaderboard = await olympicsService.getLeaderboard(
      olympicsId,
      category as any
    );

    res.json({
      success: true,
      ...leaderboard
    });
  } catch (error: any) {
    console.error('Error getting leaderboard:', error);
    res.status(500).json({
      error: 'Failed to get leaderboard',
      details: error.message
    });
  }
}

export async function enterOlympics(req: Request, res: Response) {
  try {
    const { olympicsId } = req.params;
    const {
      agentId,
      agentPubkey,
      ownerWallet,
      entryTxSignature,
      startingBalance
    } = req.body;

    if (!agentId || !agentPubkey || !ownerWallet || !entryTxSignature || !startingBalance) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const entry = await olympicsService.enterAgent(olympicsId, {
      agentId,
      agentPubkey,
      ownerWallet,
      entryTxSignature,
      startingBalance
    });

    res.json({
      success: true,
      message: 'Agent successfully entered Olympics!',
      entry: {
        id: entry.id,
        olympicsId: entry.olympicsId,
        agentId: entry.agentId,
      }
    });
  } catch (error: any) {
    console.error('Error entering Olympics:', error);
    res.status(500).json({
      error: 'Failed to enter Olympics',
      details: error.message
    });
  }
}

export async function createOlympics(req: Request, res: Response) {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      entryFee,
      maxParticipants
    } = req.body;

    if (!name || !description || !startDate || !endDate || !entryFee) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const olympics = await olympicsService.createOlympics({
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      entryFee,
      maxParticipants: maxParticipants || undefined
    });

    res.json({
      success: true,
      message: 'Olympics created successfully!',
      olympics: {
        id: olympics.id,
        name: olympics.name,
        startDate: olympics.startDate,
        endDate: olympics.endDate,
      }
    });
  } catch (error: any) {
    console.error('Error creating Olympics:', error);
    res.status(500).json({
      error: 'Failed to create Olympics',
      details: error.message
    });
  }
}
