import { Request, Response } from 'express';
import Vault from '../models/Vault';
import Stake from '../models/Stake';

/**
 * Get all available vaults
 */
export async function getAllVaults(req: Request, res: Response) {
  try {
    const { strategy, status } = req.query;

    const where: any = {};
    if (strategy) where.strategy = strategy;
    if (status) where.status = status;
    else where.status = 'active'; // Default to active vaults

    const vaults = await Vault.findAll({
      where,
      order: [['currentAPY', 'DESC']],
    });

    // Calculate additional metrics for each vault
    const vaultsWithMetrics = vaults.map(vault => {
      const utilizationRate = (parseFloat(vault.totalValueLocked) / parseFloat(vault.maxCapacity)) * 100;
      const dailyReturn = vault.currentAPY / 365;

      return {
        id: vault.id,
        name: vault.name,
        description: vault.description,
        strategy: vault.strategy,
        currentAPY: vault.currentAPY,
        historicalAPY: vault.historicalAPY,
        totalValueLocked: vault.totalValueLocked,
        minDeposit: vault.minDeposit,
        maxCapacity: vault.maxCapacity,
        utilizationRate: utilizationRate.toFixed(2),
        depositFee: vault.depositFee,
        withdrawalFee: vault.withdrawalFee,
        performanceFee: vault.performanceFee,
        lockPeriod: vault.lockPeriod,
        autoCompound: vault.autoCompound,
        riskLevel: vault.riskLevel,
        totalDepositors: vault.totalDepositors,
        dailyReturn: dailyReturn.toFixed(4),
        available: (parseFloat(vault.maxCapacity) - parseFloat(vault.totalValueLocked)).toString(),
      };
    });

    res.json({
      success: true,
      vaults: vaultsWithMetrics,
      total: vaults.length,
    });

  } catch (error: any) {
    console.error('Error fetching vaults:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vaults',
      details: error.message
    });
  }
}

/**
 * Get vault by ID with full details
 */
export async function getVaultById(req: Request, res: Response) {
  try {
    const { vaultId } = req.params;

    const vault = await Vault.findByPk(vaultId);

    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    // Get vault statistics
    const stakes = await Stake.findAll({
      where: { agentId: vault.id, status: 'active' }
    });

    const totalStaked = stakes.reduce((sum, s) => sum + parseFloat(s.amount), 0);
    const avgLockPeriod = stakes.length > 0
      ? stakes.reduce((sum, s) => sum + s.lockPeriod, 0) / stakes.length
      : 0;

    res.json({
      success: true,
      vault: {
        ...vault.toJSON(),
        stats: {
          totalStaked: totalStaked.toString(),
          activeStakers: stakes.length,
          avgLockPeriod: Math.round(avgLockPeriod),
          utilizationRate: ((totalStaked / parseFloat(vault.maxCapacity)) * 100).toFixed(2),
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch vault',
      details: error.message
    });
  }
}

/**
 * Deposit to vault
 */
export async function depositToVault(req: Request, res: Response) {
  try {
    const { vaultId, userWallet, amount } = req.body;

    if (!vaultId || !userWallet || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: vaultId, userWallet, amount'
      });
    }

    const vault = await Vault.findByPk(vaultId);

    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    if (vault.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Vault is not active'
      });
    }

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (depositAmount < parseFloat(vault.minDeposit)) {
      return res.status(400).json({
        success: false,
        error: `Minimum deposit is ${vault.minDeposit} SOL`
      });
    }

    // Check capacity
    const currentTVL = parseFloat(vault.totalValueLocked);
    const maxCap = parseFloat(vault.maxCapacity);
    if (currentTVL + depositAmount > maxCap) {
      return res.status(400).json({
        success: false,
        error: 'Vault capacity exceeded',
        available: (maxCap - currentTVL).toFixed(4)
      });
    }

    // Apply deposit fee
    const feeAmount = depositAmount * (vault.depositFee / 100);
    const netDeposit = depositAmount - feeAmount;

    // Create stake
    const stake = await Stake.create({
      userWallet,
      agentId: vaultId,
      amount: netDeposit.toString(),
      tokenType: 'SOL',
      lockPeriod: vault.lockPeriod,
      autoCompound: vault.autoCompound,
      apy: vault.currentAPY,
      status: 'active',
      startTime: new Date(),
      rewardsClaimed: '0',
    });

    // Update vault TVL
    await vault.update({
      totalValueLocked: (currentTVL + netDeposit).toString(),
      totalDepositors: vault.totalDepositors + 1,
    });

    res.json({
      success: true,
      deposit: {
        stakeId: stake.id,
        amount: depositAmount,
        fee: feeAmount.toFixed(4),
        netDeposit: netDeposit.toFixed(4),
        apy: vault.currentAPY,
        lockPeriod: vault.lockPeriod,
        expectedAnnualReturn: (netDeposit * (vault.currentAPY / 100)).toFixed(4),
      },
      message: `Successfully deposited ${netDeposit.toFixed(4)} SOL to ${vault.name}`
    });

  } catch (error: any) {
    console.error('Error depositing to vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to deposit',
      details: error.message
    });
  }
}

/**
 * Withdraw from vault
 */
export async function withdrawFromVault(req: Request, res: Response) {
  try {
    const { stakeId, userWallet } = req.body;

    const stake = await Stake.findOne({
      where: { id: stakeId, userWallet }
    });

    if (!stake) {
      return res.status(404).json({
        success: false,
        error: 'Stake not found'
      });
    }

    const vault = await Vault.findByPk(stake.agentId);
    if (!vault) {
      return res.status(404).json({
        success: false,
        error: 'Vault not found'
      });
    }

    // Check lock period
    if (stake.lockPeriod > 0) {
      const lockEnd = new Date(stake.startTime);
      lockEnd.setDate(lockEnd.getDate() + stake.lockPeriod);

      if (new Date() < lockEnd) {
        return res.status(400).json({
          success: false,
          error: 'Stake is still locked',
          unlockDate: lockEnd.toISOString(),
        });
      }
    }

    // Calculate rewards
    const now = new Date();
    const start = new Date(stake.startTime);
    const daysStaked = (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    const principal = parseFloat(stake.amount);
    const apy = stake.apy / 100;
    const rewards = principal * (apy / 365) * daysStaked;

    // Apply withdrawal fee
    const totalAmount = principal + rewards;
    const feeAmount = totalAmount * (vault.withdrawalFee / 100);
    const netWithdrawal = totalAmount - feeAmount;

    // Update stake
    await stake.update({
      status: 'completed',
      endTime: now,
      rewardsClaimed: rewards.toString(),
    });

    // Update vault TVL
    await vault.update({
      totalValueLocked: (parseFloat(vault.totalValueLocked) - principal).toString(),
      totalDepositors: Math.max(0, vault.totalDepositors - 1),
    });

    res.json({
      success: true,
      withdrawal: {
        principal: principal.toFixed(4),
        rewards: rewards.toFixed(4),
        fee: feeAmount.toFixed(4),
        netWithdrawal: netWithdrawal.toFixed(4),
        daysStaked: Math.floor(daysStaked),
      },
      message: `Successfully withdrawn ${netWithdrawal.toFixed(4)} SOL`
    });

  } catch (error: any) {
    console.error('Error withdrawing from vault:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to withdraw',
      details: error.message
    });
  }
}

/**
 * Create seed vaults (initial vaults for the platform)
 */
export async function createSeedVaults(req: Request, res: Response) {
  try {
    const seedVaults = [
      {
        name: 'Conservative SOL Vault',
        description: 'Low-risk vault focused on stable returns through conservative trading strategies',
        strategy: 'conservative' as const,
        currentAPY: 12,
        historicalAPY: 11.5,
        minDeposit: '0.5',
        maxCapacity: '5000',
        depositFee: 0,
        withdrawalFee: 0.5,
        performanceFee: 5,
        lockPeriod: 0,
        autoCompound: true,
        riskLevel: 3,
      },
      {
        name: 'Balanced Growth Vault',
        description: 'Medium-risk vault balancing growth and stability with diversified strategies',
        strategy: 'balanced' as const,
        currentAPY: 25,
        historicalAPY: 23,
        minDeposit: '1',
        maxCapacity: '10000',
        depositFee: 0,
        withdrawalFee: 0.5,
        performanceFee: 10,
        lockPeriod: 30,
        autoCompound: true,
        riskLevel: 5,
      },
      {
        name: 'Aggressive Alpha Vault',
        description: 'High-risk vault seeking maximum returns through aggressive trading strategies',
        strategy: 'aggressive' as const,
        currentAPY: 50,
        historicalAPY: 45,
        minDeposit: '2',
        maxCapacity: '3000',
        depositFee: 0,
        withdrawalFee: 1,
        performanceFee: 20,
        lockPeriod: 90,
        autoCompound: true,
        riskLevel: 9,
      },
    ];

    const createdVaults = [];
    for (const vaultData of seedVaults) {
      const existing = await Vault.findOne({ where: { name: vaultData.name } });
      if (!existing) {
        const vault = await Vault.create(vaultData);
        createdVaults.push(vault);
      }
    }

    res.json({
      success: true,
      created: createdVaults.length,
      message: `Created ${createdVaults.length} seed vaults`
    });

  } catch (error: any) {
    console.error('Error creating seed vaults:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create seed vaults',
      details: error.message
    });
  }
}
