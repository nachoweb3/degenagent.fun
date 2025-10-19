import { Request, Response } from 'express';
import StrategyMarketplace from '../models/StrategyMarketplace';
import AgentStrategy from '../models/AgentStrategy';
import { Op } from 'sequelize';

/**
 * POST /api/marketplace/list
 * List a strategy on the marketplace
 */
export async function listStrategy(req: Request, res: Response) {
  try {
    const { strategyId, sellerId, title, description, price, category, tags } = req.body;

    if (!strategyId || !sellerId || !title || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify strategy exists
    const strategy = await AgentStrategy.findByPk(strategyId);
    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    // Parse backtest results for performance metrics
    let performance = {
      winRate: 0,
      totalTrades: 0,
      avgReturn: 0,
      backtestPeriod: '30 days',
    };

    if (strategy.backtestResults) {
      const results = JSON.parse(strategy.backtestResults);
      performance = {
        winRate: results.winRate || 0,
        totalTrades: results.totalTrades || 0,
        avgReturn: results.avgReturn || 0,
        backtestPeriod: '30 days',
      };
    }

    // Create marketplace listing
    const listing = await StrategyMarketplace.create({
      strategyId,
      sellerId,
      title,
      description: description || '',
      price: price.toString(),
      category,
      tags: tags || [],
      performance,
      sales: 0,
      rating: 0,
      reviews: 0,
      isVerified: false,
      isFeatured: false,
    });

    res.json({
      success: true,
      listing: {
        id: listing.id,
        strategyId: listing.strategyId,
        title: listing.title,
        price: listing.price,
      },
      message: 'Strategy listed on marketplace',
    });
  } catch (error: any) {
    console.error('Error listing strategy:', error);
    res.status(500).json({
      error: 'Failed to list strategy',
      details: error.message,
    });
  }
}

/**
 * GET /api/marketplace/browse
 * Browse marketplace listings with filters
 */
export async function browseMarketplace(req: Request, res: Response) {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      minWinRate,
      sortBy = 'sales',
      limit = 20,
      offset = 0,
    } = req.query;

    // Build filter conditions
    const where: any = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = minPrice;
      if (maxPrice) where.price[Op.lte] = maxPrice;
    }

    // Get listings
    const listings = await StrategyMarketplace.findAll({
      where,
      order: [
        sortBy === 'sales' ? ['sales', 'DESC'] :
        sortBy === 'rating' ? ['rating', 'DESC'] :
        sortBy === 'price-low' ? ['price', 'ASC'] :
        sortBy === 'price-high' ? ['price', 'DESC'] :
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    // Filter by winRate if specified (JSON field)
    let filteredListings = listings;
    if (minWinRate) {
      const minRate = parseFloat(minWinRate as string);
      filteredListings = listings.filter((l) => l.performance.winRate >= minRate);
    }

    res.json({
      success: true,
      listings: filteredListings.map((l) => ({
        id: l.id,
        strategyId: l.strategyId,
        sellerId: l.sellerId,
        title: l.title,
        description: l.description,
        price: l.price,
        category: l.category,
        tags: l.tags,
        performance: l.performance,
        sales: l.sales,
        rating: l.rating,
        reviews: l.reviews,
        isVerified: l.isVerified,
        isFeatured: l.isFeatured,
        createdAt: l.createdAt,
      })),
      total: filteredListings.length,
    });
  } catch (error: any) {
    console.error('Error browsing marketplace:', error);
    res.status(500).json({
      error: 'Failed to browse marketplace',
      details: error.message,
    });
  }
}

/**
 * GET /api/marketplace/:id
 * Get detailed listing information
 */
export async function getListingDetails(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const listing = await StrategyMarketplace.findByPk(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get the actual strategy code (only for purchased strategies)
    // For now, return listing details without code
    res.json({
      success: true,
      listing: {
        id: listing.id,
        strategyId: listing.strategyId,
        sellerId: listing.sellerId,
        title: listing.title,
        description: listing.description,
        price: listing.price,
        category: listing.category,
        tags: listing.tags,
        performance: listing.performance,
        sales: listing.sales,
        rating: listing.rating,
        reviews: listing.reviews,
        isVerified: listing.isVerified,
        isFeatured: listing.isFeatured,
        createdAt: listing.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error getting listing:', error);
    res.status(500).json({
      error: 'Failed to get listing',
      details: error.message,
    });
  }
}

/**
 * POST /api/marketplace/purchase
 * Purchase a strategy from the marketplace
 */
export async function purchaseStrategy(req: Request, res: Response) {
  try {
    const { listingId, buyerId } = req.body;

    if (!listingId || !buyerId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await StrategyMarketplace.findByPk(listingId);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get the strategy code
    const strategy = await AgentStrategy.findByPk(listing.strategyId);

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    // In production, this would:
    // 1. Process payment via Solana
    // 2. Transfer funds to seller (minus platform fee)
    // 3. Create a copy of the strategy for the buyer
    // 4. Update sales count
    // For MVP, we'll simulate this:

    await listing.update({
      sales: listing.sales + 1,
    });

    res.json({
      success: true,
      strategy: {
        id: strategy.id,
        name: strategy.name,
        description: strategy.description,
        code: strategy.code,
        version: strategy.version,
      },
      message: 'Strategy purchased successfully',
      // In production, return transaction signature
      txSignature: 'mock_tx_' + Date.now(),
    });
  } catch (error: any) {
    console.error('Error purchasing strategy:', error);
    res.status(500).json({
      error: 'Failed to purchase strategy',
      details: error.message,
    });
  }
}

/**
 * POST /api/marketplace/review
 * Add a review to a purchased strategy
 */
export async function addReview(req: Request, res: Response) {
  try {
    const { listingId, rating, comment } = req.body;

    if (!listingId || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const listing = await StrategyMarketplace.findByPk(listingId);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Calculate new average rating
    const totalReviews = listing.reviews;
    const currentRating = parseFloat(listing.rating.toString());
    const newRating = ((currentRating * totalReviews) + rating) / (totalReviews + 1);

    await listing.update({
      rating: parseFloat(newRating.toFixed(2)),
      reviews: totalReviews + 1,
    });

    res.json({
      success: true,
      message: 'Review added successfully',
      newRating: newRating.toFixed(2),
      totalReviews: totalReviews + 1,
    });
  } catch (error: any) {
    console.error('Error adding review:', error);
    res.status(500).json({
      error: 'Failed to add review',
      details: error.message,
    });
  }
}
