import express from 'express';
import {
  getAgentPerformance,
  getAgentPerformanceHistory,
  getPerformanceLeaderboard,
  forceUpdatePerformance,
  getGlobalStats,
} from '../controllers/performanceController';

const router = express.Router();

// GET /api/performance/leaderboard - Get global leaderboard
router.get('/leaderboard', getPerformanceLeaderboard);

// GET /api/performance/stats - Get global statistics
router.get('/stats', getGlobalStats);

// GET /api/performance/:agentId - Get agent performance
router.get('/:agentId', getAgentPerformance);

// GET /api/performance/:agentId/history - Get performance history
router.get('/:agentId/history', getAgentPerformanceHistory);

// POST /api/performance/:agentId/update - Force update performance
router.post('/:agentId/update', forceUpdatePerformance);

export default router;
