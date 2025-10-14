import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface FeedItem {
  id: string;
  type: 'trade' | 'agent_created' | 'achievement' | 'referral' | 'leaderboard';
  user: string;
  agentName?: string;
  content: string;
  timestamp: Date;
  likes: number;
  comments: number;
  data?: any;
}

export default function SocialFeed() {
  const { publicKey } = useWallet();
  const [feed, setFeed] = useState<FeedItem[]>([
    {
      id: '1',
      type: 'trade',
      user: 'CryptoWhale',
      agentName: 'Alpha Bot',
      content: 'just made a killer trade!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      likes: 24,
      comments: 3,
      data: { profit: 0.5, token: 'SOL/USDC' }
    },
    {
      id: '2',
      type: 'agent_created',
      user: 'DegenTrader',
      agentName: 'Moon Mission',
      content: 'created a new agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      likes: 12,
      comments: 5,
      data: { riskLevel: 80, strategy: 'Aggressive' }
    },
    {
      id: '3',
      type: 'achievement',
      user: 'HODLer69',
      content: 'unlocked Win Streak Master badge!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 45,
      comments: 8,
      data: { badge: '⚡ Streak Master', streak: 10 }
    },
    {
      id: '4',
      type: 'leaderboard',
      user: 'TopGun',
      agentName: 'Profit Master',
      content: 'reached #1 on the leaderboard!',
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      likes: 89,
      comments: 15,
      data: { rank: 1, pnl: 5.2 }
    },
    {
      id: '5',
      type: 'referral',
      user: 'NetworkKing',
      content: 'just earned 0.05 SOL from referrals!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      likes: 18,
      comments: 2,
      data: { referrals: 10, earned: 0.5 }
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'trades' | 'achievements' | 'agents'>('all');

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'trade': return '📊';
      case 'agent_created': return '🤖';
      case 'achievement': return '🏅';
      case 'referral': return '🎁';
      case 'leaderboard': return '🏆';
      default: return '📢';
    }
  };

  const filteredFeed = filter === 'all'
    ? feed
    : feed.filter(item => {
        if (filter === 'trades') return item.type === 'trade';
        if (filter === 'achievements') return item.type === 'achievement';
        if (filter === 'agents') return item.type === 'agent_created';
        return true;
      });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">💬 Social Feed</h2>
        <p className="text-lg opacity-90">See what the community is up to!</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {(['all', 'trades', 'achievements', 'agents'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {f === 'all' && '🌐 All'}
            {f === 'trades' && '📊 Trades'}
            {f === 'achievements' && '🏅 Achievements'}
            {f === 'agents' && '🤖 Agents'}
          </button>
        ))}
      </div>

      {/* Create Post */}
      {publicKey && (
        <div className="bg-gray-800 rounded-lg p-4">
          <textarea
            placeholder="Share your thoughts with the community..."
            className="w-full bg-gray-900 text-white rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
          />
          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              <button className="text-gray-400 hover:text-purple-400 transition-colors">
                📷 Image
              </button>
              <button className="text-gray-400 hover:text-purple-400 transition-colors">
                🤖 Tag Agent
              </button>
            </div>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
              Post
            </button>
          </div>
        </div>
      )}

      {/* Feed Items */}
      <div className="space-y-4">
        {filteredFeed.map((item) => (
          <div
            key={item.id}
            className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl">
                  {getIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{item.user}</span>
                    {item.agentName && (
                      <>
                        <span className="text-gray-500">•</span>
                        <span className="text-purple-400">{item.agentName}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{getTimeAgo(item.timestamp)}</div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="mb-4">
              <p className="text-white text-lg">{item.content}</p>

              {/* Data Display */}
              {item.data && (
                <div className="mt-3 bg-gray-900/50 rounded-lg p-4">
                  {item.type === 'trade' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Pair:</span>
                      <span className="text-white font-bold">{item.data.token}</span>
                      <span className="text-green-400 font-bold">
                        +{item.data.profit} SOL
                      </span>
                    </div>
                  )}

                  {item.type === 'agent_created' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Strategy:</span>
                      <span className="text-white">{item.data.strategy}</span>
                      <span className="text-yellow-400">Risk: {item.data.riskLevel}/100</span>
                    </div>
                  )}

                  {item.type === 'achievement' && (
                    <div className="text-center">
                      <div className="text-4xl mb-2">{item.data.badge}</div>
                      <div className="text-purple-400 font-bold">
                        {item.data.streak} win streak!
                      </div>
                    </div>
                  )}

                  {item.type === 'leaderboard' && (
                    <div className="flex justify-between items-center">
                      <span className="text-4xl">🏆</span>
                      <div className="text-right">
                        <div className="text-yellow-400 font-bold text-xl">
                          Rank #{item.data.rank}
                        </div>
                        <div className="text-green-400">
                          +{item.data.pnl} SOL P&L
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === 'referral' && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Referrals:</span>
                      <span className="text-white font-bold">{item.data.referrals}</span>
                      <span className="text-green-400 font-bold">
                        {item.data.earned} SOL earned
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6 text-gray-400">
              <button className="flex items-center gap-2 hover:text-red-400 transition-colors">
                <span>❤️</span>
                <span>{item.likes}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-blue-400 transition-colors">
                <span>💬</span>
                <span>{item.comments}</span>
              </button>
              <button className="flex items-center gap-2 hover:text-green-400 transition-colors">
                <span>🔄</span>
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-lg font-bold transition-colors">
        Load More Posts
      </button>

      {/* Trending Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">🔥 Trending Now</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-white">#SolanaTrading</span>
            <span className="text-purple-400 font-bold">1.2k posts</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-white">#AIAgents</span>
            <span className="text-purple-400 font-bold">856 posts</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/50 rounded-lg">
            <span className="text-white">#ToTheMoon</span>
            <span className="text-purple-400 font-bold">624 posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
