'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface Agent {
  id: string;
  name: string;
  purpose: string;
  tokenMint: string;
  totalTrades: number;
  successfulTrades: number;
  totalProfit: string;
  createdAt: string;
}

interface BondingCurveStats {
  currentPrice: number;
  tokensSold: number;
  progress: number;
  totalValueLocked: number;
}

export default function Home() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bondingCurves, setBondingCurves] = useState<Record<string, BondingCurveStats>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'new' | 'graduating'>('trending');

  useEffect(() => {
    fetchAgents();
  }, [filter]);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/agent/all`);
      const agentList = response.data.agents || [];
      setAgents(agentList);

      // Fetch bonding curve data for each agent
      const curves: Record<string, BondingCurveStats> = {};
      for (const agent of agentList.slice(0, 12)) {
        try {
          const bcResponse = await axios.get(`${BACKEND_API}/bonding-curve/${agent.id}`);
          if (bcResponse.data.success) {
            curves[agent.id] = bcResponse.data.bondingCurve.stats;
          }
        } catch (error) {
          // Silent fail for bonding curve
        }
      }
      setBondingCurves(curves);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => {
    if (amount === 0) return '0';
    if (amount < 0.001) return amount.toExponential(2);
    return amount.toFixed(6);
  };

  const getWinRate = (agent: Agent) => {
    if (agent.totalTrades === 0) return 0;
    return ((agent.successfulTrades / agent.totalTrades) * 100).toFixed(0);
  };

  const sortedAgents = [...agents].sort((a, b) => {
    const aCurve = bondingCurves[a.id];
    const bCurve = bondingCurves[b.id];

    if (filter === 'trending') {
      return (bCurve?.totalValueLocked || 0) - (aCurve?.totalValueLocked || 0);
    } else if (filter === 'new') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (bCurve?.progress || 0) - (aCurve?.progress || 0);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500 bg-clip-text text-transparent">
                Trade AI Agent Tokens
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto px-4">
              Discover, buy, and trade tokens of AI trading agents on Solana.
              Every agent has its own bonding curve - get in early!
            </p>
            <div className="flex gap-4 justify-center flex-wrap px-4">
              <Link
                href="/create"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
              >
                🚀 Create Your Agent
              </Link>
              <Link
                href="/leaderboard"
                className="px-8 py-4 bg-gray-800 border-2 border-purple-500 rounded-lg font-bold text-lg hover:bg-gray-700 transition-all"
              >
                🏆 View Leaderboard
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 sm:p-6 border border-purple-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400">{agents.length}</div>
              <div className="text-gray-400 text-xs sm:text-sm">Active Agents</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 sm:p-6 border border-pink-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-pink-400">
                {Object.values(bondingCurves).reduce((sum, bc) => sum + bc.totalValueLocked, 0).toFixed(2)}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Total Volume (SOL)</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 sm:p-6 border border-orange-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                {agents.reduce((sum, a) => sum + a.totalTrades, 0)}
              </div>
              <div className="text-gray-400 text-xs sm:text-sm">Total Trades</div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur rounded-lg p-4 sm:p-6 border border-green-500/20">
              <div className="text-2xl sm:text-3xl font-bold text-green-400">24/7</div>
              <div className="text-gray-400 text-xs sm:text-sm">Trading Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Marketplace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 border-b border-gray-700 overflow-x-auto">
          <button
            onClick={() => setFilter('trending')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              filter === 'trending'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🔥 Trending
          </button>
          <button
            onClick={() => setFilter('new')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              filter === 'new'
                ? 'text-pink-400 border-b-2 border-pink-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            ✨ New
          </button>
          <button
            onClick={() => setFilter('graduating')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              filter === 'graduating'
                ? 'text-green-400 border-b-2 border-green-400'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            🎓 Graduating Soon
          </button>
        </div>

        {/* Token Grid */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading agents...
          </div>
        ) : sortedAgents.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 mb-4">No agents found</p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
            >
              Create the first agent!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAgents.slice(0, 12).map((agent) => {
              const curve = bondingCurves[agent.id];
              return (
                <div
                  key={agent.id}
                  onClick={() => router.push(`/agent/${agent.id}`)}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 transform hover:scale-105"
                >
                  <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-4 border-b border-gray-700">
                    <h3 className="text-lg sm:text-xl font-bold text-white truncate">{agent.name}</h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">{agent.purpose}</p>
                  </div>

                  <div className="p-4">
                    {curve ? (
                      <>
                        <div className="mb-4">
                          <div className="text-gray-400 text-xs mb-1">Current Price</div>
                          <div className="text-xl sm:text-2xl font-bold text-green-400">
                            {formatSOL(curve.currentPrice)} SOL
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Bonding Progress</span>
                            <span>{curve.progress.toFixed(1)}%</span>
                          </div>
                          <div className="bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(curve.progress, 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-gray-900 rounded p-2">
                            <div className="text-gray-500 text-xs">TVL</div>
                            <div className="text-white font-semibold">{curve.totalValueLocked.toFixed(3)} SOL</div>
                          </div>
                          <div className="bg-gray-900 rounded p-2">
                            <div className="text-gray-500 text-xs">Win Rate</div>
                            <div className="text-green-400 font-semibold">{getWinRate(agent)}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-sm">Loading bonding curve...</div>
                    )}
                  </div>

                  <div className="p-4 pt-0">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-2 rounded-lg font-semibold transition-all text-sm sm:text-base">
                      Buy Tokens
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Why Trade AI Agent Tokens?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-purple-500/20">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">Bonding Curve Pricing</h3>
            <p className="text-gray-400">
              Fair price discovery through automated bonding curves. Early buyers get the best prices!
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-pink-500/20">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered Trading</h3>
            <p className="text-gray-400">
              Each agent trades autonomously 24/7. Profit when your agent performs well!
            </p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-orange-500/20">
            <div className="text-4xl mb-4">💎</div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Liquidity</h3>
            <p className="text-gray-400">
              Buy and sell anytime through the bonding curve. No waiting for DEX liquidity!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
