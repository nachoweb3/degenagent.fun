'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface Agent {
  id: string;
  name: string;
  symbol?: string;
  purpose: string;
  balance?: number;
  totalTrades: number;
  successfulTrades?: number;
  totalVolume: number;
  status?: string;
  createdAt?: string;
  performance?: {
    roi?: number;
    winRate?: number;
  };
  marketCap?: number;
  strategy?: string;
}

type SortOption = 'volume' | 'trades' | 'recent' | 'balance' | 'trending' | 'performance' | 'oldest';
type FilterOption = 'all' | 'active' | 'inactive';
type StrategyFilter = 'all' | 'technical' | 'arbitrage' | 'dca' | 'momentum' | 'custom';

export default function Explore() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [strategyFilter, setStrategyFilter] = useState<StrategyFilter>('all');
  const [marketCapRange, setMarketCapRange] = useState<[number, number]>([0, 10000000]);
  const [performanceRating, setPerformanceRating] = useState<number>(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, sortBy, filterBy, strategyFilter, marketCapRange, performanceRating]);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/agent/all`);
      setAgents(response.data.agents || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  const filterAndSortAgents = () => {
    let filtered = [...agents];

    // Apply search filter (name, symbol, purpose, or creator)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(query) ||
        agent.symbol?.toLowerCase().includes(query) ||
        agent.purpose.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterBy);
    }

    // Apply strategy filter
    if (strategyFilter !== 'all') {
      filtered = filtered.filter(agent => agent.strategy === strategyFilter);
    }

    // Apply market cap range filter
    if (marketCapRange[0] > 0 || marketCapRange[1] < 10000000) {
      filtered = filtered.filter(agent => {
        const cap = agent.marketCap || 0;
        return cap >= marketCapRange[0] && cap <= marketCapRange[1];
      });
    }

    // Apply performance rating filter
    if (performanceRating > 0) {
      filtered = filtered.filter(agent => {
        const roi = agent.performance?.roi || 0;
        if (performanceRating === 1) return roi > 0; // Profitable
        if (performanceRating === 2) return roi > 10; // Good
        if (performanceRating === 3) return roi > 25; // Excellent
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'volume':
          return b.totalVolume - a.totalVolume;
        case 'trades':
          return b.totalTrades - a.totalTrades;
        case 'balance':
          return (b.balance || 0) - (a.balance || 0);
        case 'recent':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'performance':
          return (b.performance?.roi || 0) - (a.performance?.roi || 0);
        case 'trending':
          // Trending based on recent volume and performance
          const aScore = (a.totalVolume * 0.5) + ((a.performance?.roi || 0) * 100);
          const bScore = (b.totalVolume * 0.5) + ((b.performance?.roi || 0) * 100);
          return bScore - aScore;
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterBy('all');
    setStrategyFilter('all');
    setMarketCapRange([0, 10000000]);
    setPerformanceRating(0);
    setSortBy('volume');
  };

  const hasActiveFilters = searchQuery || filterBy !== 'all' || strategyFilter !== 'all' ||
    marketCapRange[0] > 0 || marketCapRange[1] < 10000000 || performanceRating > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Explore AI Agents</h1>
        <p className="text-gray-400 mb-6">
          Discover autonomous trading agents created by the community
        </p>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-solana-green">{agents.length}</div>
            <div className="text-xs text-gray-400">Total Agents</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-solana-green">
              {agents.filter(a => a.status === 'active').length}
            </div>
            <div className="text-xs text-gray-400">Active</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-800">
            <div className="text-2xl font-bold text-solana-green">
              ${agents.reduce((sum, a) => sum + a.totalVolume, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Volume</div>
          </div>
        </div>
      </div>

      {/* King of the Hill Banner */}
      <Link href="/king-of-the-hill">
        <div className="mb-8 relative overflow-hidden rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-r from-yellow-900/20 via-orange-900/20 to-red-900/20 p-6 cursor-pointer hover:border-yellow-400 hover:scale-[1.02] transition-all duration-300 group">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-6xl animate-bounce">👑</div>
              <div>
                <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  KING OF THE HILL
                </h2>
                <p className="text-gray-300 text-sm">
                  Compete for the throne! Top agent wins exclusive rewards 🏆
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-400">Current King</div>
                <div className="text-lg font-bold text-yellow-400">Loading...</div>
              </div>
              <svg className="w-6 h-6 text-yellow-400 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </Link>

      {/* Filters & Search */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, symbol, or mission..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-12 bg-gray-900/50 border border-gray-800 rounded-xl focus:outline-none focus:border-solana-purple text-base"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-solana-purple"
            >
              <option value="trending">🔥 Trending</option>
              <option value="performance">📈 Top Performers</option>
              <option value="volume">💰 Highest Volume</option>
              <option value="trades">📊 Most Trades</option>
              <option value="balance">💎 Highest Balance</option>
              <option value="recent">🆕 Newest</option>
              <option value="oldest">📅 Oldest</option>
            </select>
          </div>

          {/* Filter */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Status</label>
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value as FilterOption)}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-solana-purple"
            >
              <option value="all">All Agents</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">&nbsp;</label>
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`w-full px-4 py-2 border rounded-lg transition-colors ${
                showAdvancedFilters
                  ? 'bg-solana-purple border-solana-purple text-white'
                  : 'bg-gray-900/50 border-gray-800 text-gray-300 hover:border-solana-purple'
              }`}
            >
              {showAdvancedFilters ? '🔍 Hide Filters' : '🔍 Advanced Filters'}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-4 space-y-4 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Strategy Filter */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Strategy Type</label>
                <select
                  value={strategyFilter}
                  onChange={(e) => setStrategyFilter(e.target.value as StrategyFilter)}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-solana-purple"
                >
                  <option value="all">All Strategies</option>
                  <option value="technical">Technical Analysis</option>
                  <option value="arbitrage">Arbitrage</option>
                  <option value="dca">DCA (Dollar Cost Average)</option>
                  <option value="momentum">Momentum Trading</option>
                  <option value="custom">Custom Strategy</option>
                </select>
              </div>

              {/* Performance Rating */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Performance Rating</label>
                <select
                  value={performanceRating}
                  onChange={(e) => setPerformanceRating(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-lg focus:outline-none focus:border-solana-purple"
                >
                  <option value="0">All Performance Levels</option>
                  <option value="1">Profitable (ROI &gt; 0%)</option>
                  <option value="2">Good (ROI &gt; 10%)</option>
                  <option value="3">Excellent (ROI &gt; 25%)</option>
                </select>
              </div>

              {/* Market Cap Range */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Market Cap: ${marketCapRange[0].toLocaleString()} - ${marketCapRange[1].toLocaleString()}
                </label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={marketCapRange[0]}
                    onChange={(e) => setMarketCapRange([Number(e.target.value), marketCapRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={marketCapRange[1]}
                    onChange={(e) => setMarketCapRange([marketCapRange[0], Number(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Active filters:</span>
            {searchQuery && (
              <span className="bg-solana-purple/20 text-solana-purple px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Search: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-white">×</button>
              </span>
            )}
            {filterBy !== 'all' && (
              <span className="bg-solana-green/20 text-solana-green px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Status: {filterBy}
                <button onClick={() => setFilterBy('all')} className="hover:text-white">×</button>
              </span>
            )}
            {strategyFilter !== 'all' && (
              <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Strategy: {strategyFilter}
                <button onClick={() => setStrategyFilter('all')} className="hover:text-white">×</button>
              </span>
            )}
            {performanceRating > 0 && (
              <span className="bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Performance: {performanceRating === 1 ? 'Profitable' : performanceRating === 2 ? 'Good' : 'Excellent'}
                <button onClick={() => setPerformanceRating(0)} className="hover:text-white">×</button>
              </span>
            )}
            {(marketCapRange[0] > 0 || marketCapRange[1] < 10000000) && (
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                Market Cap: ${marketCapRange[0].toLocaleString()} - ${marketCapRange[1].toLocaleString()}
                <button onClick={() => setMarketCapRange([0, 10000000])} className="hover:text-white">×</button>
              </span>
            )}
          </div>
        )}

        <style jsx>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-solana-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading agents...</p>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-xl text-gray-400 mb-2">No agents found</p>
          <p className="text-gray-500 mb-6">
            {searchQuery || filterBy !== 'all'
              ? 'Try adjusting your filters'
              : 'Be the first to create an agent!'}
          </p>
          {!searchQuery && filterBy === 'all' && (
            <Link
              href="/create"
              className="bg-solana-purple hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl inline-block"
            >
              Create the First Agent
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-400">
              Showing <span className="text-white font-semibold">{filteredAgents.length}</span> {filteredAgents.length === 1 ? 'agent' : 'agents'}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface AgentWithImage extends Agent {
  imageUrl?: string;
}

function AgentCard({ agent }: { agent: AgentWithImage }) {
  const successRate = agent.successfulTrades && agent.totalTrades > 0
    ? Math.round((agent.successfulTrades / agent.totalTrades) * 100)
    : 0;

  return (
    <Link href={`/agent/${agent.id}`}>
      <div className="group bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer hover:-translate-y-1">
        {/* Agent Image */}
        {agent.imageUrl && (
          <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            <img
              src={agent.imageUrl}
              alt={agent.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60"></div>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">{agent.name}</h3>
              {agent.symbol && <p className="text-gray-400 text-sm font-mono">${agent.symbol}</p>}
            </div>
          {agent.status && (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              agent.status === 'active'
                ? 'bg-green-500/20 text-green-400'
                : 'bg-gray-500/20 text-gray-400'
            }`}>
              {agent.status}
            </span>
          )}
        </div>

        {/* Purpose */}
        <p className="text-gray-400 mb-4 line-clamp-2 text-sm">{agent.purpose}</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Balance</div>
            <div className="text-lg font-bold text-white">
              {agent.balance !== undefined ? `${agent.balance.toFixed(2)} SOL` : 'N/A'}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-1">Trades</div>
            <div className="text-lg font-bold text-white">{agent.totalTrades}</div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div>
            <div className="text-xs text-gray-500">Volume</div>
            <div className="text-base font-bold text-solana-green">${agent.totalVolume.toLocaleString()}</div>
          </div>
          {successRate > 0 && (
            <div className="text-right">
              <div className="text-xs text-gray-500">Win Rate</div>
              <div className={`text-base font-bold ${
                successRate >= 70 ? 'text-green-400' :
                successRate >= 50 ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {successRate}%
              </div>
            </div>
          )}
        </div>

        {/* View Details CTA */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <span className="text-solana-purple hover:text-purple-400 font-semibold text-sm flex items-center gap-2">
            View Details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
        </div>
      </div>
    </Link>
  );
}
