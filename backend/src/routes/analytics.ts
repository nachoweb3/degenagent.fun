import express from 'express';
import { getPlatformAnalytics, getChartData } from '../controllers/analyticsController';

const router = express.Router();

// GET /api/analytics - Get platform analytics
router.get('/', getPlatformAnalytics);

// GET /api/analytics/charts - Get time-series chart data
router.get('/charts', getChartData);

export default router;
