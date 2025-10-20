'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import AgentAvatar from '@/components/AgentAvatar';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface Agent {
  id: string;
  name: string;
  purpose: string;
  tokenMint: string;
  totalTrades: number;
  successfulTrades: number;
  totalProfit: string;
  createdAt: string;
}

interface BondingCurveStats {
  currentPrice: number;
  tokensSold: number;
  progress: number;
  totalValueLocked: number;
}

interface Particle {
  left: string;
  top: string;
  animationDelay: string;
  animationDuration: string;
}

export default function Home() {
  const router = useRouter();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [bondingCurves, setBondingCurves] = useState<Record<string, BondingCurveStats>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'trending' | 'new' | 'graduating'>('trending');
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    fetchAgents();
  }, [filter]);

  // Generate particles only on client to avoid hydration mismatch
  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, () => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 5}s`,
        animationDuration: `${10 + Math.random() * 20}s`
      }))
    );
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/agent/all`);
      const agentList = response.data.agents || [];
      setAgents(agentList);

      // Fetch bonding curve data for each agent
      const curves: Record<string, BondingCurveStats> = {};
      for (const agent of agentList.slice(0, 12)) {
        try {
          const bcResponse = await axios.get(`${BACKEND_API}/bonding-curve/${agent.id}`);
          if (bcResponse.data.success) {
            curves[agent.id] = bcResponse.data.bondingCurve.stats;
          }
        } catch (error) {
          // Silent fail for bonding curve
        }
      }
      setBondingCurves(curves);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => {
    if (amount === 0) return '0';
    if (amount < 0.001) return amount.toExponential(2);
    return amount.toFixed(6);
  };

  const getWinRate = (agent: Agent) => {
    if (agent.totalTrades === 0) return 0;
    return ((agent.successfulTrades / agent.totalTrades) * 100).toFixed(0);
  };

  const sortedAgents = [...agents].sort((a, b) => {
    const aCurve = bondingCurves[a.id];
    const bCurve = bondingCurves[b.id];

    if (filter === 'trending') {
      return (bCurve?.totalValueLocked || 0) - (aCurve?.totalValueLocked || 0);
    } else if (filter === 'new') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return (bCurve?.progress || 0) - (aCurve?.progress || 0);
    }
  });

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000,transparent)]"></div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {particles.map((particle, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full animate-float"
              style={{
                left: particle.left,
                top: particle.top,
                animationDelay: particle.animationDelay,
                animationDuration: particle.animationDuration
              }}
            ></div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Main Title with Glow Effect */}
            <h1 className="text-5xl sm:text-7xl font-black mb-6 relative">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                AI Agent Trading
              </span>
              <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-cyan-600/30 -z-10"></div>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto px-4 font-light leading-relaxed">
              <span className="text-purple-400 font-semibold">Create.</span>{' '}
              <span className="text-pink-400 font-semibold">Trade.</span>{' '}
              <span className="text-cyan-400 font-semibold">Earn.</span>{' '}
              <br className="hidden sm:block" />
              Autonomous AI agents trading 24/7 on Solana
            </p>

            {/* CTA Buttons */}
            <div className="flex gap-4 justify-center flex-wrap px-4">
              <Link
                href="/create"
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold text-lg overflow-hidden transition-all transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
                <span className="relative flex items-center gap-2">
                  🚀 Launch Agent
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
              <Link
                href="/leaderboard"
                className="group px-8 py-4 bg-gray-900 border-2 border-purple-500/50 rounded-xl font-bold text-lg hover:bg-gray-800 hover:border-purple-400 transition-all backdrop-blur-sm"
              >
                <span className="flex items-center gap-2">
                  🏆 Leaderboard
                </span>
              </Link>
            </div>

            {/* Live Stats Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full backdrop-blur-sm">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span className="text-green-400 text-sm font-semibold">LIVE TRADING</span>
            </div>
          </div>

          {/* Animated Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            <div className="group bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-purple-400 to-purple-200 bg-clip-text text-transparent">
                {agents.length}
              </div>
              <div className="text-gray-400 text-sm mt-2 group-hover:text-purple-300 transition-colors">
                Active Agents
              </div>
            </div>

            <div className="group bg-gradient-to-br from-pink-900/30 to-pink-900/10 backdrop-blur-xl rounded-xl p-6 border border-pink-500/20 hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-pink-400 to-pink-200 bg-clip-text text-transparent">
                {Object.values(bondingCurves).reduce((sum, bc) => sum + bc.totalValueLocked, 0).toFixed(1)}
              </div>
              <div className="text-gray-400 text-sm mt-2 group-hover:text-pink-300 transition-colors">
                SOL Locked
              </div>
            </div>

            <div className="group bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-cyan-400 to-cyan-200 bg-clip-text text-transparent">
                {agents.reduce((sum, a) => sum + a.totalTrades, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm mt-2 group-hover:text-cyan-300 transition-colors">
                Total Trades
              </div>
            </div>

            <div className="group bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-green-500/20">
              <div className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-green-400 to-green-200 bg-clip-text text-transparent">
                24/7
              </div>
              <div className="text-gray-400 text-sm mt-2 group-hover:text-green-300 transition-colors">
                Always Trading
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Token Marketplace */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 border-b border-gray-800 overflow-x-auto">
          <button
            onClick={() => setFilter('trending')}
            className={`group px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
              filter === 'trending'
                ? 'text-purple-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={filter === 'trending' ? 'animate-pulse' : ''}>🔥</span>
              Trending
            </span>
            {filter === 'trending' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full"></div>
            )}
          </button>

          <button
            onClick={() => setFilter('new')}
            className={`group px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
              filter === 'new'
                ? 'text-pink-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={filter === 'new' ? 'animate-pulse' : ''}>✨</span>
              New
            </span>
            {filter === 'new' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-orange-500 rounded-t-full"></div>
            )}
          </button>

          <button
            onClick={() => setFilter('graduating')}
            className={`group px-6 py-4 font-bold transition-all whitespace-nowrap relative ${
              filter === 'graduating'
                ? 'text-cyan-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={filter === 'graduating' ? 'animate-bounce' : ''}>🎓</span>
              Graduating
            </span>
            {filter === 'graduating' && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-t-full"></div>
            )}
          </button>
        </div>

        {/* Token Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-purple-500/30 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-400 text-lg">Loading agents...</p>
          </div>
        ) : sortedAgents.length === 0 ? (
          <div className="text-center py-20 space-y-6">
            <div className="text-6xl">🤖</div>
            <p className="text-gray-400 text-xl">No agents found</p>
            <Link
              href="/create"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-bold transition-all transform hover:scale-105"
            >
              Create the First Agent!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAgents.slice(0, 12).map((agent, index) => {
              const curve = bondingCurves[agent.id];
              return (
                <div
                  key={agent.id}
                  onClick={() => router.push(`/agent/${agent.id}`)}
                  className="group bg-gradient-to-br from-gray-900/80 to-gray-900/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Header */}
                  <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 p-6 border-b border-gray-800 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 group-hover:animate-shimmer"></div>

                    <div className="relative flex items-center gap-3 mb-3">
                      <AgentAvatar name={agent.name} size="md" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-black text-white truncate group-hover:text-purple-300 transition-colors">
                          {agent.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{agent.purpose}</p>
                  </div>

                  {/* Body */}
                  <div className="p-6 space-y-4">
                    {curve ? (
                      <>
                        {/* Price */}
                        <div>
                          <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Current Price</div>
                          <div className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            {formatSOL(curve.currentPrice)} SOL
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 mb-2 uppercase tracking-wider">
                            <span>Progress</span>
                            <span className="font-bold text-purple-400">{curve.progress.toFixed(1)}%</span>
                          </div>
                          <div className="relative bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                              className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 transition-all duration-1000 ease-out"
                              style={{ width: `${Math.min(curve.progress, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-3 border border-gray-800">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">TVL</div>
                            <div className="text-white font-bold">{curve.totalValueLocked.toFixed(3)} SOL</div>
                          </div>
                          <div className="bg-gray-900/50 backdrop-blur rounded-lg p-3 border border-gray-800">
                            <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Win Rate</div>
                            <div className="text-green-400 font-bold">{getWinRate(agent)}%</div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-600 text-sm animate-pulse">Loading data...</div>
                    )}
                  </div>

                  {/* Footer Button */}
                  <div className="px-6 pb-6">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-3 rounded-xl font-bold transition-all group-hover:shadow-lg group-hover:shadow-purple-500/50 relative overflow-hidden">
                      <span className="relative z-10">Buy Tokens</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* What is Agent.fun Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl sm:text-5xl font-black">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                What is Agent.fun?
              </span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed">
              Agent.fun is a revolutionary platform where AI trading agents become tradeable assets.
              Create your own autonomous trading agent, or invest in successful ones built by others.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="text-3xl">🤖</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">AI-Powered Agents</h4>
                  <p className="text-gray-400">Each agent uses advanced AI to trade 24/7, learning from market patterns</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">📈</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Bonding Curves</h4>
                  <p className="text-gray-400">Fair price discovery through automated bonding curves. Early = cheaper</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-3xl">💰</div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Revenue Sharing</h4>
                  <p className="text-gray-400">Token holders earn from agent trading profits automatically</p>
                </div>
              </div>
            </div>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600/20 border border-purple-500 rounded-xl hover:bg-purple-600/30 transition-all font-semibold"
            >
              📚 Read the Docs
              <span>→</span>
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-3xl p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Active Agents</span>
                  <span className="text-2xl font-bold text-purple-400">{agents.length}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">Total Volume</span>
                  <span className="text-2xl font-bold text-pink-400">
                    {Object.values(bondingCurves).reduce((sum, bc) => sum + bc.totalValueLocked, 0).toFixed(1)} SOL
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <span className="text-gray-400">24/7 Trading</span>
                  <span className="text-2xl font-bold text-green-400">LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-16">
          <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
            Why Agent.fun?
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl rounded-2xl p-8 border border-purple-500/20 hover:border-purple-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="text-2xl font-black text-white mb-3">Fair Launch</h3>
            <p className="text-gray-400 leading-relaxed">
              Bonding curve pricing ensures fair token distribution. Early supporters get rewarded!
            </p>
          </div>

          <div className="group bg-gradient-to-br from-pink-900/30 to-pink-900/10 backdrop-blur-xl rounded-2xl p-8 border border-pink-500/20 hover:border-pink-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🤖</div>
            <h3 className="text-2xl font-black text-white mb-3">AI Trading</h3>
            <p className="text-gray-400 leading-relaxed">
              Advanced AI agents trade 24/7 using machine learning and market analysis.
            </p>
          </div>

          <div className="group bg-gradient-to-br from-cyan-900/30 to-cyan-900/10 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/20 hover:border-cyan-500/50 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="text-2xl font-black text-white mb-3">Instant Trades</h3>
            <p className="text-gray-400 leading-relaxed">
              Buy and sell instantly through the bonding curve. No waiting for liquidity!
            </p>
          </div>
        </div>
      </div>

      {/* Roadmap Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl sm:text-5xl font-black text-center mb-16">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
            Roadmap
          </span>
        </h2>

        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 via-pink-500 to-cyan-500"></div>

          <div className="space-y-12">
            {/* Phase 1 */}
            <div className="relative pl-20">
              <div className="absolute left-5 top-4 w-7 h-7 bg-green-500 rounded-full border-4 border-black flex items-center justify-center">
                <span className="text-xs">✓</span>
              </div>
              <div className="bg-gradient-to-br from-green-900/30 to-green-900/10 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm font-bold">LIVE</span>
                  <h3 className="text-2xl font-black text-white">Phase 1: Launch</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>✅ Agent creation and tokenization</li>
                  <li>✅ Bonding curve trading</li>
                  <li>✅ AI-powered autonomous trading</li>
                  <li>✅ Real-time WebSocket updates</li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="relative pl-20">
              <div className="absolute left-5 top-4 w-7 h-7 bg-purple-500 rounded-full border-4 border-black animate-pulse"></div>
              <div className="bg-gradient-to-br from-purple-900/30 to-purple-900/10 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-purple-400 text-sm font-bold">IN PROGRESS</span>
                  <h3 className="text-2xl font-black text-white">Phase 2: Expansion</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>🔄 Raydium graduation & liquidity pools</li>
                  <li>🔄 Advanced trading strategies</li>
                  <li>🔄 Agent marketplace</li>
                  <li>🔄 Staking & yield vaults</li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="relative pl-20">
              <div className="absolute left-5 top-4 w-7 h-7 bg-gray-700 rounded-full border-4 border-black"></div>
              <div className="bg-gradient-to-br from-gray-900/30 to-gray-900/10 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/30">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-3 py-1 bg-gray-700/20 border border-gray-600 rounded-full text-gray-400 text-sm font-bold">COMING SOON</span>
                  <h3 className="text-2xl font-black text-white">Phase 3: Ecosystem</h3>
                </div>
                <ul className="space-y-2 text-gray-300">
                  <li>📋 DAO governance</li>
                  <li>📋 Cross-chain expansion</li>
                  <li>📋 Mobile app</li>
                  <li>📋 Agent tournaments & competitions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0.3; }
          50% { transform: translateY(-100px); opacity: 0.8; }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .animate-blob {
          animation: blob 20s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float linear infinite;
        }

        .animate-shimmer {
          animation: shimmer 3s infinite;
        }

        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
