import express from 'express';
import {
  generateReferralCode,
  registerReferral,
  getReferralStats,
  claimRewards,
  getTopReferrers
} from '../controllers/referralController';

const router = express.Router();

// Generate referral code for user
router.post('/generate', generateReferralCode);

// Register a new referral
router.post('/register', registerReferral);

// Get referral stats for wallet
router.get('/stats/:walletAddress', getReferralStats);

// Claim referral rewards
router.post('/claim', claimRewards);

// Get top referrers leaderboard
router.get('/leaderboard', getTopReferrers);

export default router;
