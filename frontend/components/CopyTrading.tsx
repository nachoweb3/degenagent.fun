'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';
import Link from 'next/link';
import AgentAvatar from './AgentAvatar';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface TopTrader {
  agentId: string;
  agentName: string;
  owner: string;
  totalProfit: number;
  winRate: number;
  totalTrades: number;
  followers: number;
  avgReturn: number;
  isFollowing?: boolean;
}

export default function CopyTrading() {
  const { publicKey } = useWallet();
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [copying, setCopying] = useState<string | null>(null);

  useEffect(() => {
    fetchTopTraders();
  }, [publicKey]);

  const fetchTopTraders = async () => {
    try {
      setLoading(true);
      // Mock data - in production would fetch from backend
      const mockTraders: TopTrader[] = [
        {
          agentId: '1',
          agentName: 'Diamond Hands AI',
          owner: 'trader1',
          totalProfit: 145.67,
          winRate: 78,
          totalTrades: 234,
          followers: 1247,
          avgReturn: 12.5,
          isFollowing: false,
        },
        {
          agentId: '2',
          agentName: 'Momentum Master',
          owner: 'trader2',
          totalProfit: 98.34,
          winRate: 72,
          totalTrades: 156,
          followers: 856,
          avgReturn: 8.9,
          isFollowing: false,
        },
        {
          agentId: '3',
          agentName: 'Volatility Crusher',
          owner: 'trader3',
          totalProfit: 87.21,
          winRate: 81,
          totalTrades: 189,
          followers: 634,
          avgReturn: 15.2,
          isFollowing: true,
        },
      ];
      setTopTraders(mockTraders);
    } catch (error) {
      console.error('Error fetching top traders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTrade = async (agentId: string) => {
    if (!publicKey) {
      alert('Please connect your wallet first!');
      return;
    }

    setCopying(agentId);
    try {
      // In production: POST /api/copy-trading/follow
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay

      alert(`✅ Now copying trades from this agent! You'll automatically mirror their trades.`);

      // Update UI
      setTopTraders((prev) =>
        prev.map((t) =>
          t.agentId === agentId
            ? { ...t, isFollowing: !t.isFollowing, followers: t.followers + (t.isFollowing ? -1 : 1) }
            : t
        )
      );
    } catch (error: any) {
      alert('❌ Failed to start copy trading: ' + error.message);
    } finally {
      setCopying(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading top traders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-6 border border-purple-500/50">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🔥 Copy Top Traders</h2>
            <p className="text-gray-300">
              Automatically copy trades from the most profitable agents
            </p>
          </div>
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400">+247%</div>
            <div className="text-xs text-gray-400">Avg. copier return</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-400">12,456</div>
            <div className="text-sm text-gray-400">Active Copiers</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-pink-400">$2.4M</div>
            <div className="text-sm text-gray-400">Total Copied</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-400">89%</div>
            <div className="text-sm text-gray-400">Success Rate</div>
          </div>
          <div className="bg-black/30 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-400">0%</div>
            <div className="text-sm text-gray-400">Platform Fee</div>
          </div>
        </div>
      </div>

      {/* Top Traders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topTraders.map((trader, index) => (
          <div
            key={trader.agentId}
            className="bg-gray-800 rounded-xl border border-gray-700 hover:border-purple-500 transition overflow-hidden"
          >
            {/* Rank Badge */}
            <div className="relative">
              <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                #{index + 1}
              </div>

              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AgentAvatar name={trader.agentName} size="lg" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white">{trader.agentName}</h3>
                    <p className="text-sm text-gray-400">{trader.followers} followers</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Profit</div>
                    <div className="text-lg font-bold text-green-400">
                      +{trader.totalProfit} SOL
                    </div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Win Rate</div>
                    <div className="text-lg font-bold text-purple-400">{trader.winRate}%</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Trades</div>
                    <div className="text-lg font-bold text-white">{trader.totalTrades}</div>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Avg Return</div>
                    <div className="text-lg font-bold text-orange-400">+{trader.avgReturn}%</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {publicKey ? (
                    <>
                      <button
                        onClick={() => handleCopyTrade(trader.agentId)}
                        disabled={copying === trader.agentId}
                        className={`flex-1 py-3 rounded-lg font-bold transition ${
                          trader.isFollowing
                            ? 'bg-gray-700 hover:bg-gray-600 text-white'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white'
                        }`}
                      >
                        {copying === trader.agentId ? (
                          <span>Processing...</span>
                        ) : trader.isFollowing ? (
                          <span>✓ Following</span>
                        ) : (
                          <span>📋 Copy Trades</span>
                        )}
                      </button>
                      <Link
                        href={`/agent/${trader.agentId}`}
                        className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                      >
                        👁️
                      </Link>
                    </>
                  ) : (
                    <div className="w-full">
                      <WalletMultiButton />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-2xl font-bold text-white mb-4">📚 How Copy Trading Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-4xl">1️⃣</div>
            <h4 className="font-bold text-white">Choose a Trader</h4>
            <p className="text-sm text-gray-400">
              Browse top-performing agents and select one to copy
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">2️⃣</div>
            <h4 className="font-bold text-white">Set Your Budget</h4>
            <p className="text-sm text-gray-400">
              Decide how much SOL to allocate to copy trades
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">3️⃣</div>
            <h4 className="font-bold text-white">Earn Passively</h4>
            <p className="text-sm text-gray-400">
              Your trades mirror theirs automatically - no work needed!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
