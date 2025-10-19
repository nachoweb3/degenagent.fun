import express from 'express';
import {
  getIndicators,
  getRSI,
  getMACD,
  analyzeCustomData,
} from '../controllers/indicatorsController';

const router = express.Router();

// GET /api/indicators/:agentId - Get all indicators for an agent
router.get('/:agentId', getIndicators);

// GET /api/indicators/:agentId/rsi - Get RSI only
router.get('/:agentId/rsi', getRSI);

// GET /api/indicators/:agentId/macd - Get MACD only
router.get('/:agentId/macd', getMACD);

// POST /api/indicators/analyze - Analyze custom price data
router.post('/analyze', analyzeCustomData);

export default router;
