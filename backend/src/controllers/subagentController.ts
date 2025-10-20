import { Request, Response } from 'express';
import { getAgentPerformanceStats } from '../services/subagents';
import Agent from '../models/Agent';

/**
 * Get subagent performance statistics for an agent
 */
export async function getSubagentStats(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    // Verify agent exists
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({
        error: 'Agent not found'
      });
    }

    // Get performance stats
    const stats = getAgentPerformanceStats(agentId);

    res.json({
      success: true,
      agentId,
      agentName: agent.name,
      subagentStats: stats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting subagent stats:', error);
    res.status(500).json({
      error: 'Failed to get subagent statistics',
      details: error.message
    });
  }
}

/**
 * Get all agents' subagent performance stats
 */
export async function getAllSubagentStats(req: Request, res: Response) {
  try {
    const agents = await Agent.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name']
    });

    const allStats = agents.map(agent => {
      const stats = getAgentPerformanceStats(agent.id);
      return {
        agentId: agent.id,
        agentName: agent.name,
        ...stats
      };
    });

    // Sort by success rate
    allStats.sort((a, b) => parseFloat(b.successRate) - parseFloat(a.successRate));

    res.json({
      success: true,
      totalAgents: allStats.length,
      stats: allStats,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting all subagent stats:', error);
    res.status(500).json({
      error: 'Failed to get subagent statistics',
      details: error.message
    });
  }
}

/**
 * Get leaderboard of best performing subagent systems
 */
export async function getSubagentLeaderboard(req: Request, res: Response) {
  try {
    const agents = await Agent.findAll({
      where: { status: 'active' },
      attributes: ['id', 'name', 'purpose', 'riskTolerance']
    });

    const leaderboard = agents
      .map(agent => {
        const stats = getAgentPerformanceStats(agent.id);
        return {
          rank: 0, // Will be assigned after sorting
          agentId: agent.id,
          agentName: agent.name,
          purpose: agent.purpose,
          riskLevel: agent.riskTolerance,
          ...stats
        };
      })
      .filter(entry => entry.completedDecisions > 0) // Only include agents with decisions
      .sort((a, b) => {
        // Primary sort: success rate
        const successDiff = parseFloat(b.successRate) - parseFloat(a.successRate);
        if (Math.abs(successDiff) > 0.1) return successDiff;

        // Secondary sort: total profit
        return parseFloat(b.totalProfit) - parseFloat(a.totalProfit);
      });

    // Assign ranks
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({
      success: true,
      totalAgents: leaderboard.length,
      leaderboard: leaderboard.slice(0, 10), // Top 10
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error getting subagent leaderboard:', error);
    res.status(500).json({
      error: 'Failed to get subagent leaderboard',
      details: error.message
    });
  }
}
