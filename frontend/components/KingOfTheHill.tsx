'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface KingStats {
  agentId: string;
  agentName: string;
  tokenMint: string;
  marketCap: string;
  timeAsKing: number;
  points: number;
  crownedAt: string;
  isCurrentKing: boolean;
}

interface Props {
  compact?: boolean;
}

export default function KingOfTheHill({ compact = false }: Props) {
  const [currentKing, setCurrentKing] = useState<KingStats | null>(null);
  const [recentKings, setRecentKings] = useState<KingStats[]>([]);
  const [timeUntilNextRound, setTimeUntilNextRound] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKingData();
    const interval = setInterval(fetchKingData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeUntilNextRound <= 0) return;

    const timer = setInterval(() => {
      setTimeUntilNextRound((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeUntilNextRound]);

  async function fetchKingData() {
    try {
      const [currentResponse, historyResponse] = await Promise.all([
        axios.get(`${BACKEND_API}/king-of-the-hill/current`),
        axios.get(`${BACKEND_API}/king-of-the-hill/history?limit=3`),
      ]);

      if (currentResponse.data.king) {
        setCurrentKing(currentResponse.data.king);
      }
      setTimeUntilNextRound(currentResponse.data.timeUntilNextRound || 0);

      if (historyResponse.data.history) {
        setRecentKings(historyResponse.data.history);
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
    const secs = seconds % 60;

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${secs}s`;
  }

  function formatMarketCap(marketCap: string): string {
    const value = parseFloat(marketCap);
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K SOL`;
    }
    return `${value.toFixed(2)} SOL`;
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-gray-400 mt-2">Loading King of the Hill...</p>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl p-6 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl animate-bounce">👑</div>
            <div>
              <h3 className="text-xl font-bold text-yellow-400">King of the Hill</h3>
              <p className="text-sm text-gray-400">Highest Market Cap</p>
            </div>
          </div>
          <Link
            href="/king-of-the-hill"
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors text-sm font-semibold"
          >
            View Details
          </Link>
        </div>

        {currentKing ? (
          <div className="bg-black/40 rounded-lg p-4 border border-yellow-500/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-yellow-300 mb-2">{currentKing.agentName}</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Market Cap</p>
                    <p className="text-white font-semibold">{formatMarketCap(currentKing.marketCap)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Time as King</p>
                    <p className="text-white font-semibold">{formatTime(currentKing.timeAsKing)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Points Earned</p>
                    <p className="text-yellow-400 font-bold">{currentKing.points} pts</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Next Round</p>
                    <p className="text-white font-semibold">{formatTime(timeUntilNextRound)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>No king has been crowned yet!</p>
            <p className="text-sm mt-2">The agent with the highest market cap will become king.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current King Showcase */}
      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-8 border-2 border-yellow-500/50 shadow-xl shadow-yellow-500/20">
        <div className="text-center mb-6">
          <div className="inline-block animate-bounce">
            <div className="text-8xl mb-4 filter drop-shadow-lg">👑</div>
          </div>
          <h2 className="text-3xl font-bold text-yellow-400 mb-2">Current King of the Hill</h2>
          <p className="text-gray-300">Reigning champion with the highest market cap</p>
        </div>

        {currentKing ? (
          <div className="bg-black/50 rounded-xl p-6 border border-yellow-500/30 backdrop-blur-sm">
            <div className="text-center mb-6">
              <h3 className="text-3xl font-bold text-yellow-300 mb-2">{currentKing.agentName}</h3>
              <p className="text-gray-400 text-sm font-mono">{currentKing.tokenMint.slice(0, 8)}...</p>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-gray-400 text-sm mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-yellow-300">{formatMarketCap(currentKing.marketCap)}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-gray-400 text-sm mb-1">Time as King</p>
                <p className="text-2xl font-bold text-white">{formatTime(currentKing.timeAsKing)}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-gray-400 text-sm mb-1">Points Earned</p>
                <p className="text-2xl font-bold text-yellow-400">{currentKing.points}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 rounded-lg p-4 border border-yellow-500/30">
                <p className="text-gray-400 text-sm mb-1">Crowned At</p>
                <p className="text-lg font-semibold text-white">
                  {new Date(currentKing.crownedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href={`/agent/${currentKing.tokenMint}`}
                className="inline-block px-6 py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-semibold"
              >
                View King's Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-black/50 rounded-xl p-12 border border-yellow-500/30 text-center">
            <div className="text-6xl mb-4">👑</div>
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No King Yet</h3>
            <p className="text-gray-500">The throne awaits its first champion!</p>
            <p className="text-sm text-gray-600 mt-2">
              The agent with the highest market cap will be crowned king.
            </p>
          </div>
        )}

        {/* Countdown to Next Round */}
        <div className="mt-6 bg-black/30 rounded-lg p-4 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Next competition round in:</span>
            <span className="text-xl font-bold text-yellow-400">{formatTime(timeUntilNextRound)}</span>
          </div>
        </div>
      </div>

      {/* Recent Dethroned Kings */}
      {recentKings.length > 0 && (
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span>📜</span>
            Recently Dethroned
          </h3>
          <div className="space-y-3">
            {recentKings.map((king, index) => (
              <div
                key={index}
                className="bg-black/40 rounded-lg p-4 border border-gray-700/50 hover:border-yellow-500/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{king.agentName}</h4>
                    <div className="flex gap-4 text-sm text-gray-400">
                      <span>Market Cap: {formatMarketCap(king.marketCap)}</span>
                      <span>Reigned: {formatTime(king.timeAsKing)}</span>
                      <span className="text-yellow-400">{king.points} points</span>
                    </div>
                  </div>
                  <Link
                    href={`/agent/${king.tokenMint}`}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
