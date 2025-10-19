import { Request, Response } from 'express';
import Agent from '../models/Agent';

/**
 * Get social feed of agent activities
 */
export async function getFeed(req: Request, res: Response) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get recent agents with their stats
    const agents = await Agent.findAll({
      order: [['createdAt', 'DESC']],
      limit: Number(limit),
      offset,
    });

    // Transform to feed items
    const feedItems = agents.map(agent => ({
      id: agent.id,
      type: 'agent_created',
      timestamp: agent.createdAt,
      agent: {
        name: agent.name,
        walletAddress: agent.walletAddress,
        tokenMint: agent.tokenMint,
        purpose: agent.purpose,
      },
      creator: {
        address: agent.owner,
        displayName: `${agent.owner.slice(0, 4)}...${agent.owner.slice(-4)}`
      },
      stats: {
        totalTrades: agent.totalTrades,
        totalVolume: agent.totalVolume,
        totalProfit: agent.totalProfit,
      }
    }));

    // Get total count for pagination
    const total = await Agent.count();

    res.json({
      success: true,
      items: feedItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error: any) {
    console.error('Error fetching feed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feed',
      message: error.message
    });
  }
}

/**
 * Get trending agents
 */
export async function getTrendingAgents(req: Request, res: Response) {
  try {
    const { limit = 10 } = req.query;

    // Get agents sorted by performance
    const agents = await Agent.findAll({
      where: { status: 'active' },
      order: [
        ['totalVolume', 'DESC'],
        ['totalProfit', 'DESC']
      ],
      limit: Number(limit)
    });

    res.json({
      success: true,
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        walletAddress: agent.walletAddress,
        tokenMint: agent.tokenMint,
        totalVolume: agent.totalVolume,
        totalProfit: agent.totalProfit,
        totalTrades: agent.totalTrades,
        riskLevel: agent.riskLevel,
      }))
    });

  } catch (error: any) {
    console.error('Error fetching trending agents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending agents',
      message: error.message
    });
  }
}
