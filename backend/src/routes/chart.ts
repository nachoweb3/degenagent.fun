import express from 'express';
import { getChartData, getMarketStats } from '../controllers/chartController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// GET /api/chart/:agentId - Get OHLCV candle data
router.get('/:agentId', rateLimitPresets.loose, getChartData);

// GET /api/chart/:agentId/stats - Get market statistics
router.get('/:agentId/stats', rateLimitPresets.loose, getMarketStats);

export default router;
