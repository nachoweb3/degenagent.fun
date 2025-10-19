import express from 'express';
import { getFeed, getTrendingAgents } from '../controllers/feedController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// Social feed endpoints
router.get('/', rateLimitPresets.loose, getFeed);
router.get('/trending', rateLimitPresets.loose, getTrendingAgents);

export default router;
