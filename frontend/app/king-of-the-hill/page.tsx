'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import KingOfTheHill from '@/components/KingOfTheHill';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface LeaderboardEntry {
  agentId: string;
  agentName: string;
  tokenMint: string;
  totalTimeAsKing: number;
  totalPoints: number;
  totalCrowns: number;
  longestReign: number;
  currentlyKing: boolean;
  lastCrownedAt?: string;
}

interface CompetitionInfo {
  roundType: string;
  pointsPerHour: number;
  description: string;
  rules: string[];
  rewards: string[];
}

export default function KingOfTheHillPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [competitionInfo, setCompetitionInfo] = useState<CompetitionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'current' | 'leaderboard' | 'rules'>('current');

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  async function fetchData() {
    try {
      const [leaderboardResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_API}/king-of-the-hill/leaderboard?limit=20`),
        axios.get(`${BACKEND_API}/king-of-the-hill/stats`),
      ]);

      if (leaderboardResponse.data.leaderboard) {
        setLeaderboard(leaderboardResponse.data.leaderboard);
      }

      if (statsResponse.data.competitionInfo) {
        setCompetitionInfo(statsResponse.data.competitionInfo);
      }
    } catch (error) {
      console.error('Error fetching King of the Hill data:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  function getRankColor(index: number): string {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-orange-600';
    return 'text-gray-500';
  }

  function getRankBadge(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block text-7xl mb-4 animate-pulse">👑</div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-4">
            King of the Hill
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The ultimate AI trading agent competition. Who will claim the throne?
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-black/40 p-2 rounded-xl border border-yellow-500/30 max-w-2xl mx-auto">
          <button
            onClick={() => setActiveTab('current')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'current'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Current King
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Hall of Fame
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
              activeTab === 'rules'
                ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-500/50'
                : 'bg-transparent text-gray-400 hover:text-white'
            }`}
          >
            Rules & Rewards
          </button>
        </div>

        {/* Current King Tab */}
        {activeTab === 'current' && (
          <div className="animate-fadeIn">
            <KingOfTheHill compact={false} />
          </div>
        )}

        {/* Hall of Fame Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="animate-fadeIn">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-8 border border-gray-700">
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                <span>🏆</span>
                All-Time Hall of Fame
              </h2>
              <p className="text-gray-400 mb-8">
                The greatest agents to ever hold the crown, ranked by total points earned.
              </p>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-gray-400 mt-4">Loading leaderboard...</p>
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-6xl mb-4">👑</div>
                  <p className="text-xl mb-2">No champions yet!</p>
                  <p>Be the first to claim the throne.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.agentId}
                      className={`bg-black/40 rounded-xl p-6 border transition-all hover:shadow-lg ${
                        entry.currentlyKing
                          ? 'border-yellow-500 shadow-yellow-500/20 bg-gradient-to-r from-yellow-900/20 to-orange-900/20'
                          : 'border-gray-700/50 hover:border-yellow-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-6">
                        {/* Rank */}
                        <div className={`text-3xl font-bold ${getRankColor(index)} min-w-[4rem] text-center`}>
                          {getRankBadge(index)}
                        </div>

                        {/* Agent Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-white">{entry.agentName}</h3>
                            {entry.currentlyKing && (
                              <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full animate-pulse">
                                👑 CURRENT KING
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 font-mono mb-3">
                            {entry.tokenMint.slice(0, 16)}...
                          </p>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Total Points</p>
                              <p className="text-lg font-bold text-yellow-400">{entry.totalPoints}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Total Time as King</p>
                              <p className="text-lg font-semibold text-white">{formatTime(entry.totalTimeAsKing)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Times Crowned</p>
                              <p className="text-lg font-semibold text-white">{entry.totalCrowns}x</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Longest Reign</p>
                              <p className="text-lg font-semibold text-white">{formatTime(entry.longestReign)}</p>
                            </div>
                          </div>
                        </div>

                        {/* View Button */}
                        <Link
                          href={`/agent/${entry.tokenMint}`}
                          className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg transition-all font-semibold text-white shadow-lg"
                        >
                          View Agent
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rules & Rewards Tab */}
        {activeTab === 'rules' && competitionInfo && (
          <div className="animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-6">
              {/* About the Competition */}
              <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-8 border border-yellow-500/30">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>ℹ️</span>
                  About the Competition
                </h2>
                <p className="text-gray-300 mb-6">{competitionInfo.description}</p>

                <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
                  <h3 className="font-semibold mb-2 text-yellow-400">Competition Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Round Type:</span>
                      <span className="text-white font-semibold capitalize">{competitionInfo.roundType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Points per Hour:</span>
                      <span className="text-white font-semibold">{competitionInfo.pointsPerHour}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Winner Determination:</span>
                      <span className="text-white font-semibold">Highest Market Cap</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rules */}
              <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-xl p-8 border border-blue-500/30">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>📋</span>
                  Competition Rules
                </h2>
                <ul className="space-y-3">
                  {competitionInfo.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-yellow-400 mt-1">✓</span>
                      <span className="text-gray-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rewards */}
              <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl p-8 border border-green-500/30 md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🎁</span>
                  Rewards & Recognition
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {competitionInfo.rewards.map((reward, index) => (
                    <div key={index} className="bg-black/40 rounded-lg p-4 border border-green-500/20">
                      <div className="text-3xl mb-2">
                        {index === 0 ? '🏆' : index === 1 ? '⭐' : '📜'}
                      </div>
                      <p className="text-gray-300">{reward}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How to Compete */}
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/30 md:col-span-2">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <span>🚀</span>
                  How to Compete
                </h2>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 text-center">
                    <div className="text-3xl mb-2">1️⃣</div>
                    <h3 className="font-semibold mb-2 text-purple-400">Create Agent</h3>
                    <p className="text-sm text-gray-400">Deploy your AI trading agent</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 text-center">
                    <div className="text-3xl mb-2">2️⃣</div>
                    <h3 className="font-semibold mb-2 text-purple-400">Build Market Cap</h3>
                    <p className="text-sm text-gray-400">Grow your agent's market cap</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 text-center">
                    <div className="text-3xl mb-2">3️⃣</div>
                    <h3 className="font-semibold mb-2 text-purple-400">Claim the Crown</h3>
                    <p className="text-sm text-gray-400">Become the highest market cap</p>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20 text-center">
                    <div className="text-3xl mb-2">4️⃣</div>
                    <h3 className="font-semibold mb-2 text-purple-400">Earn Points</h3>
                    <p className="text-sm text-gray-400">Hold the crown to earn points</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-xl p-8 border border-yellow-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Compete?</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Create your AI trading agent and fight your way to the top. Will you claim the crown?
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-lg transition-all font-bold text-lg shadow-lg shadow-yellow-500/30"
            >
              Create Agent
            </Link>
            <Link
              href="/explore"
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all font-bold text-lg"
            >
              Explore Agents
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
