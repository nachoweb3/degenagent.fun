'use client';

import { useState } from 'react';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export default function SellStrategyPage() {
  const { publicKey } = useWallet();
  const [formData, setFormData] = useState({
    strategyId: '',
    title: '',
    description: '',
    price: '',
    category: 'custom',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const categories = [
    { id: 'momentum', name: 'Momentum', description: 'Trend-following strategies' },
    { id: 'scalping', name: 'Scalping', description: 'Quick in-and-out trades' },
    { id: 'value', name: 'Value', description: 'Undervalued asset strategies' },
    { id: 'arbitrage', name: 'Arbitrage', description: 'Price difference exploitation' },
    { id: 'custom', name: 'Custom', description: 'Unique trading approach' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.strategyId || !formData.title || !formData.price) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      const tagsArray = formData.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const response = await axios.post(`${BACKEND_API}/marketplace/list`, {
        strategyId: formData.strategyId,
        sellerId: publicKey.toString(),
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        tags: tagsArray,
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/marketplace';
        }, 2000);
      }
    } catch (error: any) {
      console.error('Error listing strategy:', error);
      setError(error.response?.data?.error || 'Failed to list strategy');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-3xl mx-auto text-center py-20">
          <div className="text-6xl mb-6">✅</div>
          <h2 className="text-3xl font-bold mb-4">Strategy Listed Successfully!</h2>
          <p className="text-gray-400 mb-8">Your strategy is now live on the marketplace.</p>
          <p className="text-sm text-gray-500">Redirecting to marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/marketplace" className="text-purple-400 hover:text-purple-300 mb-6 inline-block">
            ← Back to Marketplace
          </a>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Sell Your Strategy
          </h1>
          <p className="text-gray-400">
            List your proven trading strategy and earn SOL from every sale
          </p>
        </div>

        {/* Wallet Connection */}
        {!publicKey && (
          <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Wallet Not Connected</h3>
                <p className="text-sm text-gray-400">Please connect your wallet to list a strategy</p>
              </div>
              <WalletMultiButton />
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Strategy ID */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-2">
              Strategy ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="strategyId"
              value={formData.strategyId}
              onChange={handleChange}
              placeholder="Enter your strategy ID from your agent"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              disabled={!publicKey}
            />
            <p className="text-sm text-gray-500 mt-2">
              You can find this in your agent's strategy settings
            </p>
          </div>

          {/* Title */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-2">
              Strategy Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Momentum Scalper Pro"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              disabled={!publicKey}
            />
          </div>

          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your strategy, what makes it unique, and what results buyers can expect..."
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500 resize-none"
              disabled={!publicKey}
            />
          </div>

          {/* Category */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-4">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.id })}
                  disabled={!publicKey}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    formData.category === cat.id
                      ? 'bg-purple-600 border-purple-500'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold mb-1">{cat.name}</div>
                  <div className="text-sm text-gray-400">{cat.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-2">
              Price (SOL) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.1"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.0"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 pr-16 focus:outline-none focus:border-purple-500"
                disabled={!publicKey}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                SOL
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Platform fee: 10% • You'll receive {formData.price ? (parseFloat(formData.price) * 0.9).toFixed(2) : '0.00'} SOL per sale
            </p>
          </div>

          {/* Tags */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <label className="block text-sm font-semibold mb-2">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="solana, defi, scalping (comma-separated)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-purple-500"
              disabled={!publicKey}
            />
            <p className="text-sm text-gray-500 mt-2">
              Add relevant tags to help buyers find your strategy
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">⚠️</span>
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!publicKey || loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-4 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Listing Strategy...' : '💰 List Strategy on Marketplace'}
          </button>
        </form>

        {/* Benefits Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Why Sell on Agent.fun?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-3">💎</div>
              <h4 className="font-semibold mb-2">Passive Income</h4>
              <p className="text-sm text-gray-400">Earn SOL every time someone purchases your strategy</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🚀</div>
              <h4 className="font-semibold mb-2">Instant Delivery</h4>
              <p className="text-sm text-gray-400">Automated system handles everything for you</p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⭐</div>
              <h4 className="font-semibold mb-2">Build Reputation</h4>
              <p className="text-sm text-gray-400">Get verified and featured as a top seller</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
