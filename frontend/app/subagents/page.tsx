'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MatrixRain from '@/components/MatrixRain';

interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentName: string;
  purpose: string;
  riskLevel: number;
  totalDecisions: number;
  completedDecisions: number;
  successCount: number;
  failCount: number;
  successRate: string;
  totalProfit: string;
  avgProfit: string;
}

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

export default function SubagentsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    // Refresh every 30 seconds
    const interval = setInterval(fetchLeaderboard, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`${BACKEND_API}/subagent/leaderboard`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.leaderboard);
      } else {
        setError('Failed to load leaderboard');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-500 to-yellow-600'; // Gold
      case 2: return 'from-gray-400 to-gray-500'; // Silver
      case 3: return 'from-orange-600 to-orange-700'; // Bronze
      default: return 'from-gray-700 to-gray-800';
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  return (
    <div className="relative min-h-screen">
      <MatrixRain />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
              Subagent Leaderboard
            </span>
          </h1>
          <p className="text-lg text-gray-400">
            Top performing AI subagent systems ranked by success rate and profit
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm text-gray-400 mb-1">Total Active Agents</p>
            <p className="text-3xl font-bold text-white">{leaderboard.length}</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">📈</div>
            <p className="text-sm text-gray-400 mb-1">Best Success Rate</p>
            <p className="text-3xl font-bold text-green-400">
              {leaderboard[0]?.successRate || '0'}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 rounded-xl p-6">
            <div className="text-3xl mb-2">💰</div>
            <p className="text-sm text-gray-400 mb-1">Highest Profit</p>
            <p className="text-3xl font-bold text-yellow-400">
              +{leaderboard[0]?.totalProfit || '0'}%
            </p>
          </div>
        </div>

        {/* Leaderboard Table */}
        {loading ? (
          <div className="bg-gray-900/50 rounded-xl p-12 border border-gray-800 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-8 text-center">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchLeaderboard}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl p-12 border border-gray-800 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <p className="text-xl text-gray-400 mb-2">No active subagent systems yet</p>
            <p className="text-sm text-gray-500">Create an agent to see it on the leaderboard!</p>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-700">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Agent</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Success Rate</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Total Profit</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Avg Profit</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Decisions</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Risk Level</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.agentId}
                      className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Rank */}
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${getRankColor(entry.rank)} font-bold text-white text-lg`}>
                          {getRankEmoji(entry.rank)}
                        </div>
                      </td>

                      {/* Agent */}
                      <td className="px-6 py-4">
                        <Link
                          href={`/agent/${entry.agentId}`}
                          className="hover:text-purple-400 transition-colors"
                        >
                          <p className="font-bold text-white">{entry.agentName}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{entry.purpose}</p>
                        </Link>
                      </td>

                      {/* Success Rate */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-2xl font-bold text-green-400">
                            {entry.successRate}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {entry.successCount}W / {entry.failCount}L
                          </span>
                        </div>
                      </td>

                      {/* Total Profit */}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-xl font-bold ${parseFloat(entry.totalProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(entry.totalProfit) >= 0 ? '+' : ''}{entry.totalProfit}%
                        </span>
                      </td>

                      {/* Avg Profit */}
                      <td className="px-6 py-4 text-center">
                        <span className={`text-lg font-semibold ${parseFloat(entry.avgProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {parseFloat(entry.avgProfit) >= 0 ? '+' : ''}{entry.avgProfit}%
                        </span>
                      </td>

                      {/* Decisions */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-medium">{entry.completedDecisions}</span>
                        <span className="text-gray-500 text-sm"> / {entry.totalDecisions}</span>
                      </td>

                      {/* Risk Level */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {[...Array(10)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-6 rounded-sm ${
                                i < entry.riskLevel ? 'bg-orange-500' : 'bg-gray-700'
                              }`}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4 p-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.agentId}
                  className="bg-gray-800/50 rounded-xl p-5 border border-gray-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${getRankColor(entry.rank)} font-bold text-white text-lg flex-shrink-0`}>
                      {getRankEmoji(entry.rank)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/agent/${entry.agentId}`}>
                        <h3 className="font-bold text-white truncate">{entry.agentName}</h3>
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-1">{entry.purpose}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Success Rate</p>
                      <p className="text-xl font-bold text-green-400">{entry.successRate}%</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Total Profit</p>
                      <p className={`text-xl font-bold ${parseFloat(entry.totalProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(entry.totalProfit) >= 0 ? '+' : ''}{entry.totalProfit}%
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Avg Profit</p>
                      <p className={`text-lg font-semibold ${parseFloat(entry.avgProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(entry.avgProfit) >= 0 ? '+' : ''}{entry.avgProfit}%
                      </p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Decisions</p>
                      <p className="text-lg font-semibold text-white">{entry.completedDecisions}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="text-3xl">💡</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-blue-400 mb-2">About Subagent Performance</h3>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">
                Each agent uses a 3-subagent AI system that learns from past trades. The leaderboard ranks agents by their subagents' ability to:
              </p>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• <span className="text-purple-400">Market Analyzer</span> - Find profitable opportunities</li>
                <li>• <span className="text-yellow-400">Risk Manager</span> - Approve only safe trades</li>
                <li>• <span className="text-green-400">Execution Optimizer</span> - Maximize profit on execution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
