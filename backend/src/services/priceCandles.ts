import PriceCandle from '../models/PriceCandle';
import BondingCurveTrade from '../models/BondingCurveTrade';
import BondingCurve from '../models/BondingCurve';
import { Op } from 'sequelize';
import { calculatePrice, BONDING_CURVE_CONFIG } from './bondingCurve';

const TIMEFRAME_MINUTES = {
  '1m': 1,
  '5m': 5,
  '15m': 15,
  '1h': 60,
  '4h': 240,
  '1d': 1440,
};

/**
 * Get candle data for a specific timeframe
 */
export async function getCandles(
  agentId: string,
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d',
  limit: number = 100
) {
  try {
    const candles = await PriceCandle.findAll({
      where: {
        agentId,
        timeframe,
      },
      order: [['timestamp', 'DESC']],
      limit,
    });

    return candles.reverse(); // Return in chronological order
  } catch (error) {
    console.error('Error fetching candles:', error);
    return [];
  }
}

/**
 * Generate candles from trade history
 * This should be called periodically or after trades
 */
export async function generateCandlesFromTrades(
  agentId: string,
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
) {
  try {
    const timeframeMinutes = TIMEFRAME_MINUTES[timeframe];
    const timeframeMs = timeframeMinutes * 60 * 1000;

    // Get all trades for this agent
    const trades = await BondingCurveTrade.findAll({
      where: { agentId },
      order: [['createdAt', 'ASC']],
    });

    if (trades.length === 0) {
      return [];
    }

    // Group trades into candle periods
    const candleMap = new Map<number, any>();

    for (const trade of trades) {
      const tradeTime = new Date(trade.createdAt).getTime();
      const candleTime = Math.floor(tradeTime / timeframeMs) * timeframeMs;

      if (!candleMap.has(candleTime)) {
        candleMap.set(candleTime, {
          timestamp: new Date(candleTime),
          prices: [],
          volume: 0,
          trades: 0,
        });
      }

      const candle = candleMap.get(candleTime);
      const price = parseFloat(trade.pricePerToken);
      candle.prices.push(price);
      candle.volume += parseFloat(trade.solAmount);
      candle.trades += 1;
    }

    // Create candles from aggregated data
    const candles = [];
    for (const [candleTime, data] of candleMap) {
      const prices = data.prices;
      const open = prices[0];
      const close = prices[prices.length - 1];
      const high = Math.max(...prices);
      const low = Math.min(...prices);

      // Calculate market cap based on close price
      const marketCap = close * BONDING_CURVE_CONFIG.TOTAL_SUPPLY;

      candles.push({
        agentId,
        timestamp: data.timestamp,
        timeframe,
        open: open.toFixed(10),
        high: high.toFixed(10),
        low: low.toFixed(10),
        close: close.toFixed(10),
        volume: data.volume.toFixed(2),
        marketCap: marketCap.toFixed(2),
        trades: data.trades,
      });
    }

    // Save candles to database (upsert to avoid duplicates)
    for (const candleData of candles) {
      await PriceCandle.upsert(candleData);
    }

    return candles;
  } catch (error) {
    console.error('Error generating candles:', error);
    return [];
  }
}

/**
 * Generate synthetic candles for new agents with no trades
 * This creates a baseline chart showing the initial bonding curve price
 */
export async function generateSyntheticCandles(
  agentId: string,
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
) {
  try {
    const bondingCurve = await BondingCurve.findOne({ where: { agentId } });
    if (!bondingCurve) {
      return [];
    }

    const initialPrice = BONDING_CURVE_CONFIG.INITIAL_PRICE;
    const currentPrice = calculatePrice(parseFloat(bondingCurve.tokensSold));

    const now = Date.now();
    const timeframeMs = TIMEFRAME_MINUTES[timeframe] * 60 * 1000;
    const candles = [];

    // Generate last 100 candles with initial price
    for (let i = 99; i >= 0; i--) {
      const timestamp = new Date(now - (i * timeframeMs));
      const price = i === 0 ? currentPrice : initialPrice;
      const marketCap = price * BONDING_CURVE_CONFIG.TOTAL_SUPPLY;

      candles.push({
        agentId,
        timestamp,
        timeframe,
        open: price.toFixed(10),
        high: price.toFixed(10),
        low: price.toFixed(10),
        close: price.toFixed(10),
        volume: '0',
        marketCap: marketCap.toFixed(2),
        trades: 0,
      });
    }

    // Save to database
    for (const candleData of candles) {
      await PriceCandle.upsert(candleData);
    }

    return candles;
  } catch (error) {
    console.error('Error generating synthetic candles:', error);
    return [];
  }
}

/**
 * Update candles after a new trade
 */
export async function updateCandlesAfterTrade(agentId: string) {
  try {
    // Regenerate candles for all timeframes
    const timeframes: Array<'1m' | '5m' | '15m' | '1h' | '4h' | '1d'> =
      ['1m', '5m', '15m', '1h', '4h', '1d'];

    for (const timeframe of timeframes) {
      await generateCandlesFromTrades(agentId, timeframe);
    }
  } catch (error) {
    console.error('Error updating candles after trade:', error);
  }
}
