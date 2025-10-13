import express from 'express';
import {
  createAgentHandler,
  getAgentHandler,
  depositFundsHandler,
  getAllAgentsHandler,
  getTreasuryWallet
} from '../controllers/agentController';

const router = express.Router();

router.post('/create', createAgentHandler);
router.get('/all', getAllAgentsHandler);
router.get('/treasury', getTreasuryWallet);
router.get('/:pubkey', getAgentHandler);
router.post('/:pubkey/deposit', depositFundsHandler);

export default router;
