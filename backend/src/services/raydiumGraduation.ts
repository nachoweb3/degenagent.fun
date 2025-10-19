import { PublicKey } from '@solana/web3.js';
import { connection } from '../index';
import BondingCurve from '../models/BondingCurve';
import Agent from '../models/Agent';
import { BONDING_CURVE_CONFIG } from './bondingCurve';

// For MVP: Simplified graduation that marks the token as graduated
// In production, this would integrate with Raydium SDK to create actual pools
// The Raydium SDK V2 requires complex setup with Serum markets which is beyond MVP scope

/**
 * Create a mock Raydium pool for demonstration
 * In production, this would use actual Raydium SDK to create pools
 */
async function createMockRaydiumPool(
  tokenMint: PublicKey,
  initialTokenAmount: number,
  initialSOLAmount: number
) {
  try {
    console.log('Creating mock Raydium pool for MVP...');
    console.log('Token Mint:', tokenMint.toString());
    console.log('Initial Tokens:', initialTokenAmount);
    console.log('Initial SOL:', initialSOLAmount);

    // Generate a mock pool ID (in production, this comes from Raydium)
    const mockPoolId = PublicKey.unique();

    console.log('✅ Mock pool created:', mockPoolId.toString());
    console.log('⚠️ NOTE: This is a simulation. Production will use real Raydium SDK.');

    return {
      poolId: mockPoolId,
      marketId: PublicKey.unique(),
      txId: 'mock_' + Date.now(),
    };
  } catch (error) {
    console.error('Error creating mock pool:', error);
    throw error;
  }
}

/**
 * Graduate a bonding curve to Raydium
 * This is called when the bonding curve reaches 100% of tokens sold
 */
export async function graduateBondingCurve(agentId: string) {
  try {
    console.log(`🎓 Starting graduation for agent: ${agentId}`);

    // Get bonding curve data
    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      throw new Error('Bonding curve not found');
    }

    if (bondingCurve.graduated) {
      console.log('⚠️ Agent already graduated');
      return {
        success: false,
        message: 'Already graduated',
      };
    }

    // Check if graduation requirements are met
    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const graduationThreshold = BONDING_CURVE_CONFIG.CURVE_SUPPLY * 0.99; // 99% filled

    if (tokensSold < graduationThreshold) {
      console.log(`⚠️ Not enough tokens sold: ${tokensSold} / ${graduationThreshold}`);
      return {
        success: false,
        message: 'Graduation threshold not reached',
        progress: (tokensSold / graduationThreshold) * 100,
      };
    }

    // Get agent info
    const agent = await Agent.findOne({ where: { id: agentId } });
    if (!agent) {
      throw new Error('Agent not found');
    }

    const tokenMint = new PublicKey(bondingCurve.tokenMint);

    // Create pool (mock for MVP)
    console.log('Creating Raydium pool...');
    const totalValueLocked = parseFloat(bondingCurve.totalValueLocked);
    const remainingTokens = BONDING_CURVE_CONFIG.CURVE_SUPPLY - tokensSold;

    const poolResult = await createMockRaydiumPool(
      tokenMint,
      remainingTokens, // Add remaining tokens to pool
      totalValueLocked // Add all collected SOL to pool
    );

    // Update bonding curve status
    await bondingCurve.update({
      graduated: true,
      graduatedAt: new Date(),
      raydiumPoolAddress: poolResult.poolId.toString(),
    });

    console.log('🎉 Graduation complete!');
    console.log('Market ID:', poolResult.marketId.toString());
    console.log('Pool ID:', poolResult.poolId.toString());

    return {
      success: true,
      message: 'Successfully graduated to Raydium (Mock for MVP)',
      data: {
        marketId: poolResult.marketId.toString(),
        poolId: poolResult.poolId.toString(),
        txId: poolResult.txId,
        tokensSold,
        liquidityAdded: {
          tokens: remainingTokens,
          sol: totalValueLocked,
        },
      },
    };
  } catch (error: any) {
    console.error('❌ Graduation failed:', error);
    return {
      success: false,
      message: error.message || 'Graduation failed',
      error: error.toString(),
    };
  }
}

/**
 * Check if a bonding curve is ready to graduate
 */
export async function checkGraduationEligibility(agentId: string) {
  try {
    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return { eligible: false, reason: 'Bonding curve not found' };
    }

    if (bondingCurve.graduated) {
      return { eligible: false, reason: 'Already graduated' };
    }

    const tokensSold = parseFloat(bondingCurve.tokensSold);
    const graduationThreshold = BONDING_CURVE_CONFIG.CURVE_SUPPLY;
    const progress = (tokensSold / graduationThreshold) * 100;

    return {
      eligible: progress >= 99,
      progress,
      tokensSold,
      tokensRemaining: graduationThreshold - tokensSold,
      marketCapReached: parseFloat(bondingCurve.totalValueLocked),
    };
  } catch (error: any) {
    return {
      eligible: false,
      reason: error.message,
    };
  }
}

/**
 * Auto-graduate bonding curves that reach the threshold
 * This should be called after each trade
 */
export async function autoGraduateIfEligible(agentId: string) {
  try {
    const eligibility = await checkGraduationEligibility(agentId);

    if (eligibility.eligible) {
      console.log(`🎓 Auto-graduating agent ${agentId}...`);
      const result = await graduateBondingCurve(agentId);
      return result;
    }

    return {
      success: false,
      message: 'Not eligible for graduation yet',
      eligibility,
    };
  } catch (error: any) {
    console.error('Error in auto-graduation:', error);
    return {
      success: false,
      message: error.message,
    };
  }
}
