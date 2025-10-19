import express from 'express';
import {
  createAgentHandler,
  getAgentHandler,
  depositFundsHandler,
  getAllAgentsHandler,
  getTreasuryWallet
} from '../controllers/agentController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// Agent creation with strict rate limiting (5 per hour per wallet)
router.post('/create', rateLimitPresets.agentCreation, createAgentHandler);

// Read operations with loose rate limiting
router.get('/all', rateLimitPresets.loose, getAllAgentsHandler);
router.get('/treasury', rateLimitPresets.loose, getTreasuryWallet);
router.get('/:pubkey', rateLimitPresets.loose, getAgentHandler);

// Deposit with moderate rate limiting
router.post('/:pubkey/deposit', rateLimitPresets.moderate, depositFundsHandler);

export default router;
