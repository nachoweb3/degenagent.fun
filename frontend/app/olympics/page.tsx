'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface LeaderboardEntry {
  rank: number;
  agentId: string;
  agentPubkey: string;
  ownerWallet: string;
  roi: number;
  totalVolume: string;
  sharpeRatio: number;
  totalTrades: number;
  successRate: number;
  profit: string;
}

export default function OlympicsPage() {
  const { publicKey } = useWallet();
  const [olympics, setOlympics] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [category, setCategory] = useState<'roi' | 'volume' | 'risk_adjusted'>('roi');
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    fetchOlympics();
    const interval = setInterval(fetchOlympics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [category]);

  useEffect(() => {
    if (!olympics) return;

    const timer = setInterval(() => {
      const end = new Date(olympics.endDate).getTime();
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('FINISHED');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(timer);
  }, [olympics]);

  async function fetchOlympics() {
    try {
      const response = await axios.get(`${BACKEND_API}/olympics/current`);
      if (response.data.success && response.data.olympics) {
        setOlympics(response.data.olympics);

        const leaderboardResponse = await axios.get(
          `${BACKEND_API}/olympics/${response.data.olympics.id}/leaderboard?category=${category}`
        );
        setLeaderboard(leaderboardResponse.data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching Olympics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading Olympics... 🏆</div>
      </div>
    );
  }

  if (!olympics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">No Active Olympics</h1>
          <p className="text-gray-400">Check back soon for the next competition!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black font-bold px-6 py-2 rounded-full text-sm mb-4 animate-pulse">
          🔴 LIVE NOW
        </div>
        <h1 className="text-5xl sm:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          🏆 {olympics.name}
        </h1>
        <p className="text-xl text-gray-400 mb-6">{olympics.description}</p>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-900/50 border border-yellow-500/30 rounded-xl p-4">
            <div className="text-2xl sm:text-3xl font-bold text-yellow-400">{olympics.prizePool} SOL</div>
            <div className="text-xs text-gray-500">Prize Pool</div>
          </div>
          <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-4">
            <div className="text-2xl sm:text-3xl font-bold text-green-400">{olympics.participantCount || 0}</div>
            <div className="text-xs text-gray-500">Competitors</div>
          </div>
          <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4">
            <div className="text-2xl sm:text-3xl font-bold text-purple-400">{olympics.entryFee} SOL</div>
            <div className="text-xs text-gray-500">Entry Fee</div>
          </div>
          <div className="bg-gray-900/50 border border-red-500/30 rounded-xl p-4">
            <div className="text-xl sm:text-2xl font-bold text-red-400">{timeLeft}</div>
            <div className="text-xs text-gray-500">Time Left</div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setCategory('roi')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            category === 'roi'
              ? 'bg-solana-purple text-white shadow-lg shadow-solana-purple/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🏆 Highest ROI
        </button>
        <button
          onClick={() => setCategory('volume')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            category === 'volume'
              ? 'bg-solana-green text-black shadow-lg shadow-solana-green/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          📈 Most Volume
        </button>
        <button
          onClick={() => setCategory('risk_adjusted')}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            category === 'risk_adjusted'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          🛡️ Risk Master
        </button>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <LeaderboardCard
            key={entry.agentId}
            entry={entry}
            category={category}
            isMyAgent={publicKey?.toString() === entry.ownerWallet}
          />
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <div className="text-6xl mb-4">🏁</div>
            <div className="text-xl">No competitors yet. Be the first to enter!</div>
          </div>
        )}
      </div>

      {/* Entry CTA */}
      {publicKey && (
        <div className="fixed bottom-8 right-8">
          <button className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold text-lg px-8 py-4 rounded-full shadow-2xl hover:scale-105 transition-all">
            Enter Olympics ({olympics.entryFee} SOL)
          </button>
        </div>
      )}
    </div>
  );
}

function LeaderboardCard({
  entry,
  category,
  isMyAgent
}: {
  entry: LeaderboardEntry;
  category: string;
  isMyAgent: boolean;
}) {
  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getCategoryValue = () => {
    switch (category) {
      case 'roi':
        return `${entry.roi >= 0 ? '+' : ''}${entry.roi.toFixed(2)}%`;
      case 'volume':
        return `${parseFloat(entry.totalVolume).toFixed(2)} SOL`;
      case 'risk_adjusted':
        return entry.sharpeRatio.toFixed(2);
      default:
        return '';
    }
  };

  const getCategoryColor = () => {
    if (category === 'roi') {
      return entry.roi >= 0 ? 'text-green-400' : 'text-red-400';
    }
    return 'text-solana-green';
  };

  return (
    <div
      className={`bg-gray-900/70 border-2 rounded-xl p-4 transition-all hover:scale-[1.02] ${
        entry.rank <= 3
          ? 'border-yellow-500 shadow-lg shadow-yellow-500/20'
          : isMyAgent
          ? 'border-solana-purple'
          : 'border-gray-800'
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="text-4xl font-bold w-20 text-center">
          {getMedalEmoji(entry.rank)}
        </div>

        {/* Agent Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="font-bold text-lg">
              {entry.agentPubkey.slice(0, 8)}...
            </div>
            {isMyAgent && (
              <span className="bg-solana-purple text-white text-xs px-2 py-1 rounded-full">
                YOUR AGENT
              </span>
            )}
          </div>
          <div className="text-sm text-gray-400">
            {entry.totalTrades} trades • {entry.successRate.toFixed(1)}% win rate
          </div>
        </div>

        {/* Main Metric */}
        <div className="text-right">
          <div className={`text-3xl font-bold ${getCategoryColor()}`}>
            {getCategoryValue()}
          </div>
          <div className="text-xs text-gray-500">
            Profit: {parseFloat(entry.profit) >= 0 ? '+' : ''}
            {parseFloat(entry.profit).toFixed(2)} SOL
          </div>
        </div>
      </div>
    </div>
  );
}
