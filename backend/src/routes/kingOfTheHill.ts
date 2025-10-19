import express from 'express';
import {
  getCurrent,
  getHistory,
  getLeaderboardData,
  getStats,
} from '../controllers/kingOfTheHillController';

const router = express.Router();

// Get current king
router.get('/current', getCurrent);

// Get historical kings
router.get('/history', getHistory);

// Get all-time leaderboard
router.get('/leaderboard', getLeaderboardData);

// Get competition stats
router.get('/stats', getStats);

export default router;
