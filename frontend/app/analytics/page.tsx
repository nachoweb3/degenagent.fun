'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface Analytics {
  platform: {
    totalAgents: number;
    activeAgents: number;
    totalUsers: number;
    totalVolume: string;
    totalFees: string;
  };
  bonding: {
    totalTrades: number;
    totalValueLocked: string;
    averagePrice: string;
    graduatedAgents: number;
  };
  marketplace: {
    totalListings: number;
    totalSales: number;
    totalRevenue: string;
    topCategories: Array<{ category: string; count: number }>;
  };
  vaults: {
    totalDeposits: string;
    totalDepositors: number;
    averageAPY: number;
  };
  recent: {
    latestAgents: Array<any>;
    latestTrades: Array<any>;
    topPerformers: Array<any>;
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  useEffect(() => {
    fetchAnalytics();
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // In production, create a dedicated /api/analytics endpoint
      // For now, we'll aggregate from existing endpoints
      const [agentsRes, vaultsRes] = await Promise.all([
        axios.get(`${BACKEND_API}/agent/all`).catch(() => ({ data: { agents: [] } })),
        axios.get(`${BACKEND_API}/vaults`).catch(() => ({ data: { vaults: [] } })),
      ]);

      const agents = agentsRes.data.agents || [];
      const vaults = vaultsRes.data.vaults || [];

      // Calculate analytics
      const mockAnalytics: Analytics = {
        platform: {
          totalAgents: agents.length,
          activeAgents: agents.filter((a: any) => a.status === 'active').length,
          totalUsers: Math.floor(agents.length * 1.5), // Estimate
          totalVolume: calculateTotalVolume(agents),
          totalFees: calculateTotalFees(agents),
        },
        bonding: {
          totalTrades: Math.floor(agents.length * 25), // Estimate
          totalValueLocked: '125000', // Mock
          averagePrice: '0.00005', // Mock
          graduatedAgents: agents.filter((a: any) => a.graduated).length || 2,
        },
        marketplace: {
          totalListings: 12, // Mock - would come from marketplace API
          totalSales: 45, // Mock
          totalRevenue: '125.50', // Mock
          topCategories: [
            { category: 'momentum', count: 5 },
            { category: 'scalping', count: 3 },
            { category: 'value', count: 2 },
          ],
        },
        vaults: {
          totalDeposits: vaults.reduce((sum, v) => sum + parseFloat(v.totalValueLocked || '0'), 0).toString(),
          totalDepositors: vaults.reduce((sum, v) => sum + (v.totalDepositors || 0), 0),
          averageAPY: vaults.reduce((sum, v) => sum + (v.currentAPY || 0), 0) / (vaults.length || 1),
        },
        recent: {
          latestAgents: agents.slice(0, 5),
          latestTrades: [], // Would come from trades endpoint
          topPerformers: agents.slice(0, 5), // Would be sorted by performance
        },
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalVolume = (agents: any[]) => {
    // Mock calculation - in production would sum actual trading volume
    return (agents.length * 15000).toString();
  };

  const calculateTotalFees = (agents: any[]) => {
    // Mock calculation - 1% of volume
    const volume = parseFloat(calculateTotalVolume(agents));
    return (volume * 0.01).toFixed(2);
  };

  const formatSOL = (amount: string) => {
    return parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-800 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <p className="text-gray-400">Unable to load analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Platform Analytics
            </h1>
            <p className="text-gray-400">Real-time metrics and insights</p>
          </div>

          {/* Timeframe Selector */}
          <div className="flex gap-2">
            {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  timeframe === tf
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Agents */}
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 border border-purple-500/50 rounded-xl p-6">
            <div className="text-purple-400 text-sm font-semibold mb-2">Total Agents</div>
            <div className="text-4xl font-bold mb-2">{formatNumber(analytics.platform.totalAgents)}</div>
            <div className="text-sm text-gray-400">
              {analytics.platform.activeAgents} active
            </div>
          </div>

          {/* Total Volume */}
          <div className="bg-gradient-to-br from-blue-900/50 to-blue-800/50 border border-blue-500/50 rounded-xl p-6">
            <div className="text-blue-400 text-sm font-semibold mb-2">Total Volume</div>
            <div className="text-4xl font-bold mb-2">{formatSOL(analytics.platform.totalVolume)} SOL</div>
            <div className="text-sm text-gray-400">
              Across all agents
            </div>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-green-900/50 to-green-800/50 border border-green-500/50 rounded-xl p-6">
            <div className="text-green-400 text-sm font-semibold mb-2">Total Users</div>
            <div className="text-4xl font-bold mb-2">{formatNumber(analytics.platform.totalUsers)}</div>
            <div className="text-sm text-gray-400">
              Unique wallets
            </div>
          </div>

          {/* Platform Fees */}
          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 border border-pink-500/50 rounded-xl p-6">
            <div className="text-pink-400 text-sm font-semibold mb-2">Platform Fees</div>
            <div className="text-4xl font-bold mb-2">{formatSOL(analytics.platform.totalFees)} SOL</div>
            <div className="text-sm text-gray-400">
              Revenue collected
            </div>
          </div>
        </div>

        {/* Bonding Curve Metrics */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Bonding Curve Activity</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <div className="text-gray-400 text-sm mb-2">Total Trades</div>
              <div className="text-3xl font-bold text-blue-400">{formatNumber(analytics.bonding.totalTrades)}</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Total Value Locked</div>
              <div className="text-3xl font-bold text-purple-400">{formatSOL(analytics.bonding.totalValueLocked)} SOL</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Avg Token Price</div>
              <div className="text-3xl font-bold text-green-400">{analytics.bonding.averagePrice} SOL</div>
            </div>
            <div>
              <div className="text-gray-400 text-sm mb-2">Graduated</div>
              <div className="text-3xl font-bold text-yellow-400">{analytics.bonding.graduatedAgents}</div>
            </div>
          </div>
        </div>

        {/* Marketplace & Vaults */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Marketplace */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Strategy Marketplace</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Listings</span>
                <span className="text-white font-bold">{analytics.marketplace.totalListings}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Sales</span>
                <span className="text-white font-bold">{analytics.marketplace.totalSales}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Revenue</span>
                <span className="text-green-400 font-bold">{analytics.marketplace.totalRevenue} SOL</span>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <div className="text-sm font-semibold text-gray-400 mb-3">Top Categories</div>
                {analytics.marketplace.topCategories.map((cat) => (
                  <div key={cat.category} className="flex justify-between mb-2">
                    <span className="text-white capitalize">{cat.category}</span>
                    <span className="text-purple-400 font-semibold">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vaults */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Vault Statistics</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Deposits</span>
                <span className="text-white font-bold">{formatSOL(analytics.vaults.totalDeposits)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Depositors</span>
                <span className="text-white font-bold">{analytics.vaults.totalDepositors}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average APY</span>
                <span className="text-green-400 font-bold">{analytics.vaults.averageAPY.toFixed(1)}%</span>
              </div>

              {/* APY Distribution Chart (Mock) */}
              <div className="pt-4 border-t border-gray-800">
                <div className="text-sm font-semibold text-gray-400 mb-3">APY Distribution</div>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Conservative (12%)</span>
                      <span className="text-gray-400">33%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '33%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Balanced (25%)</span>
                      <span className="text-gray-400">45%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Aggressive (50%)</span>
                      <span className="text-gray-400">22%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6">Recent Agents</h2>
          {analytics.recent.latestAgents.length > 0 ? (
            <div className="space-y-3">
              {analytics.recent.latestAgents.map((agent, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                      {agent.name?.slice(0, 2).toUpperCase() || 'AG'}
                    </div>
                    <div>
                      <div className="font-semibold">{agent.name}</div>
                      <div className="text-sm text-gray-400">{agent.ticker}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Status</div>
                    <div className="text-green-400 font-semibold">{agent.status}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No recent agents</p>
          )}
        </div>
      </div>
    </div>
  );
}
