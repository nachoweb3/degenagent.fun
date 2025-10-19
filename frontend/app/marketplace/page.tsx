'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface StrategyListing {
  id: string;
  strategyId: string;
  sellerId: string;
  title: string;
  description: string;
  price: string;
  category: 'momentum' | 'scalping' | 'value' | 'arbitrage' | 'custom';
  tags: string[];
  performance: {
    winRate: number;
    totalTrades: number;
    avgReturn: number;
    backtestPeriod: string;
  };
  sales: number;
  rating: number;
  reviews: number;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function MarketplacePage() {
  const [listings, setListings] = useState<StrategyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('sales');
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: '', max: '' });
  const [minWinRate, setMinWinRate] = useState<string>('');

  const categories = [
    { id: 'all', name: 'All Strategies', icon: '🎯' },
    { id: 'momentum', name: 'Momentum', icon: '📈' },
    { id: 'scalping', name: 'Scalping', icon: '⚡' },
    { id: 'value', name: 'Value', icon: '💎' },
    { id: 'arbitrage', name: 'Arbitrage', icon: '🔄' },
    { id: 'custom', name: 'Custom', icon: '⚙️' },
  ];

  const sortOptions = [
    { id: 'sales', name: 'Most Popular' },
    { id: 'rating', name: 'Highest Rated' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'recent', name: 'Recently Added' },
  ];

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, sortBy, priceRange, minWinRate]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy) params.append('sortBy', sortBy);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      if (minWinRate) params.append('minWinRate', minWinRate);

      const response = await axios.get(`${BACKEND_API}/marketplace/browse?${params.toString()}`);

      if (response.data.success) {
        setListings(response.data.listings);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: string) => {
    return parseFloat(amount).toFixed(4);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      momentum: 'from-blue-500 to-cyan-500',
      scalping: 'from-yellow-500 to-orange-500',
      value: 'from-purple-500 to-pink-500',
      arbitrage: 'from-green-500 to-emerald-500',
      custom: 'from-gray-500 to-slate-500',
    };
    return colors[category] || 'from-gray-500 to-slate-500';
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-600">★</span>);
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Strategy Marketplace
          </h1>
          <p className="text-gray-400">
            Buy and sell proven trading strategies from top performers
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-8">
          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-sm font-semibold text-gray-400 mb-3 block">Category</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-lg border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-purple-600 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{cat.icon}</div>
                  <div className="text-xs font-medium">{cat.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Sort and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Sort By */}
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              >
                {sortOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Min Price (SOL)</label>
              <input
                type="number"
                step="0.1"
                placeholder="0.0"
                value={priceRange.min}
                onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Max Price (SOL)</label>
              <input
                type="number"
                step="0.1"
                placeholder="100.0"
                value={priceRange.max}
                onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Min Win Rate */}
            <div>
              <label className="text-sm font-semibold text-gray-400 mb-2 block">Min Win Rate (%)</label>
              <input
                type="number"
                step="5"
                placeholder="0"
                value={minWinRate}
                onChange={(e) => setMinWinRate(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            {loading ? 'Loading...' : `${listings.length} strategies found`}
          </p>
          <a
            href="/marketplace/sell"
            className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            💰 Sell Your Strategy
          </a>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
                <div className="h-6 bg-gray-800 rounded mb-4"></div>
                <div className="h-4 bg-gray-800 rounded mb-2"></div>
                <div className="h-4 bg-gray-800 rounded mb-4 w-2/3"></div>
                <div className="h-20 bg-gray-800 rounded"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">No strategies found</h3>
            <p className="text-gray-400">Try adjusting your filters or be the first to list a strategy!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/50 transition-all cursor-pointer group"
                onClick={() => window.location.href = `/marketplace/${listing.id}`}
              >
                {/* Badges */}
                <div className="flex items-center gap-2 mb-4">
                  {listing.isFeatured && (
                    <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded">
                      ⭐ FEATURED
                    </span>
                  )}
                  {listing.isVerified && (
                    <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                      ✓ VERIFIED
                    </span>
                  )}
                  <span className={`bg-gradient-to-r ${getCategoryColor(listing.category)} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {listing.category.toUpperCase()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {listing.title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {listing.description}
                </p>

                {/* Performance Metrics */}
                <div className="bg-black/50 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="text-green-400 font-semibold">{listing.performance.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Trades:</span>
                    <span className="text-white font-semibold">{listing.performance.totalTrades}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Avg Return:</span>
                    <span className="text-purple-400 font-semibold">{listing.performance.avgReturn.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Period:</span>
                    <span className="text-gray-300">{listing.performance.backtestPeriod}</span>
                  </div>
                </div>

                {/* Rating and Sales */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {getRatingStars(listing.rating)}
                    <span className="text-sm text-gray-400 ml-2">({listing.reviews})</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {listing.sales} sales
                  </div>
                </div>

                {/* Price and Buy Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {formatSOL(listing.price)} SOL
                    </div>
                  </div>
                  <button className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all">
                    Buy Now
                  </button>
                </div>

                {/* Tags */}
                {listing.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {listing.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
