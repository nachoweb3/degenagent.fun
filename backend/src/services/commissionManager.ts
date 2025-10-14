import { Commission } from '../models/Commission';
import { Referral } from '../models/Referral';

// Commission configuration
export const COMMISSION_CONFIG = {
  PLATFORM_RATE: 0.5, // 0.5% platform commission
  REFERRAL_RATE: 10, // 10% of commission goes to referrer
  MIN_TRADE_FOR_COMMISSION: 10, // Minimum $10 trade to generate commission
};

interface CommissionResult {
  success: boolean;
  commissionId?: string;
  platformCommission: number;
  referralCommission?: number;
  error?: string;
}

/**
 * Calculate and record commission for a trade
 */
export async function recordTradeCommission(
  agentPubkey: string,
  ownerAddress: string,
  tradeAmount: number,
  tokenMint: string,
  transactionSignature: string
): Promise<CommissionResult> {
  try {
    // Check if trade meets minimum
    if (tradeAmount < COMMISSION_CONFIG.MIN_TRADE_FOR_COMMISSION) {
      return {
        success: true,
        platformCommission: 0,
        error: 'Trade below minimum commission threshold',
      };
    }

    // Calculate platform commission
    const platformCommissionAmount = tradeAmount * (COMMISSION_CONFIG.PLATFORM_RATE / 100);

    // Create commission record
    const commission = await Commission.create({
      agentPubkey,
      ownerAddress,
      tradeAmount,
      commissionRate: COMMISSION_CONFIG.PLATFORM_RATE,
      commissionAmount: platformCommissionAmount,
      tokenMint,
      transactionSignature,
      claimed: false,
    });

    // Check if user was referred and reward referrer
    let referralCommission = 0;
    const referral = await Referral.findOne({
      where: { referredAddress: ownerAddress },
    });

    if (referral) {
      // Referrer gets 10% of the platform commission
      referralCommission = platformCommissionAmount * (COMMISSION_CONFIG.REFERRAL_RATE / 100);

      // Update referrer's rewards
      await referral.update({
        rewardsClaimed: referral.rewardsClaimed + referralCommission,
        totalVolume: referral.totalVolume + tradeAmount,
      });
    }

    return {
      success: true,
      commissionId: commission.id,
      platformCommission: platformCommissionAmount,
      referralCommission: referralCommission || undefined,
    };
  } catch (error) {
    console.error('Error recording commission:', error);
    return {
      success: false,
      platformCommission: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get total unclaimed commissions for platform
 */
export async function getTotalUnclaimedCommissions(): Promise<number> {
  try {
    const commissions = await Commission.findAll({
      where: { claimed: false },
    });

    return commissions.reduce((total, c) => total + c.commissionAmount, 0);
  } catch (error) {
    console.error('Error getting unclaimed commissions:', error);
    return 0;
  }
}

/**
 * Get commission statistics
 */
export async function getCommissionStats() {
  try {
    const allCommissions = await Commission.findAll();

    const totalCommissions = allCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
    const unclaimedCommissions = allCommissions
      .filter(c => !c.claimed)
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    const claimedCommissions = allCommissions
      .filter(c => c.claimed)
      .reduce((sum, c) => sum + c.commissionAmount, 0);
    const totalVolume = allCommissions.reduce((sum, c) => sum + c.tradeAmount, 0);

    return {
      totalCommissions,
      unclaimedCommissions,
      claimedCommissions,
      totalVolume,
      commissionCount: allCommissions.length,
      averageCommission: allCommissions.length > 0 ? totalCommissions / allCommissions.length : 0,
    };
  } catch (error) {
    console.error('Error getting commission stats:', error);
    return null;
  }
}

/**
 * Get commissions by owner
 */
export async function getCommissionsByOwner(ownerAddress: string) {
  try {
    return await Commission.findAll({
      where: { ownerAddress },
      order: [['createdAt', 'DESC']],
    });
  } catch (error) {
    console.error('Error getting commissions by owner:', error);
    return [];
  }
}

/**
 * Mark commission as claimed (for admin)
 */
export async function claimCommission(commissionId: string): Promise<boolean> {
  try {
    const commission = await Commission.findByPk(commissionId);
    if (!commission) {
      return false;
    }

    await commission.update({ claimed: true });
    return true;
  } catch (error) {
    console.error('Error claiming commission:', error);
    return false;
  }
}
