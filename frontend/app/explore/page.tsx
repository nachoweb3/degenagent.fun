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
}

type SortOption = 'volume' | 'trades' | 'recent' | 'balance';
type FilterOption = 'all' | 'active' | 'inactive';

export default function Explore() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('volume');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    filterAndSortAgents();
  }, [agents, searchQuery, sortBy, filterBy]);

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

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        agent.purpose.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(agent => agent.status === filterBy);
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
        default:
          return 0;
      }
    });

    setFilteredAgents(filtered);
  };

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
              <option value="volume">💰 Highest Volume</option>
              <option value="trades">📊 Most Trades</option>
              <option value="balance">💎 Highest Balance</option>
              <option value="recent">🆕 Most Recent</option>
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
              <option value="active">✅ Active Only</option>
              <option value="inactive">⏸️ Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || filterBy !== 'all') && (
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
          </div>
        )}
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

function AgentCard({ agent }: { agent: Agent }) {
  const successRate = agent.successfulTrades && agent.totalTrades > 0
    ? Math.round((agent.successfulTrades / agent.totalTrades) * 100)
    : 0;

  return (
    <Link href={`/agent/${agent.id}`}>
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-solana-purple hover:scale-105 transition-all cursor-pointer">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-2xl font-bold mb-1">{agent.name}</h3>
            {agent.symbol && <p className="text-gray-400 text-sm">${agent.symbol}</p>}
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
    </Link>
  );
}
