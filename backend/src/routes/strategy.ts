import express from 'express';
import {
  saveStrategy,
  getStrategy,
  testStrategy,
  backtestStrategyHandler,
} from '../controllers/strategyController';

const router = express.Router();

// POST /api/strategy/save - Save or update agent strategy
router.post('/save', saveStrategy);

// GET /api/strategy/:agentId - Get active strategy for agent
router.get('/:agentId', getStrategy);

// POST /api/strategy/test - Test strategy code in sandbox
router.post('/test', testStrategy);

// POST /api/strategy/backtest - Backtest strategy against historical data
router.post('/backtest', backtestStrategyHandler);

export default router;
