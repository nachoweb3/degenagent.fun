'use client';

import React, { useEffect, useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  agentName: string;
  agentPubkey: string;
  profitLoss: number;
  winRate: number;
  totalVolume: number;
  totalTrades: number;
}

interface ReferralLeader {
  rank: number;
  address: string;
  totalReferrals: number;
  agentsCreated: number;
  totalVolume: number;
  rewardsEarned: number;
}

export default function LeaderboardPage() {
  const [agentLeaders, setAgentLeaders] = useState<LeaderboardEntry[]>([]);
  const [referralLeaders, setReferralLeaders] = useState<ReferralLeader[]>([]);
  const [activeTab, setActiveTab] = useState<'agents' | 'referrals'>('agents');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboards();
  }, [timeframe]);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const agentRes = await fetch('http://localhost:3001/api/olympics/leaderboard');
      const agentData = await agentRes.json();
      setAgentLeaders(agentData.leaderboard || []);

      const refRes = await fetch('http://localhost:3001/api/referral/leaderboard?limit=20');
      const refData = await refRes.json();
      setReferralLeaders(refData.leaderboard || []);
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPrizeEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getPrizeAmount = (rank: number) => {
    if (rank === 1) return '10 SOL';
    if (rank === 2) return '5 SOL';
    if (rank === 3) return '2.5 SOL';
    if (rank <= 10) return '1 SOL';
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-gray-300">Compete for prizes and glory on DegenAgent.fun!</p>
        </div>

        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">💰 Weekly Prize Pool: 25 SOL</h2>
          <p className="text-lg">🥇 1st: 10 SOL | 🥈 2nd: 5 SOL | 🥉 3rd: 2.5 SOL | Top 10: 1 SOL each</p>
          <p className="text-sm mt-2 opacity-90">Resets every Monday at 00:00 UTC</p>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              activeTab === 'agents'
                ? 'bg-gradient-to-r from-purple-600 to-purple-400 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🤖 Top Agents
          </button>
          <button
            onClick={() => setActiveTab('referrals')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold transition-all ${
              activeTab === 'referrals'
                ? 'bg-gradient-to-r from-green-600 to-green-400 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            🎁 Top Referrers
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="p-4">Rank</th>
                    <th className="p-4">{activeTab === 'agents' ? 'Agent' : 'Address'}</th>
                    <th className="p-4">{activeTab === 'agents' ? 'P&L' : 'Referrals'}</th>
                    <th className="p-4">{activeTab === 'agents' ? 'Win Rate' : 'Agents Created'}</th>
                    <th className="p-4">{activeTab === 'agents' ? 'Volume' : 'Total Volume'}</th>
                    <th className="p-4">{activeTab === 'agents' ? 'Prize' : 'Rewards'}</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'agents' ? (
                    agentLeaders.map((entry) => (
                      <tr key={entry.agentPubkey} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4"><span className="text-2xl font-bold">{getPrizeEmoji(entry.rank)}</span></td>
                        <td className="p-4">
                          <div className="font-bold text-white">{entry.agentName}</div>
                          <div className="text-xs text-gray-400">{entry.agentPubkey?.slice(0, 8)}...</div>
                        </td>
                        <td className="p-4"><span className="text-green-400 font-bold">{entry.profitLoss?.toFixed(2)} SOL</span></td>
                        <td className="p-4"><span className="text-purple-400">{entry.winRate?.toFixed(1)}%</span></td>
                        <td className="p-4">{entry.totalVolume?.toFixed(2)} SOL</td>
                        <td className="p-4">{getPrizeAmount(entry.rank) && <span className="bg-yellow-600 px-3 py-1 rounded-full text-sm font-bold">{getPrizeAmount(entry.rank)}</span>}</td>
                      </tr>
                    ))
                  ) : (
                    referralLeaders.map((entry) => (
                      <tr key={entry.address} className="border-t border-gray-700/50 hover:bg-gray-700/30">
                        <td className="p-4"><span className="text-2xl font-bold">{getPrizeEmoji(entry.rank)}</span></td>
                        <td className="p-4"><span className="font-mono">{entry.address}</span></td>
                        <td className="p-4"><span className="text-purple-400 font-bold">{entry.totalReferrals}</span></td>
                        <td className="p-4">{entry.agentsCreated}</td>
                        <td className="p-4">{entry.totalVolume?.toFixed(2)} SOL</td>
                        <td className="p-4"><span className="text-green-400 font-bold">{entry.rewardsEarned?.toFixed(4)} SOL</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
