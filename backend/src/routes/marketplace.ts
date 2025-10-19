import express from 'express';
import {
  listStrategy,
  browseMarketplace,
  getListingDetails,
  purchaseStrategy,
  addReview,
} from '../controllers/marketplaceController';

const router = express.Router();

// POST /api/marketplace/list - List a strategy on the marketplace
router.post('/list', listStrategy);

// GET /api/marketplace/browse - Browse marketplace with filters
router.get('/browse', browseMarketplace);

// GET /api/marketplace/:id - Get detailed listing information
router.get('/:id', getListingDetails);

// POST /api/marketplace/purchase - Purchase a strategy
router.post('/purchase', purchaseStrategy);

// POST /api/marketplace/review - Add a review to a strategy
router.post('/review', addReview);

export default router;
