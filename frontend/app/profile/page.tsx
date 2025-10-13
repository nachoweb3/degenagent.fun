'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface UserProfile {
  wallet: string;
  username?: string;
  referralCode: string;
  referredBy?: string;
  totalReferrals: number;
  referralEarnings: number;
  createdAgents: number;
  totalVolume: number;
  joinedAt: string;
}

interface Agent {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  totalTrades: number;
  totalVolume: number;
  status: string;
}

export default function Profile() {
  const { publicKey, disconnect } = useWallet();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'referrals'>('overview');
  const [copied, setCopied] = useState(false);
  const [username, setUsername] = useState('');
  const [editingUsername, setEditingUsername] = useState(false);

  useEffect(() => {
    if (publicKey) {
      fetchProfile();
      fetchUserAgents();
    }
  }, [publicKey]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/user/${publicKey?.toString()}`);
      setProfile(response.data.profile || createMockProfile());
      setUsername(response.data.profile?.username || '');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Create mock profile for demo
      setProfile(createMockProfile());
      setLoading(false);
    }
  };

  const fetchUserAgents = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/user/${publicKey?.toString()}/agents`);
      setAgents(response.data.agents || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    }
  };

  const createMockProfile = (): UserProfile => ({
    wallet: publicKey?.toString() || '',
    referralCode: generateReferralCode(),
    totalReferrals: 0,
    referralEarnings: 0,
    createdAgents: 0,
    totalVolume: 0,
    joinedAt: new Date().toISOString(),
  });

  const generateReferralCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}?ref=${profile?.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateUsername = async () => {
    if (!username.trim()) return;

    try {
      await axios.post(`${BACKEND_API}/user/${publicKey?.toString()}/update`, {
        username: username.trim(),
      });
      setEditingUsername(false);
      await fetchProfile();
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username');
    }
  };

  if (!publicKey) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center bg-gray-900/50 rounded-xl p-12 border border-gray-800">
          <h1 className="text-4xl font-bold mb-6">Your Profile</h1>
          <p className="text-xl text-gray-400 mb-8">Connect your wallet to view your profile</p>
          <div className="flex justify-center">
            <WalletMultiButton />
          </div>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-solana-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  const referralLink = `${typeof window !== 'undefined' ? window.location.origin : ''}?ref=${profile.referralCode}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-solana-purple to-solana-green rounded-full flex items-center justify-center text-3xl font-bold">
              {profile.username?.[0]?.toUpperCase() || publicKey.toString()[0]}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      maxLength={20}
                      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1 text-xl font-bold"
                      placeholder="Enter username"
                    />
                    <button
                      onClick={handleUpdateUsername}
                      className="text-green-400 hover:text-green-300"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingUsername(false);
                        setUsername(profile.username || '');
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold">
                      {profile.username || 'Unnamed User'}
                    </h1>
                    <button
                      onClick={() => setEditingUsername(true)}
                      className="text-gray-400 hover:text-white"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400 font-mono text-sm">
                {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Member since {new Date(profile.joinedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => disconnect()}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold py-2 px-6 rounded-xl transition-all"
          >
            Disconnect
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <QuickStat label="Agents Created" value={profile.createdAgents} />
          <QuickStat label="Total Volume" value={`$${profile.totalVolume.toLocaleString()}`} />
          <QuickStat label="Referrals" value={profile.totalReferrals} />
          <QuickStat label="Referral Earnings" value={`${profile.referralEarnings.toFixed(2)} SOL`} />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-800 mb-8">
        <div className="flex gap-6">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'agents'} onClick={() => setActiveTab('agents')}>
            My Agents ({agents.length})
          </TabButton>
          <TabButton active={activeTab === 'referrals'} onClick={() => setActiveTab('referrals')}>
            Referrals ({profile.totalReferrals})
          </TabButton>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Portfolio Summary */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Portfolio Summary</h2>
              <div className="space-y-4">
                <SummaryRow label="Total Agents" value={agents.length.toString()} />
                <SummaryRow label="Active Agents" value={agents.filter(a => a.status === 'active').length.toString()} />
                <SummaryRow label="Total Balance" value={`${agents.reduce((sum, a) => sum + a.balance, 0).toFixed(2)} SOL`} />
                <SummaryRow label="Total Trades" value={agents.reduce((sum, a) => sum + a.totalTrades, 0).toString()} />
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h2 className="text-2xl font-bold mb-4">Achievements</h2>
              <div className="grid grid-cols-2 gap-3">
                <Achievement emoji="🚀" label="First Agent" unlocked={profile.createdAgents > 0} />
                <Achievement emoji="💰" label="10 Trades" unlocked={agents.reduce((s, a) => s + a.totalTrades, 0) >= 10} />
                <Achievement emoji="👥" label="5 Referrals" unlocked={profile.totalReferrals >= 5} />
                <Achievement emoji="📈" label="$10k Volume" unlocked={profile.totalVolume >= 10000} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="text-center py-8 text-gray-400">
              No recent activity. Create an agent to get started!
            </div>
          </div>
        </div>
      )}

      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">My Agents</h2>
            <Link
              href="/create"
              className="bg-solana-purple hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl"
            >
              + Create New Agent
            </Link>
          </div>

          {agents.length === 0 ? (
            <div className="bg-gray-900/50 rounded-xl p-12 border border-gray-800 text-center">
              <p className="text-xl text-gray-400 mb-6">You haven't created any agents yet</p>
              <Link
                href="/create"
                className="bg-solana-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl inline-block"
              >
                Create Your First Agent
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {agents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="space-y-6">
          {/* Referral Program Info */}
          <div className="bg-gradient-to-r from-solana-purple/20 to-solana-green/20 rounded-xl p-8 border border-solana-purple/50">
            <h2 className="text-3xl font-bold mb-4">🎁 Referral Program</h2>
            <p className="text-lg text-gray-300 mb-6">
              Earn 10% of the creation fees when your friends create agents using your referral link!
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              <ReferralStat label="Total Referrals" value={profile.totalReferrals} />
              <ReferralStat label="Earnings" value={`${profile.referralEarnings.toFixed(2)} SOL`} />
              <ReferralStat label="Potential" value={`${(profile.totalReferrals * 0.05).toFixed(2)} SOL`} />
            </div>
          </div>

          {/* Referral Link */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Your Referral Link</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 font-mono text-sm"
              />
              <button
                onClick={copyReferralLink}
                className="bg-solana-purple hover:bg-purple-700 text-white font-bold px-6 rounded-lg transition-all"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>
            <p className="text-sm text-gray-400 mt-3">
              Share this link with your friends. You'll earn 0.05 SOL (10% of 0.5 SOL fee) for each agent they create!
            </p>
          </div>

          {/* Share Buttons */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">Share on Social Media</h3>
            <div className="flex flex-wrap gap-3">
              <ShareButton
                platform="Twitter"
                icon="🐦"
                href={`https://twitter.com/intent/tweet?text=Check%20out%20Agent.fun%20-%20AI-powered%20trading%20agents%20on%20Solana!&url=${encodeURIComponent(referralLink)}`}
                color="bg-[#1DA1F2] hover:bg-[#1a8cd8]"
              />
              <ShareButton
                platform="Telegram"
                icon="✈️"
                href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=Check%20out%20Agent.fun%20-%20AI-powered%20trading%20agents%20on%20Solana!`}
                color="bg-[#0088cc] hover:bg-[#0077b3]"
              />
              <ShareButton
                platform="Discord"
                icon="💬"
                href="#"
                color="bg-[#5865F2] hover:bg-[#4752c4]"
                onClick={(e) => {
                  e.preventDefault();
                  copyReferralLink();
                  alert('Link copied! Paste it in Discord');
                }}
              />
            </div>
          </div>

          {/* Referral Leaderboard */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4">🏆 Referral Leaderboard</h3>
            <div className="space-y-3">
              <LeaderboardRow rank={1} wallet="Dt5x...k3Ym" referrals={127} earnings="6.35 SOL" />
              <LeaderboardRow rank={2} wallet="9mW2...Ax7k" referrals={98} earnings="4.90 SOL" />
              <LeaderboardRow rank={3} wallet="FsP1...Qr2n" referrals={76} earnings="3.80 SOL" />
              {profile.totalReferrals > 0 && (
                <LeaderboardRow
                  rank="Your Rank"
                  wallet={`${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`}
                  referrals={profile.totalReferrals}
                  earnings={`${profile.referralEarnings.toFixed(2)} SOL`}
                  highlight
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 font-semibold transition-colors ${
        active ? 'text-white border-b-2 border-solana-purple' : 'text-gray-400 hover:text-white'
      }`}
    >
      {children}
    </button>
  );
}

function QuickStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-400">{label}</span>
      <span className="text-xl font-bold">{value}</span>
    </div>
  );
}

function Achievement({ emoji, label, unlocked }: { emoji: string; label: string; unlocked: boolean }) {
  return (
    <div className={`p-4 rounded-lg text-center ${
      unlocked ? 'bg-solana-purple/20 border border-solana-purple' : 'bg-gray-800/50 border border-gray-700 opacity-50'
    }`}>
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-sm font-semibold">{label}</div>
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Link href={`/agent/${agent.id}`}>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-solana-purple transition-all cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
            <p className="text-gray-400">${agent.symbol}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
          }`}>
            {agent.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Balance</div>
            <div className="text-lg font-semibold">{agent.balance.toFixed(2)} SOL</div>
          </div>
          <div>
            <div className="text-gray-500">Trades</div>
            <div className="text-lg font-semibold">{agent.totalTrades}</div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-gray-500 text-sm">Total Volume</div>
          <div className="text-xl font-bold text-solana-green">${agent.totalVolume.toLocaleString()}</div>
        </div>
      </div>
    </Link>
  );
}

function ReferralStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-4 text-center">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function ShareButton({
  platform,
  icon,
  href,
  color,
  onClick
}: {
  platform: string;
  icon: string;
  href: string;
  color: string;
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`${color} text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2`}
    >
      <span>{icon}</span>
      <span>{platform}</span>
    </a>
  );
}

function LeaderboardRow({
  rank,
  wallet,
  referrals,
  earnings,
  highlight
}: {
  rank: number | string;
  wallet: string;
  referrals: number;
  earnings: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-4 rounded-lg ${
      highlight ? 'bg-solana-purple/20 border border-solana-purple' : 'bg-gray-800/50'
    }`}>
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
          rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
          rank === 2 ? 'bg-gray-400/20 text-gray-400' :
          rank === 3 ? 'bg-orange-500/20 text-orange-400' :
          'bg-gray-700 text-gray-300'
        }`}>
          {rank}
        </div>
        <div className="font-mono">{wallet}</div>
      </div>
      <div className="text-right">
        <div className="font-bold">{referrals} referrals</div>
        <div className="text-sm text-gray-400">{earnings}</div>
      </div>
    </div>
  );
}
