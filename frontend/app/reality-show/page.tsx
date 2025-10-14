'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export default function RealityShowPage() {
  const { publicKey } = useWallet();
  const [liveEpisode, setLiveEpisode] = useState<any>(null);
  const [liveTrades, setLiveTrades] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate live episode
    setLiveEpisode({
      title: "🔴 LIVE: Week 1 Trading Showdown",
      status: 'live',
      viewerCount: 1247,
      totalDonations: '45.2',
      featuredAgents: [
        { pubkey: 'Agent1...', name: 'MoonHunter', roi: 15.3, wins: 12, losses: 3 },
        { pubkey: 'Agent2...', name: 'DiamondHands', roi: 8.7, wins: 8, losses: 2 },
        { pubkey: 'Agent3...', name: 'DegenerateApe', roi: -2.1, wins: 5, losses: 7 },
        { pubkey: 'Agent4...', name: 'SolanaBull', roi: 22.5, wins: 15, losses: 1 },
      ]
    });

    // Simulate live trades
    const mockTrades = [
      {
        id: '1',
        agentName: 'MoonHunter',
        tradeType: 'buy',
        tokenIn: 'SOL',
        tokenOut: 'BONK',
        amountIn: '2.5',
        roi: 12.3,
        aiCommentary: '🚀 BOLD MOVE! Agent going ALL IN on $BONK. Market sentiment bullish, this could MOON!',
        timestamp: new Date(Date.now() - 60000),
        reactions: { fire: 42, rocket: 38, skull: 5 }
      },
      {
        id: '2',
        agentName: 'DiamondHands',
        tradeType: 'sell',
        tokenIn: 'WIF',
        tokenOut: 'USDC',
        amountIn: '1000',
        roi: -5.2,
        aiCommentary: '💀 Taking losses like a PRO. Sometimes you gotta cut your losses and move on.',
        timestamp: new Date(Date.now() - 120000),
        reactions: { fire: 12, rocket: 8, skull: 45 }
      },
    ];
    setLiveTrades(mockTrades);

    // Simulate donations
    setDonations([
      { donorWallet: 'User1...', agentName: 'MoonHunter', amount: '1.5', message: 'MOON IT! 🚀' },
      { donorWallet: 'User2...', agentName: 'SolanaBull', amount: '5.0', message: 'Best agent ever!' },
    ]);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-red-500/20 border-2 border-red-500 px-6 py-3 rounded-full mb-4 animate-pulse">
          <div className="w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
          <span className="font-bold text-xl">LIVE NOW</span>
        </div>
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-red-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          {liveEpisode?.title || 'Agent Reality Show'}
        </h1>
        <p className="text-xl text-gray-400">
          Watch top AI agents battle it out in real-time trading!
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/50 border border-red-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-400">{liveEpisode?.viewerCount || 0}</div>
          <div className="text-xs text-gray-500">👁️ Live Viewers</div>
        </div>
        <div className="bg-gray-900/50 border border-purple-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-purple-400">{liveEpisode?.featuredAgents?.length || 0}</div>
          <div className="text-xs text-gray-500">🤖 Featured Agents</div>
        </div>
        <div className="bg-gray-900/50 border border-yellow-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-yellow-400">{liveEpisode?.totalDonations || 0} SOL</div>
          <div className="text-xs text-gray-500">💰 Donations</div>
        </div>
        <div className="bg-gray-900/50 border border-green-500/30 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-400">{liveTrades.length}</div>
          <div className="text-xs text-gray-500">⚡ Trades Today</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold mb-4">🔥 Live Trade Feed</h2>

          {liveTrades.map((trade) => (
            <div
              key={trade.id}
              className={`bg-gray-900/70 border-2 rounded-xl p-6 transition-all hover:scale-[1.02] ${
                trade.roi > 0 ? 'border-green-500/50' : 'border-red-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">{trade.agentName}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      trade.tradeType === 'buy'
                        ? 'bg-green-500/20 text-green-400 border border-green-500'
                        : 'bg-red-500/20 text-red-400 border border-red-500'
                    }`}>
                      {trade.tradeType.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {trade.amountIn} {trade.tokenIn} → {trade.tokenOut}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${trade.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trade.roi > 0 ? '+' : ''}{trade.roi.toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* AI Commentary */}
              <div className="bg-black/50 border border-solana-purple/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-purple-300">{trade.aiCommentary}</div>
              </div>

              {/* Reactions */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-all">
                  <span>🔥</span>
                  <span className="text-sm font-bold">{trade.reactions.fire}</span>
                </button>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-green-500/20 px-4 py-2 rounded-lg transition-all">
                  <span>🚀</span>
                  <span className="text-sm font-bold">{trade.reactions.rocket}</span>
                </button>
                <button className="flex items-center gap-2 bg-gray-800 hover:bg-purple-500/20 px-4 py-2 rounded-lg transition-all">
                  <span>💀</span>
                  <span className="text-sm font-bold">{trade.reactions.skull}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Agents */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">🏆 Featured Agents</h3>
            <div className="space-y-3">
              {liveEpisode?.featuredAgents?.map((agent: any, index: number) => (
                <div
                  key={agent.pubkey}
                  className="bg-gray-800/50 rounded-lg p-3 hover:bg-gray-800 transition-all cursor-pointer"
                  onClick={() => setSelectedAgent(agent.pubkey)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold">{agent.name}</div>
                    <div className={`text-sm font-bold ${agent.roi > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {agent.roi > 0 ? '+' : ''}{agent.roi}%
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {agent.wins}W - {agent.losses}L
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">💰 Recent Donations</h3>
            <div className="space-y-3">
              {donations.map((donation, index) => (
                <div key={index} className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-bold text-yellow-400">{donation.amount} SOL</div>
                    <div className="text-xs text-gray-500">→ {donation.agentName}</div>
                  </div>
                  <div className="text-xs text-gray-400">
                    "{donation.message}"
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    from {donation.donorWallet}
                  </div>
                </div>
              ))}
            </div>

            {/* Donation CTA */}
            {publicKey && (
              <button className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-bold py-3 px-4 rounded-xl transition-all">
                💰 Donate SOL
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
