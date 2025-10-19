import { Request, Response } from 'express';
import {
  getCandles,
  generateCandlesFromTrades,
  generateSyntheticCandles,
} from '../services/priceCandles';
import BondingCurve from '../models/BondingCurve';
import BondingCurveTrade from '../models/BondingCurveTrade';
import { calculatePrice, BONDING_CURVE_CONFIG } from '../services/bondingCurve';

export async function getChartData(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;

    if (!agentId) {
      return res.status(400).json({ error: 'Agent ID required' });
    }

    const validTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d'];
    if (!validTimeframes.includes(timeframe as string)) {
      return res.status(400).json({ error: 'Invalid timeframe' });
    }

    // Check if agent has trades
    const tradesCount = await BondingCurveTrade.count({ where: { agentId } });

    let candles;
    if (tradesCount === 0) {
      // Generate synthetic candles for new agents
      candles = await generateSyntheticCandles(
        agentId,
        timeframe as '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
      );
    } else {
      // Try to get existing candles
      candles = await getCandles(
        agentId,
        timeframe as '1m' | '5m' | '15m' | '1h' | '4h' | '1d',
        parseInt(limit as string)
      );

      // If no candles exist, generate them from trades
      if (candles.length === 0) {
        candles = await generateCandlesFromTrades(
          agentId,
          timeframe as '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
        );
      }
    }

    // Get current stats
    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    const currentPrice = bondingCurve
      ? calculatePrice(parseFloat(bondingCurve.tokensSold))
      : BONDING_CURVE_CONFIG.INITIAL_PRICE;

    const marketCap = currentPrice * BONDING_CURVE_CONFIG.TOTAL_SUPPLY;

    // Calculate 24h change
    let priceChange24h = 0;
    let priceChangePercent24h = 0;
    if (candles.length >= 2) {
      const oldestPrice = parseFloat(candles[0].close);
      const newestPrice = parseFloat(candles[candles.length - 1].close);
      priceChange24h = newestPrice - oldestPrice;
      priceChangePercent24h = (priceChange24h / oldestPrice) * 100;
    }

    res.json({
      success: true,
      data: {
        candles: candles.map((c) => ({
          timestamp: c.timestamp,
          open: parseFloat(c.open),
          high: parseFloat(c.high),
          low: parseFloat(c.low),
          close: parseFloat(c.close),
          volume: parseFloat(c.volume),
          marketCap: parseFloat(c.marketCap),
          trades: c.trades,
        })),
        stats: {
          currentPrice,
          marketCap,
          priceChange24h,
          priceChangePercent24h,
          totalTrades: tradesCount,
        },
      },
    });
  } catch (error: any) {
    console.error('Error getting chart data:', error);
    res.status(500).json({
      error: 'Failed to get chart data',
      details: error.message,
    });
  }
}

export async function getMarketStats(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const currentPrice = calculatePrice(parseFloat(bondingCurve.tokensSold));
    const marketCap = currentPrice * BONDING_CURVE_CONFIG.TOTAL_SUPPLY;
    const fullyDilutedMarketCap = marketCap;

    // Get 24h volume
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const trades24h = await BondingCurveTrade.findAll({
      where: {
        agentId,
        createdAt: { [require('sequelize').Op.gte]: oneDayAgo },
      },
    });

    const volume24h = trades24h.reduce((sum, trade) => {
      return sum + parseFloat(trade.solAmount);
    }, 0);

    // Get price change
    const oldestTrade = await BondingCurveTrade.findOne({
      where: {
        agentId,
        createdAt: { [require('sequelize').Op.gte]: oneDayAgo },
      },
      order: [['createdAt', 'ASC']],
    });

    let priceChange24h = 0;
    let priceChangePercent24h = 0;
    if (oldestTrade) {
      const oldPrice = parseFloat(oldestTrade.pricePerToken);
      priceChange24h = currentPrice - oldPrice;
      priceChangePercent24h = (priceChange24h / oldPrice) * 100;
    }

    res.json({
      success: true,
      stats: {
        price: currentPrice,
        marketCap,
        fullyDilutedMarketCap,
        volume24h,
        priceChange24h,
        priceChangePercent24h,
        totalTrades: await BondingCurveTrade.count({ where: { agentId } }),
        tokensSold: parseFloat(bondingCurve.tokensSold),
        totalValueLocked: parseFloat(bondingCurve.totalValueLocked),
        graduated: bondingCurve.graduated,
      },
    });
  } catch (error: any) {
    console.error('Error getting market stats:', error);
    res.status(500).json({
      error: 'Failed to get market stats',
      details: error.message,
    });
  }
}
