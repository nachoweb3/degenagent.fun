import { Request, Response } from 'express';
import AgentStrategy from '../models/AgentStrategy';
import { validateStrategyCode, executeStrategyCode, backtestStrategy } from '../services/codeSandbox';

/**
 * POST /api/strategy/save
 * Save or update agent strategy
 */
export async function saveStrategy(req: Request, res: Response) {
  try {
    const { agentId, name, description, code } = req.body;

    if (!agentId || !name || !code) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate code
    const validation = validateStrategyCode(code);
    if (!validation.valid) {
      return res.status(400).json({
        error: 'Invalid strategy code',
        details: validation.errors,
      });
    }

    // Check if strategy exists
    const existing = await AgentStrategy.findOne({
      where: { agentId, isActive: true },
    });

    if (existing) {
      // Deactivate old version
      await existing.update({ isActive: false });
    }

    // Create new version
    const strategy = await AgentStrategy.create({
      agentId,
      name,
      description: description || '',
      code,
      version: existing ? existing.version + 1 : 1,
      isActive: true,
    });

    res.json({
      success: true,
      strategy: {
        id: strategy.id,
        version: strategy.version,
      },
      message: 'Strategy saved successfully',
    });
  } catch (error: any) {
    console.error('Error saving strategy:', error);
    res.status(500).json({
      error: 'Failed to save strategy',
      details: error.message,
    });
  }
}

/**
 * GET /api/strategy/:agentId
 * Get active strategy for agent
 */
export async function getStrategy(req: Request, res: Response) {
  try {
    const { agentId } = req.params;

    const strategy = await AgentStrategy.findOne({
      where: { agentId, isActive: true },
    });

    if (!strategy) {
      return res.status(404).json({ error: 'No active strategy found' });
    }

    res.json({
      success: true,
      strategy: {
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        code: strategy.code,
        version: strategy.version,
        backtestResults: strategy.backtestResults,
      },
    });
  } catch (error: any) {
    console.error('Error getting strategy:', error);
    res.status(500).json({
      error: 'Failed to get strategy',
      details: error.message,
    });
  }
}

/**
 * POST /api/strategy/test
 * Test strategy code in sandbox
 */
export async function testStrategy(req: Request, res: Response) {
  try {
    const { code, marketData } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // Use default market data if not provided
    const defaultMarket = {
      price: 0.5,
      volume24h: 150000,
      priceChange24h: -7.5,
      liquidity: 50000,
    };

    const market = marketData || defaultMarket;
    const position = null;
    const balance = 100; // 100 SOL test balance

    const result = executeStrategyCode(code, market, position, balance);

    res.json({
      success: !result.error,
      result: result.error
        ? { error: result.error }
        : {
            shouldBuy: result.shouldBuy,
            shouldSell: result.shouldSell,
            positionSize: result.positionSize,
            market,
          },
    });
  } catch (error: any) {
    console.error('Error testing strategy:', error);
    res.status(500).json({
      error: 'Failed to test strategy',
      details: error.message,
    });
  }
}

/**
 * POST /api/strategy/backtest
 * Backtest strategy against historical data
 */
export async function backtestStrategyHandler(req: Request, res: Response) {
  try {
    const { agentId, code } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Code required' });
    }

    // Generate mock historical data (in production, use real data)
    const historicalData = [];
    let price = 1.0;
    for (let i = 0; i < 100; i++) {
      price = price * (1 + (Math.random() - 0.5) * 0.1); // Random ±5% change
      historicalData.push({
        price,
        volume24h: 100000 + Math.random() * 50000,
        priceChange24h: (Math.random() - 0.5) * 20,
        liquidity: 50000 + Math.random() * 25000,
      });
    }

    const results = backtestStrategy(code, historicalData);

    if (!results.success) {
      return res.status(400).json({
        success: false,
        error: results.error,
      });
    }

    // Save backtest results if agentId provided
    if (agentId && results.results) {
      const strategy = await AgentStrategy.findOne({
        where: { agentId, isActive: true },
      });

      if (strategy) {
        await strategy.update({
          backtestResults: JSON.stringify(results.results),
        });
      }
    }

    res.json({
      success: true,
      results: results.results,
    });
  } catch (error: any) {
    console.error('Error backtesting strategy:', error);
    res.status(500).json({
      error: 'Failed to backtest strategy',
      details: error.message,
    });
  }
}
