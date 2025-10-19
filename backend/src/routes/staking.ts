import express from 'express';
import {
  createStake,
  getUserStakes,
  claimRewards,
  unstake
} from '../controllers/stakingController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// Staking operations
router.post('/stake', rateLimitPresets.moderate, createStake);
router.get('/stakes/:walletAddress', rateLimitPresets.loose, getUserStakes);
router.post('/claim', rateLimitPresets.moderate, claimRewards);
router.post('/unstake', rateLimitPresets.moderate, unstake);

export default router;
