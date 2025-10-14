import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface ReferralStats {
  hasCode: boolean;
  referralCode?: string;
  referralUrl?: string;
  stats: {
    totalReferrals: number;
    activeReferrals: number;
    rewardsClaimed: number;
    pendingRewards: number;
    agentsCreated: number;
    totalVolume: number;
  };
  referrals: Array<{
    address: string;
    agentsCreated: number;
    volume: number;
    createdAt: Date;
  }>;
}

export default function ReferralDashboard() {
  const { publicKey } = useWallet();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchStats();
    }
  }, [publicKey]);

  const API_URL = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/referral/stats/${publicKey}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      const response = await fetch(`${API_URL}/referral/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey?.toBase58() })
      });
      const data = await response.json();

      if (data.success) {
        fetchStats();
      } else {
        alert('Error generating referral code: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating code:', error);
      alert('Failed to generate referral code. Please try again.');
    }
  };

  const copyLink = () => {
    if (stats?.referralUrl) {
      navigator.clipboard.writeText(stats.referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const claimRewards = async () => {
    setClaiming(true);
    try {
      const response = await fetch(`${API_URL}/referral/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: publicKey?.toBase58() })
      });
      const data = await response.json();

      if (data.success) {
        alert(`✅ Claimed ${data.amountClaimed} SOL!`);
        fetchStats();
      } else {
        alert('Error claiming rewards: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error claiming rewards:', error);
      alert('Failed to claim rewards. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  const shareToTwitter = () => {
    const text = `🎁 Join AGENT.FUN and get 10% OFF your first AI trading agent!\n\nUse my referral code: ${stats?.referralCode}\n\n💰 AI agents that trade 24/7 on Solana\n🤖 Fully autonomous trading\n📈 Real-time performance tracking\n\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(stats?.referralUrl || '')}&hashtags=Solana,AITrading,AgentFun`;
    window.open(url, '_blank');
  };

  if (!publicKey) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Connect your wallet to access referral program</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12 text-white">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-green-400 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">🎁 Referral Program</h1>
        <p className="text-lg">Earn 10% of every agent created by your referrals!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Total Referrals</div>
          <div className="text-3xl font-bold text-white">{stats?.stats.totalReferrals || 0}</div>
          <div className="text-green-400 text-sm mt-1">
            {stats?.stats.activeReferrals || 0} active
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Pending Rewards</div>
          <div className="text-3xl font-bold text-purple-400">
            {stats?.stats.pendingRewards.toFixed(4) || '0.0000'} SOL
          </div>
          <div className="text-gray-500 text-sm mt-1">
            ${((stats?.stats.pendingRewards || 0) * 100).toFixed(2)} USD
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="text-gray-400 text-sm mb-2">Total Earned</div>
          <div className="text-3xl font-bold text-green-400">
            {stats?.stats.rewardsClaimed.toFixed(4) || '0.0000'} SOL
          </div>
          <div className="text-gray-500 text-sm mt-1">
            ${((stats?.stats.rewardsClaimed || 0) * 100).toFixed(2)} USD
          </div>
        </div>
      </div>

      {/* Referral Link */}
      {stats?.hasCode ? (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Referral Link</h3>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={stats.referralUrl}
              readOnly
              className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg border border-gray-700"
            />
            <button
              onClick={copyLink}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={shareToTwitter}
              className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-3 rounded-lg transition-colors"
            >
              Share on Twitter
            </button>

            {stats.stats.pendingRewards > 0 && (
              <button
                onClick={claimRewards}
                disabled={claiming}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {claiming ? 'Claiming...' : `Claim ${stats.stats.pendingRewards.toFixed(4)} SOL`}
              </button>
            )}
          </div>

          <div className="mt-4 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300">
              💡 <strong>Referral Code:</strong> {stats.referralCode}
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Share this link and earn 10% (0.05 SOL) for every agent your referrals create!
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-4">Get Your Referral Code</h3>
          <p className="text-gray-400 mb-6">Start earning rewards by referring friends!</p>
          <button
            onClick={generateCode}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white rounded-lg font-bold transition-all"
          >
            Generate Referral Code
          </button>
        </div>
      )}

      {/* Referrals List */}
      {stats?.referrals && stats.referrals.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Your Referrals</h3>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 text-sm border-b border-gray-700">
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Agents Created</th>
                  <th className="pb-3">Volume</th>
                  <th className="pb-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {stats.referrals.map((ref, index) => (
                  <tr key={index} className="border-b border-gray-700/50 text-white">
                    <td className="py-3 font-mono">{ref.address}</td>
                    <td className="py-3">{ref.agentsCreated}</td>
                    <td className="py-3">{ref.volume.toFixed(2)} SOL</td>
                    <td className="py-3 text-gray-400">
                      {new Date(ref.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">1</span>
            </div>
            <div>
              <h4 className="text-white font-bold">Share Your Link</h4>
              <p className="text-gray-400 text-sm">Share your unique referral link with friends</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">2</span>
            </div>
            <div>
              <h4 className="text-white font-bold">They Get a Discount</h4>
              <p className="text-gray-400 text-sm">Your referrals get 10% OFF on their first agent creation</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">3</span>
            </div>
            <div>
              <h4 className="text-white font-bold">You Earn Rewards</h4>
              <p className="text-gray-400 text-sm">Earn 10% (0.05 SOL) for every agent they create</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">💰</span>
            </div>
            <div>
              <h4 className="text-white font-bold">Claim Anytime</h4>
              <p className="text-gray-400 text-sm">Withdraw your rewards to your wallet anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
