import { Request, Response } from 'express';
import PriceCandle from '../models/PriceCandle';
import {
  analyzeIndicators,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateATR,
  calculateOBV,
  calculateVWAP,
  calculateStochastic,
  PriceData,
} from '../services/tradingIndicators';
import { logger } from '../utils/logger';

/**
 * GET /api/indicators/:agentId
 * Get all technical indicators for an agent
 */
export async function getIndicators(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { timeframe = '1h', limit = 100 } = req.query;

    logger.info('INDICATORS', `Fetching indicators for agent ${agentId}`, {
      timeframe,
      limit,
    });

    // Fetch price candles
    const candles = await PriceCandle.findAll({
      where: {
        agentId,
        timeframe: timeframe as string,
      },
      order: [['timestamp', 'ASC']],
      limit: parseInt(limit as string),
    });

    if (candles.length < 2) {
      return res.json({
        success: true,
        indicators: null,
        message: 'Insufficient data for indicators',
      });
    }

    // Convert to PriceData format
    const priceData: PriceData[] = candles.map((candle) => ({
      timestamp: candle.timestamp,
      open: parseFloat(candle.open),
      high: parseFloat(candle.high),
      low: parseFloat(candle.low),
      close: parseFloat(candle.close),
      volume: parseFloat(candle.volume),
    }));

    // Calculate all indicators
    const analysis = analyzeIndicators(priceData);

    // Get latest values
    const latest = priceData.length - 1;
    const latestIndicators = {
      rsi: {
        value: analysis.rsi[latest]?.value || null,
        signal: analysis.rsi[latest]?.signal || 'neutral',
      },
      macd: {
        macd: analysis.macd[latest]?.macd || null,
        signal: analysis.macd[latest]?.signal || null,
        histogram: analysis.macd[latest]?.histogram || null,
        trend: analysis.macd[latest]?.trend || 'neutral',
      },
      bollingerBands: {
        upper: analysis.bollingerBands[latest]?.upper || null,
        middle: analysis.bollingerBands[latest]?.middle || null,
        lower: analysis.bollingerBands[latest]?.lower || null,
        percentB: analysis.bollingerBands[latest]?.percentB || null,
      },
      atr: analysis.atr[latest]?.value || null,
      obv: analysis.obv[latest]?.value || null,
      vwap: analysis.vwap[latest]?.value || null,
      stochastic: {
        k: analysis.stochastic.k[latest]?.value || null,
        d: analysis.stochastic.d[latest]?.value || null,
      },
    };

    res.json({
      success: true,
      agentId,
      timeframe,
      dataPoints: priceData.length,
      latest: latestIndicators,
      signals: analysis.signals,
      historical: {
        rsi: analysis.rsi.slice(-20), // Last 20 periods
        macd: analysis.macd.slice(-20),
        bollingerBands: analysis.bollingerBands.slice(-20),
      },
    });

    logger.info('INDICATORS', `Indicators calculated successfully`, {
      agentId,
      dataPoints: priceData.length,
      sentiment: analysis.signals.overallSentiment,
    });
  } catch (error: any) {
    logger.error('INDICATORS', 'Error calculating indicators', error, {
      agentId: req.params.agentId,
    });

    res.status(500).json({
      error: 'Failed to calculate indicators',
      details: error.message,
    });
  }
}

/**
 * GET /api/indicators/:agentId/rsi
 * Get RSI indicator only
 */
export async function getRSI(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { timeframe = '1h', period = 14 } = req.query;

    const candles = await PriceCandle.findAll({
      where: { agentId, timeframe: timeframe as string },
      order: [['timestamp', 'ASC']],
      limit: 100,
    });

    if (candles.length < 2) {
      return res.json({
        success: true,
        rsi: null,
        message: 'Insufficient data',
      });
    }

    const priceData: PriceData[] = candles.map((c) => ({
      timestamp: c.timestamp,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume),
    }));

    const rsi = calculateRSI(priceData, parseInt(period as string));

    res.json({
      success: true,
      agentId,
      timeframe,
      period,
      rsi: rsi.slice(-20),
      latest: rsi[rsi.length - 1],
    });
  } catch (error: any) {
    logger.error('INDICATORS', 'Error calculating RSI', error);
    res.status(500).json({ error: 'Failed to calculate RSI', details: error.message });
  }
}

/**
 * GET /api/indicators/:agentId/macd
 * Get MACD indicator only
 */
export async function getMACD(req: Request, res: Response) {
  try {
    const { agentId } = req.params;
    const { timeframe = '1h' } = req.query;

    const candles = await PriceCandle.findAll({
      where: { agentId, timeframe: timeframe as string },
      order: [['timestamp', 'ASC']],
      limit: 100,
    });

    if (candles.length < 26) {
      return res.json({
        success: true,
        macd: null,
        message: 'Insufficient data (need at least 26 periods)',
      });
    }

    const priceData: PriceData[] = candles.map((c) => ({
      timestamp: c.timestamp,
      open: parseFloat(c.open),
      high: parseFloat(c.high),
      low: parseFloat(c.low),
      close: parseFloat(c.close),
      volume: parseFloat(c.volume),
    }));

    const macd = calculateMACD(priceData);

    res.json({
      success: true,
      agentId,
      timeframe,
      macd: macd.slice(-20),
      latest: macd[macd.length - 1],
    });
  } catch (error: any) {
    logger.error('INDICATORS', 'Error calculating MACD', error);
    res.status(500).json({ error: 'Failed to calculate MACD', details: error.message });
  }
}

/**
 * POST /api/indicators/analyze
 * Analyze custom price data
 */
export async function analyzeCustomData(req: Request, res: Response) {
  try {
    const { prices } = req.body;

    if (!prices || !Array.isArray(prices) || prices.length < 2) {
      return res.status(400).json({
        error: 'Invalid price data',
        message: 'Provide an array of at least 2 price points',
      });
    }

    // Validate and convert price data
    const priceData: PriceData[] = prices.map((p: any) => ({
      timestamp: new Date(p.timestamp),
      open: parseFloat(p.open),
      high: parseFloat(p.high),
      low: parseFloat(p.low),
      close: parseFloat(p.close),
      volume: parseFloat(p.volume),
    }));

    const analysis = analyzeIndicators(priceData);

    const latest = priceData.length - 1;

    res.json({
      success: true,
      dataPoints: priceData.length,
      latest: {
        rsi: analysis.rsi[latest],
        macd: analysis.macd[latest],
        bollingerBands: analysis.bollingerBands[latest],
        stochastic: {
          k: analysis.stochastic.k[latest],
          d: analysis.stochastic.d[latest],
        },
      },
      signals: analysis.signals,
    });

    logger.info('INDICATORS', 'Custom data analyzed', {
      dataPoints: priceData.length,
      sentiment: analysis.signals.overallSentiment,
    });
  } catch (error: any) {
    logger.error('INDICATORS', 'Error analyzing custom data', error);
    res.status(500).json({
      error: 'Failed to analyze data',
      details: error.message,
    });
  }
}
