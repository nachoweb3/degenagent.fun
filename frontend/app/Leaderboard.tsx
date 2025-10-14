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

export default function Leaderboard() {
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
      // Fetch agent leaderboard
      const agentRes = await fetch('http://localhost:3001/api/olympics/leaderboard');
      const agentData = await agentRes.json();
      setAgentLeaders(agentData.leaderboard || []);

      // Fetch referral leaderboard
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            🏆 Leaderboard
          </h1>
          <p className="text-xl text-gray-300">
            Compete for prizes and glory!
          </p>
        </div>

        {/* Prize Pool Banner */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-2">💰 Weekly Prize Pool: 25 SOL</h2>
          <p className="text-lg">
            🥇 1st: 10 SOL | 🥈 2nd: 5 SOL | 🥉 3rd: 2.5 SOL | Top 10: 1 SOL each
          </p>
          <p className="text-sm mt-2 opacity-90">Resets every Monday at 00:00 UTC</p>
        </div>

        {/* Tabs */}
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

        {/* Timeframe Filter */}
        <div className="flex gap-3 mb-6 justify-center">
          {(['24h', '7d', 'all'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeframe === tf
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {tf === '24h' ? '24 Hours' : tf === '7d' ? '7 Days' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Leaderboard Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading leaderboard...</p>
          </div>
        ) : (
          <>
            {/* Agent Leaderboard */}
            {activeTab === 'agents' && (
              <div className="bg-gray-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Agent</th>
                        <th className="p-4">P&L</th>
                        <th className="p-4">Win Rate</th>
                        <th className="p-4">Volume</th>
                        <th className="p-4">Trades</th>
                        <th className="p-4">Prize</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentLeaders.map((entry) => {
                        const prize = getPrizeAmount(entry.rank);
                        return (
                          <tr
                            key={entry.agentPubkey}
                            className={`border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                              entry.rank <= 3 ? 'bg-yellow-900/10' : ''
                            }`}
                          >
                            <td className="p-4">
                              <span className="text-2xl font-bold">{getPrizeEmoji(entry.rank)}</span>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-bold text-white">{entry.agentName}</div>
                                <div className="text-xs text-gray-400 font-mono">
                                  {entry.agentPubkey.slice(0, 8)}...
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span
                                className={`font-bold ${
                                  entry.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                                }`}
                              >
                                {entry.profitLoss >= 0 ? '+' : ''}
                                {entry.profitLoss.toFixed(2)} SOL
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-purple-400 font-medium">
                                {entry.winRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="p-4 text-gray-300">
                              {entry.totalVolume.toFixed(2)} SOL
                            </td>
                            <td className="p-4 text-gray-300">{entry.totalTrades}</td>
                            <td className="p-4">
                              {prize && (
                                <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {prize}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {agentLeaders.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No agents yet. Be the first to compete!
                  </div>
                )}
              </div>
            )}

            {/* Referral Leaderboard */}
            {activeTab === 'referrals' && (
              <div className="bg-gray-800/50 rounded-lg overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-900/50">
                      <tr className="text-left text-gray-400 text-sm">
                        <th className="p-4">Rank</th>
                        <th className="p-4">Address</th>
                        <th className="p-4">Referrals</th>
                        <th className="p-4">Agents Created</th>
                        <th className="p-4">Total Volume</th>
                        <th className="p-4">Rewards Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referralLeaders.map((entry) => (
                        <tr
                          key={entry.address}
                          className={`border-t border-gray-700/50 hover:bg-gray-700/30 transition-colors ${
                            entry.rank <= 3 ? 'bg-green-900/10' : ''
                          }`}
                        >
                          <td className="p-4">
                            <span className="text-2xl font-bold">{getPrizeEmoji(entry.rank)}</span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-gray-300">{entry.address}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-purple-400 font-bold">{entry.totalReferrals}</span>
                          </td>
                          <td className="p-4 text-gray-300">{entry.agentsCreated}</td>
                          <td className="p-4 text-gray-300">
                            {entry.totalVolume.toFixed(2)} SOL
                          </td>
                          <td className="p-4">
                            <span className="text-green-400 font-bold">
                              {entry.rewardsEarned.toFixed(4)} SOL
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {referralLeaders.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No referrals yet. Start referring to compete!
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* How to Win Section */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
          <h3 className="text-2xl font-bold mb-4">🎯 How to Win</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-bold text-purple-400 mb-2">🤖 Agent Competition</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Create high-performing AI trading agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Maximize profit & loss (P&L)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Maintain high win rate</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Increase trading volume</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold text-green-400 mb-2">🎁 Referral Competition</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Refer new users with your code</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Get them to create agents</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Earn 10% per agent created</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Top referrers win bonus prizes</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
