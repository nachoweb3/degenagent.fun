import express from 'express';
import {
  getTokenPriceHandler,
  getMultiplePricesHandler,
  getQuoteHandler,
  executeSwapHandler,
  buyHandler,
  sellHandler,
  analyzeTradeHandler,
  simulateTradeHandler,
  getPortfolioHandler,
  getRiskMetricsHandler,
  createStopLossHandler,
  createTakeProfitHandler,
  createLimitOrderHandler,
  cancelOrderHandler,
  getOrdersHandler,
  getTradeHistoryHandler,
  getTradingStatsHandler,
  generateSignalHandler,
  executeStrategyHandler
} from '../controllers/tradingController';

const router = express.Router();

// Price endpoints
router.get('/price/:tokenMint', getTokenPriceHandler);
router.post('/prices', getMultiplePricesHandler);

// Quote and swap endpoints
router.post('/quote', getQuoteHandler);
router.post('/swap', executeSwapHandler);
router.post('/buy', buyHandler);
router.post('/sell', sellHandler);

// Analysis endpoints
router.post('/analyze', analyzeTradeHandler);
router.post('/simulate', simulateTradeHandler);

// Portfolio and risk endpoints
router.get('/portfolio/:walletAddress', getPortfolioHandler);
router.get('/risk/:agentPubkey', getRiskMetricsHandler);

// Order management endpoints
router.post('/orders/stop-loss', createStopLossHandler);
router.post('/orders/take-profit', createTakeProfitHandler);
router.post('/orders/limit', createLimitOrderHandler);
router.delete('/orders/:orderId', cancelOrderHandler);
router.get('/orders/:agentId', getOrdersHandler);

// Trade history and stats
router.get('/history/:agentId', getTradeHistoryHandler);
router.get('/stats/:agentId', getTradingStatsHandler);

// Trading strategy endpoints
router.post('/signal', generateSignalHandler);
router.post('/strategy/execute', executeStrategyHandler);

export default router;
