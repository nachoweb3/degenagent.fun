import express from 'express';
import {
  getAllVaults,
  getVaultById,
  depositToVault,
  withdrawFromVault,
  createSeedVaults
} from '../controllers/vaultController';
import { rateLimitPresets } from '../middleware/rateLimiter';

const router = express.Router();

// Vault operations
router.get('/', rateLimitPresets.loose, getAllVaults);
router.get('/:vaultId', rateLimitPresets.loose, getVaultById);
router.post('/deposit', rateLimitPresets.moderate, depositToVault);
router.post('/withdraw', rateLimitPresets.moderate, withdrawFromVault);

// Admin: Create seed vaults
router.post('/seed', rateLimitPresets.strict, createSeedVaults);

export default router;
