'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface StrategyListing {
  id: string;
  strategyId: string;
  sellerId: string;
  title: string;
  description: string;
  price: string;
  category: string;
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

export default function StrategyDetailPage() {
  const params = useParams();
  const { publicKey } = useWallet();
  const [listing, setListing] = useState<StrategyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');

  useEffect(() => {
    if (params.id) {
      fetchListing();
    }
  }, [params.id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/marketplace/${params.id}`);

      if (response.data.success) {
        setListing(response.data.listing);
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setPurchasing(true);

      const response = await axios.post(`${BACKEND_API}/marketplace/purchase`, {
        listingId: params.id,
        buyerId: publicKey.toString(),
      });

      if (response.data.success) {
        alert(`✅ Strategy purchased successfully!\n\nTransaction: ${response.data.txSignature}`);
        // Redirect to agent page or strategy editor
        window.location.href = '/';
      }
    } catch (error: any) {
      console.error('Error purchasing strategy:', error);
      alert(`Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setPurchasing(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-800 rounded w-1/2"></div>
            <div className="h-64 bg-gray-800 rounded"></div>
            <div className="h-32 bg-gray-800 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-5xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold mb-2">Strategy Not Found</h2>
          <p className="text-gray-400 mb-8">The strategy you're looking for doesn't exist.</p>
          <a href="/marketplace" className="text-purple-400 hover:text-purple-300">
            ← Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <a href="/marketplace" className="text-purple-400 hover:text-purple-300 mb-6 inline-block">
          ← Back to Marketplace
        </a>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {listing.isFeatured && (
                  <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded">
                    ⭐ FEATURED
                  </span>
                )}
                {listing.isVerified && (
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded">
                    ✓ VERIFIED
                  </span>
                )}
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded">
                  {listing.category.toUpperCase()}
                </span>
              </div>

              <h1 className="text-4xl font-bold mb-4">{listing.title}</h1>

              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  {getRatingStars(listing.rating)}
                  <span className="ml-2">({listing.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>{listing.sales} sales</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-800">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 font-semibold transition-colors ${
                    activeTab === 'overview'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 font-semibold transition-colors ${
                    activeTab === 'reviews'
                      ? 'text-purple-400 border-b-2 border-purple-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Reviews ({listing.reviews})
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' ? (
              <div className="space-y-6">
                {/* Description */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{listing.description}</p>
                </div>

                {/* Performance Metrics */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Performance Metrics</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                      <div className="text-3xl font-bold text-green-400">
                        {listing.performance.winRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Total Trades</div>
                      <div className="text-3xl font-bold text-white">
                        {listing.performance.totalTrades}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Average Return</div>
                      <div className="text-3xl font-bold text-purple-400">
                        {listing.performance.avgReturn.toFixed(2)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm mb-1">Backtest Period</div>
                      <div className="text-3xl font-bold text-blue-400">
                        {listing.performance.backtestPeriod}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {listing.tags.length > 0 && (
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-xl font-semibold mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {listing.tags.map((tag, idx) => (
                        <span key={idx} className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">💬</div>
                  <p className="text-gray-400">Reviews coming soon!</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Purchase Card */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-gray-400 text-sm mb-2">Price</div>
                <div className="text-4xl font-bold text-purple-400">
                  {parseFloat(listing.price).toFixed(4)} SOL
                </div>
              </div>

              {publicKey ? (
                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? 'Processing...' : '💰 Buy Now'}
                </button>
              ) : (
                <div className="w-full">
                  <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 !py-4 !rounded-lg !font-bold !text-lg" />
                </div>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>✓</span>
                  <span>Instant delivery</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>✓</span>
                  <span>Full strategy code access</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <span>✓</span>
                  <span>Free updates</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-800">
                <div className="text-gray-400 text-sm mb-2">Seller</div>
                <div className="font-mono text-xs bg-gray-800 p-2 rounded truncate">
                  {listing.sellerId}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
