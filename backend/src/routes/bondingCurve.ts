import express from 'express';
import {
  getBondingCurveInfo,
  getQuoteBuyTokens,
  getQuoteSellTokens,
  buyTokens,
  confirmBuy,
  getChartData,
} from '../controllers/bondingCurveController';

const router = express.Router();

// Get bonding curve info for an agent
router.get('/:agentId', getBondingCurveInfo);

// Get buy quote
router.post('/quote-buy', getQuoteBuyTokens);

// Get sell quote
router.post('/quote-sell', getQuoteSellTokens);

// Buy tokens
router.post('/buy', buyTokens);

// Confirm buy transaction
router.post('/confirm-buy', confirmBuy);

// Get chart data
router.get('/chart/:agentId', getChartData);

export default router;
