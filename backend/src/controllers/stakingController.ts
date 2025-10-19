import { Request, Response } from 'express';
import Stake from '../models/Stake';
import Agent from '../models/Agent';

/**
 * Create a new stake
 */
export async function createStake(req: Request, res: Response) {
  try {
    const { userWallet, agentId, amount, tokenType, lockPeriod, autoCompound } = req.body;

    if (!userWallet || !agentId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userWallet, agentId, amount'
      });
    }

    // Verify agent exists
    const agent = await Agent.findByPk(agentId);
    if (!agent) {
      return res.status(404).json({
        success: false,
        error: 'Agent not found'
      });
    }

    // Calculate APY based on lock period
    const apy = calculateAPY(lockPeriod, tokenType);

    const stake = await Stake.create({
      userWallet,
      agentId,
      amount,
      tokenType: tokenType || 'AGENT_TOKEN',
      lockPeriod: lockPeriod || 0,
      autoCompound: autoCompound || false,
      apy,
      status: 'active',
      startTime: new Date(),
      rewardsClaimed: '0',
    });

    res.json({
      success: true,
      stake: {
        id: stake.id,
        amount: stake.amount,
        tokenType: stake.tokenType,
        apy: stake.apy,
        lockPeriod: stake.lockPeriod,
        startTime: stake.startTime,
        autoCompound: stake.autoCompound,
      },
      message: `Successfully staked ${amount} ${tokenType} with ${apy}% APY`
    });

  } catch (error: any) {
    console.error('Error creating stake:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create stake',
      details: error.message
    });
  }
}

/**
 * Get user's stakes
 */
export async function getUserStakes(req: Request, res: Response) {
  try {
    const { walletAddress } = req.params;

    const stakes = await Stake.findAll({
      where: { userWallet: walletAddress },
      order: [['createdAt', 'DESC']],
    });

    // Calculate current rewards for each stake
    const stakesWithRewards = stakes.map(stake => {
      const rewards = calculateCurrentRewards(stake);
      return {
        id: stake.id,
        agentId: stake.agentId,
        amount: stake.amount,
        tokenType: stake.tokenType,
        apy: stake.apy,
        lockPeriod: stake.lockPeriod,
        status: stake.status,
        startTime: stake.startTime,
        endTime: stake.endTime,
        currentRewards: rewards,
        totalRewards: parseFloat(stake.rewardsClaimed) + rewards,
        autoCompound: stake.autoCompound,
        canUnstake: canUnstake(stake),
      };
    });

    // Calculate totals
    const totalStaked = stakes
      .filter(s => s.status === 'active')
      .reduce((sum, s) => sum + parseFloat(s.amount), 0);

    const totalRewards = stakesWithRewards
      .reduce((sum, s) => sum + s.totalRewards, 0);

    res.json({
      success: true,
      stakes: stakesWithRewards,
      summary: {
        totalStaked: totalStaked.toString(),
        totalRewards: totalRewards.toFixed(4),
        activeStakes: stakes.filter(s => s.status === 'active').length,
        totalStakes: stakes.length,
      }
    });

  } catch (error: any) {
    console.error('Error fetching stakes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stakes',
      details: error.message
    });
  }
}

/**
 * Claim staking rewards
 */
export async function claimRewards(req: Request, res: Response) {
  try {
    const { stakeId, walletAddress } = req.body;

    const stake = await Stake.findOne({
      where: { id: stakeId, userWallet: walletAddress }
    });

    if (!stake) {
      return res.status(404).json({
        success: false,
        error: 'Stake not found'
      });
    }

    if (stake.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Stake is not active'
      });
    }

    const rewards = calculateCurrentRewards(stake);

    if (rewards <= 0) {
      return res.status(400).json({
        success: false,
        error: 'No rewards to claim'
      });
    }

    // Update stake
    const totalClaimed = parseFloat(stake.rewardsClaimed) + rewards;
    await stake.update({
      rewardsClaimed: totalClaimed.toString(),
    });

    res.json({
      success: true,
      claimed: rewards.toFixed(4),
      totalClaimed: totalClaimed.toFixed(4),
      message: `Successfully claimed ${rewards.toFixed(4)} ${stake.tokenType} rewards`
    });

  } catch (error: any) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to claim rewards',
      details: error.message
    });
  }
}

/**
 * Unstake tokens
 */
export async function unstake(req: Request, res: Response) {
  try {
    const { stakeId, walletAddress } = req.body;

    const stake = await Stake.findOne({
      where: { id: stakeId, userWallet: walletAddress }
    });

    if (!stake) {
      return res.status(404).json({
        success: false,
        error: 'Stake not found'
      });
    }

    if (!canUnstake(stake)) {
      const lockEndDate = new Date(stake.startTime);
      lockEndDate.setDate(lockEndDate.getDate() + stake.lockPeriod);

      return res.status(400).json({
        success: false,
        error: 'Stake is still locked',
        unlockDate: lockEndDate.toISOString(),
      });
    }

    // Calculate final rewards
    const finalRewards = calculateCurrentRewards(stake);
    const totalAmount = parseFloat(stake.amount) + finalRewards;

    await stake.update({
      status: 'completed',
      endTime: new Date(),
      rewardsClaimed: (parseFloat(stake.rewardsClaimed) + finalRewards).toString(),
    });

    res.json({
      success: true,
      unstaked: stake.amount,
      rewards: finalRewards.toFixed(4),
      total: totalAmount.toFixed(4),
      message: `Successfully unstaked ${totalAmount.toFixed(4)} ${stake.tokenType}`
    });

  } catch (error: any) {
    console.error('Error unstaking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unstake',
      details: error.message
    });
  }
}

// Helper functions
function calculateAPY(lockPeriod: number, tokenType: string): number {
  // Base APY
  let baseAPY = tokenType === 'SOL' ? 5 : 10;

  // Bonus for lock period
  if (lockPeriod >= 365) baseAPY += 15; // +15% for 1 year
  else if (lockPeriod >= 180) baseAPY += 10; // +10% for 6 months
  else if (lockPeriod >= 90) baseAPY += 5;  // +5% for 3 months
  else if (lockPeriod >= 30) baseAPY += 2;  // +2% for 1 month

  return baseAPY;
}

function calculateCurrentRewards(stake: any): number {
  const now = new Date();
  const start = new Date(stake.startTime);
  const daysStaked = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  const principal = parseFloat(stake.amount);
  const apy = stake.apy / 100;

  // Simple interest calculation (daily compounding)
  const rewards = principal * (apy / 365) * daysStaked;

  return Math.max(0, rewards);
}

function canUnstake(stake: any): boolean {
  if (stake.lockPeriod === 0) return true;

  const now = new Date();
  const lockEnd = new Date(stake.startTime);
  lockEnd.setDate(lockEnd.getDate() + stake.lockPeriod);

  return now >= lockEnd;
}
