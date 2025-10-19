import { Request, Response } from 'express';
import Agent from '../models/Agent';
import BondingCurve from '../models/BondingCurve';
import BondingCurveTrade from '../models/BondingCurveTrade';
import StrategyMarketplace from '../models/StrategyMarketplace';
import Vault from '../models/Vault';
import { Op } from 'sequelize';

/**
 * GET /api/analytics
 * Get comprehensive platform analytics
 */
export async function getPlatformAnalytics(req: Request, res: Response) {
  try {
    const { timeframe = '7d' } = req.query;

    // Calculate time range
    const now = new Date();
    let startDate = new Date(0); // Beginning of time

    if (timeframe === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Fetch all data in parallel
    const [
      allAgents,
      agentsInTimeframe,
      bondingCurves,
      allTrades,
      tradesInTimeframe,
      marketplaceListings,
      vaults,
    ] = await Promise.all([
      Agent.findAll(),
      Agent.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
        },
      }),
      BondingCurve.findAll(),
      BondingCurveTrade.findAll(),
      BondingCurveTrade.findAll({
        where: {
          createdAt: { [Op.gte]: startDate },
        },
      }),
      StrategyMarketplace.findAll(),
      Vault.findAll(),
    ]);

    // Calculate platform metrics
    const activeAgents = allAgents.filter((a) => a.status === 'active').length;
    const totalAgents = allAgents.length;

    // Calculate unique users (unique wallet addresses from agents)
    const uniqueWallets = new Set(allAgents.map((a) => a.walletAddress)).size;

    // Calculate total volume from trades
    const totalVolume = allTrades.reduce((sum, trade) => {
      return sum + parseFloat(trade.solAmount);
    }, 0);

    const volumeInTimeframe = tradesInTimeframe.reduce((sum, trade) => {
      return sum + parseFloat(trade.solAmount);
    }, 0);

    // Platform fees (1% of volume)
    const totalFees = totalVolume * 0.01;
    const feesInTimeframe = volumeInTimeframe * 0.01;

    // Bonding curve metrics
    const totalValueLocked = bondingCurves.reduce((sum, bc) => {
      return sum + parseFloat(bc.totalValueLocked);
    }, 0);

    const graduatedAgents = bondingCurves.filter((bc) => bc.graduated).length;

    const averageTokenPrice = totalVolume / (allTrades.length || 1);

    // Marketplace metrics
    const totalSales = marketplaceListings.reduce((sum, listing) => {
      return sum + listing.sales;
    }, 0);

    const totalMarketplaceRevenue = marketplaceListings.reduce((sum, listing) => {
      return sum + listing.sales * parseFloat(listing.price);
    }, 0);

    // Category distribution
    const categoryCount = marketplaceListings.reduce((acc: any, listing) => {
      acc[listing.category] = (acc[listing.category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Vault metrics (simplified - no deposits tracking for now)
    const totalVaultDeposits = vaults.reduce((sum: number, v: any) => {
      return sum + parseFloat(v.totalValueLocked || '0');
    }, 0);

    const totalDepositors = vaults.reduce((sum: number, v: any) => {
      return sum + (v.totalDepositors || 0);
    }, 0);

    const averageAPY = vaults.reduce((sum: number, v: any) => sum + v.currentAPY, 0) / (vaults.length || 1);

    // Recent activity
    const latestAgents = allAgents
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((agent: any) => ({
        id: agent.id,
        name: agent.name,
        ticker: agent.ticker || 'N/A',
        status: agent.status,
        walletAddress: agent.walletAddress,
        createdAt: agent.createdAt,
      }));

    const latestTrades = allTrades
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map((trade: any) => ({
        id: trade.id,
        agentId: trade.agentId,
        type: trade.type,
        tokenAmount: trade.tokenAmount,
        solAmount: trade.solAmount,
        price: parseFloat(trade.solAmount) / parseFloat(trade.tokenAmount),
        createdAt: trade.createdAt,
      }));

    // Top performers (by volume)
    const agentVolumes = allTrades.reduce((acc: any, trade: any) => {
      acc[trade.agentId] = (acc[trade.agentId] || 0) + parseFloat(trade.solAmount);
      return acc;
    }, {});

    const topPerformers = Object.entries(agentVolumes)
      .map(([agentId, volume]) => {
        const agent = allAgents.find((a: any) => a.id === agentId);
        return {
          agentId,
          name: (agent as any)?.name || 'Unknown',
          ticker: (agent as any)?.ticker || 'N/A',
          volume: volume as number,
        };
      })
      .sort((a: any, b: any) => b.volume - a.volume)
      .slice(0, 10);

    // Growth metrics
    const agentsGrowth = ((agentsInTimeframe.length / (totalAgents || 1)) * 100).toFixed(1);
    const volumeGrowth = ((volumeInTimeframe / (totalVolume || 1)) * 100).toFixed(1);

    res.json({
      success: true,
      timeframe,
      analytics: {
        platform: {
          totalAgents,
          activeAgents,
          totalUsers: uniqueWallets,
          totalVolume: totalVolume.toFixed(2),
          totalFees: totalFees.toFixed(2),
          agentsGrowth: parseFloat(agentsGrowth),
          volumeGrowth: parseFloat(volumeGrowth),
        },
        bonding: {
          totalTrades: allTrades.length,
          tradesInTimeframe: tradesInTimeframe.length,
          totalValueLocked: totalValueLocked.toFixed(2),
          averagePrice: averageTokenPrice.toFixed(8),
          graduatedAgents,
        },
        marketplace: {
          totalListings: marketplaceListings.length,
          totalSales,
          totalRevenue: totalMarketplaceRevenue.toFixed(2),
          topCategories,
        },
        vaults: {
          totalDeposits: totalVaultDeposits.toFixed(2),
          totalDepositors,
          averageAPY: averageAPY.toFixed(2),
          totalVaults: vaults.length,
        },
        recent: {
          latestAgents,
          latestTrades,
          topPerformers,
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({
      error: 'Failed to fetch analytics',
      details: error.message,
    });
  }
}

/**
 * GET /api/analytics/charts
 * Get time-series data for charts
 */
export async function getChartData(req: Request, res: Response) {
  try {
    const { metric = 'volume', timeframe = '7d' } = req.query;

    // Calculate time range and intervals
    const now = new Date();
    let startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let interval = 24 * 60 * 60 * 1000; // 1 day

    if (timeframe === '24h') {
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      interval = 60 * 60 * 1000; // 1 hour
    } else if (timeframe === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      interval = 24 * 60 * 60 * 1000; // 1 day
    }

    // Fetch relevant data
    const trades = await BondingCurveTrade.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      order: [['createdAt', 'ASC']],
    });

    // Group by time intervals
    const dataPoints = [];
    let currentTime = startDate.getTime();

    while (currentTime <= now.getTime()) {
      const intervalEnd = currentTime + interval;
      const intervalTrades = trades.filter((t) => {
        const time = new Date(t.createdAt).getTime();
        return time >= currentTime && time < intervalEnd;
      });

      let value = 0;
      if (metric === 'volume') {
        value = intervalTrades.reduce((sum: number, t: any) => sum + parseFloat(t.solAmount), 0);
      } else if (metric === 'trades') {
        value = intervalTrades.length;
      } else if (metric === 'users') {
        // Approximate unique users from trades
        value = intervalTrades.length > 0 ? Math.ceil(intervalTrades.length / 3) : 0;
      }

      dataPoints.push({
        timestamp: new Date(currentTime).toISOString(),
        value,
      });

      currentTime = intervalEnd;
    }

    res.json({
      success: true,
      metric,
      timeframe,
      data: dataPoints,
    });
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({
      error: 'Failed to fetch chart data',
      details: error.message,
    });
  }
}
