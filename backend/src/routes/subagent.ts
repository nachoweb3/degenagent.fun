import express from 'express';
import {
  getSubagentStats,
  getAllSubagentStats,
  getSubagentLeaderboard
} from '../controllers/subagentController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// Get subagent stats for specific agent
router.get('/:agentId/stats', rateLimitPresets.loose, getSubagentStats);

// Get all subagent stats
router.get('/stats/all', rateLimitPresets.loose, getAllSubagentStats);

// Get subagent leaderboard
router.get('/leaderboard', rateLimitPresets.loose, getSubagentLeaderboard);

export default router;
