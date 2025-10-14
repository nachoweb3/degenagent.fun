import { Request, Response } from 'express';
import { Referral } from '../models/Referral';
import crypto from 'crypto';

/**
 * Generate unique referral code for user
 */
export async function generateReferralCode(req: Request, res: Response) {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Check if user already has a code
    const existing = await Referral.findOne({
      where: { referrerAddress: walletAddress }
    });

    if (existing) {
      return res.json({
        referralCode: existing.referralCode,
        referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${existing.referralCode}`,
        stats: {
          totalReferrals: await Referral.count({ where: { referralCode: existing.referralCode } }),
          rewardsClaimed: existing.rewardsClaimed,
          agentsCreated: existing.agentsCreated,
          totalVolume: existing.totalVolume,
        }
      });
    }

    // Generate unique 8-char code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create referral record
    const referral = await Referral.create({
      referrerAddress: walletAddress,
      referredAddress: walletAddress, // Self reference for code holder
      referralCode: code,
    });

    res.json({
      referralCode: code,
      referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${code}`,
      stats: {
        totalReferrals: 0,
        rewardsClaimed: 0,
        agentsCreated: 0,
        totalVolume: 0,
      }
    });

  } catch (error: any) {
    console.error('Error generating referral code:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Register a referral
 */
export async function registerReferral(req: Request, res: Response) {
  try {
    const { referralCode, newUserAddress } = req.body;

    if (!referralCode || !newUserAddress) {
      return res.status(400).json({ error: 'Referral code and user address required' });
    }

    // Check if user already referred
    const existingReferral = await Referral.findOne({
      where: { referredAddress: newUserAddress }
    });

    if (existingReferral) {
      return res.status(400).json({ error: 'User already referred' });
    }

    // Find referrer
    const referrer = await Referral.findOne({
      where: { referralCode }
    });

    if (!referrer) {
      return res.status(404).json({ error: 'Invalid referral code' });
    }

    // Create referral record
    await Referral.create({
      referrerAddress: referrer.referrerAddress,
      referredAddress: newUserAddress,
      referralCode,
    });

    res.json({
      success: true,
      message: 'Referral registered successfully',
      bonus: '10% fee discount on first agent creation!'
    });

  } catch (error: any) {
    console.error('Error registering referral:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get referral stats for user
 */
export async function getReferralStats(req: Request, res: Response) {
  try {
    const { walletAddress } = req.params;

    // Get user's referral code
    const userRef = await Referral.findOne({
      where: {
        referrerAddress: walletAddress,
        referredAddress: walletAddress // Code holder record
      }
    });

    if (!userRef) {
      return res.json({
        hasCode: false,
        stats: {
          totalReferrals: 0,
          activeReferrals: 0,
          rewardsClaimed: 0,
          pendingRewards: 0,
          agentsCreated: 0,
          totalVolume: 0,
        },
        referrals: []
      });
    }

    // Get all referrals
    const referrals = await Referral.findAll({
      where: {
        referralCode: userRef.referralCode,
        referredAddress: { [require('sequelize').Op.ne]: walletAddress } // Exclude self
      }
    });

    // Calculate stats
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(r => r.agentsCreated > 0).length;
    const rewardsClaimed = referrals.reduce((sum, r) => sum + r.rewardsClaimed, 0);
    const agentsCreated = referrals.reduce((sum, r) => sum + r.agentsCreated, 0);
    const totalVolume = referrals.reduce((sum, r) => sum + r.totalVolume, 0);

    // Calculate pending rewards (10% of creation fees)
    // Assuming 0.5 SOL per agent creation
    const pendingRewards = agentsCreated * 0.5 * 0.1 - rewardsClaimed;

    res.json({
      hasCode: true,
      referralCode: userRef.referralCode,
      referralUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?ref=${userRef.referralCode}`,
      stats: {
        totalReferrals,
        activeReferrals,
        rewardsClaimed: parseFloat(rewardsClaimed.toFixed(4)),
        pendingRewards: parseFloat(Math.max(0, pendingRewards).toFixed(4)),
        agentsCreated,
        totalVolume: parseFloat(totalVolume.toFixed(2)),
      },
      referrals: referrals.map(r => ({
        address: r.referredAddress.slice(0, 8) + '...',
        agentsCreated: r.agentsCreated,
        volume: r.totalVolume,
        createdAt: r.createdAt,
      }))
    });

  } catch (error: any) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Claim referral rewards
 */
export async function claimRewards(req: Request, res: Response) {
  try {
    const { walletAddress } = req.body;

    // Get user's referrals
    const userRef = await Referral.findOne({
      where: {
        referrerAddress: walletAddress,
        referredAddress: walletAddress
      }
    });

    if (!userRef) {
      return res.status(404).json({ error: 'No referral code found' });
    }

    const referrals = await Referral.findAll({
      where: {
        referralCode: userRef.referralCode,
        referredAddress: { [require('sequelize').Op.ne]: walletAddress }
      }
    });

    const agentsCreated = referrals.reduce((sum, r) => sum + r.agentsCreated, 0);
    const alreadyClaimed = referrals.reduce((sum, r) => sum + r.rewardsClaimed, 0);

    // 10% of 0.5 SOL per agent
    const totalRewards = agentsCreated * 0.5 * 0.1;
    const pendingRewards = totalRewards - alreadyClaimed;

    if (pendingRewards <= 0) {
      return res.status(400).json({ error: 'No rewards to claim' });
    }

    // In production: Send SOL to wallet here
    // For now, just update the claimed amount
    await Promise.all(referrals.map(r =>
      r.update({
        rewardsClaimed: r.rewardsClaimed + (r.agentsCreated * 0.5 * 0.1 / referrals.length),
        claimedAt: new Date()
      })
    ));

    res.json({
      success: true,
      amountClaimed: parseFloat(pendingRewards.toFixed(4)),
      message: `Successfully claimed ${pendingRewards.toFixed(4)} SOL!`,
      // In production: include transaction signature
    });

  } catch (error: any) {
    console.error('Error claiming rewards:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get top referrers leaderboard
 */
export async function getTopReferrers(req: Request, res: Response) {
  try {
    const { limit = 10 } = req.query;

    // Get all unique referral codes with stats
    const referralCodes = await Referral.findAll({
      attributes: ['referralCode', 'referrerAddress'],
      where: {
        referrerAddress: { [require('sequelize').Op.eq]: require('sequelize').col('referred_address') }
      }
    });

    const leaderboard = await Promise.all(
      referralCodes.map(async (ref) => {
        const referrals = await Referral.findAll({
          where: {
            referralCode: ref.referralCode,
            referredAddress: { [require('sequelize').Op.ne]: ref.referrerAddress }
          }
        });

        const totalReferrals = referrals.length;
        const agentsCreated = referrals.reduce((sum, r) => sum + r.agentsCreated, 0);
        const totalVolume = referrals.reduce((sum, r) => sum + r.totalVolume, 0);
        const rewards = agentsCreated * 0.5 * 0.1;

        return {
          address: ref.referrerAddress,
          code: ref.referralCode,
          totalReferrals,
          agentsCreated,
          totalVolume,
          rewards,
        };
      })
    );

    // Sort by total volume
    leaderboard.sort((a, b) => b.totalVolume - a.totalVolume);

    res.json({
      leaderboard: leaderboard.slice(0, Number(limit)).map((entry, index) => ({
        rank: index + 1,
        address: entry.address.slice(0, 8) + '...',
        totalReferrals: entry.totalReferrals,
        agentsCreated: entry.agentsCreated,
        totalVolume: parseFloat(entry.totalVolume.toFixed(2)),
        rewardsEarned: parseFloat(entry.rewards.toFixed(4)),
      }))
    });

  } catch (error: any) {
    console.error('Error fetching top referrers:', error);
    res.status(500).json({ error: error.message });
  }
}
