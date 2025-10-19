import express from 'express';
import {
  manualGraduation,
  getGraduationStatus,
  getGraduatedAgents,
} from '../controllers/graduationController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// POST /api/graduation/graduate/:agentId - Manually graduate an agent
router.post('/graduate/:agentId', rateLimitPresets.strict, manualGraduation);

// GET /api/graduation/status/:agentId - Check graduation status
router.get('/status/:agentId', rateLimitPresets.loose, getGraduationStatus);

// GET /api/graduation/graduated - Get all graduated agents
router.get('/graduated', rateLimitPresets.loose, getGraduatedAgents);

export default router;
