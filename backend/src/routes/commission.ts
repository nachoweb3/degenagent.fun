import { Router } from 'express';
import commissionController from '../controllers/commissionController';

const router = Router();

// Get commission statistics
router.get('/stats', commissionController.getStats);

// Get commission configuration
router.get('/config', commissionController.getConfig);

// Get recent commissions
router.get('/recent', commissionController.getRecent);

// Get total unclaimed commissions
router.get('/unclaimed', commissionController.getUnclaimed);

// Get commissions for specific owner
router.get('/owner/:address', commissionController.getOwnerCommissions);

// Claim a commission (admin)
router.post('/claim/:id', commissionController.claim);

export default router;
