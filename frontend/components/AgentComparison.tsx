'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
    roi: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalPnL: number;
  };
}

interface AgentComparisonProps {
  preselectedAgents?: string[];
  onClose?: () => void;
}

export default function AgentComparison({ preselectedAgents = [], onClose }: AgentComparisonProps) {
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [selectedAgentIds, setSelectedAgentIds] = useState<string[]>(preselectedAgents);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    if (selectedAgentIds.length > 0) {
      fetchSelectedAgents();
    }
  }, [selectedAgentIds]);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/agent/all`);
      setAvailableAgents(response.data.agents || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setLoading(false);
    }
  };

  const fetchSelectedAgents = async () => {
    try {
      const agentPromises = selectedAgentIds.map((id) =>
        axios.get(`${BACKEND_API}/agent/${id}`).catch(() => ({ data: null }))
      );
      const responses = await Promise.all(agentPromises);
      const agents = responses
        .map((res) => res.data?.agent)
        .filter(Boolean) as Agent[];
      setSelectedAgents(agents);
    } catch (error) {
      console.error('Error fetching selected agents:', error);
    }
  };

  const toggleAgent = (agentId: string) => {
    if (selectedAgentIds.includes(agentId)) {
      setSelectedAgentIds(selectedAgentIds.filter((id) => id !== agentId));
    } else if (selectedAgentIds.length < 3) {
      setSelectedAgentIds([...selectedAgentIds, agentId]);
    }
  };

  const filteredAgents = availableAgents.filter(
    (agent) =>
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMetricColor = (value: number, type: 'roi' | 'winRate' | 'sharpe') => {
    if (type === 'roi') {
      if (value > 20) return 'text-green-400';
      if (value > 0) return 'text-green-300';
      if (value < -20) return 'text-red-400';
      return 'text-red-300';
    }
    if (type === 'winRate') {
      if (value >= 70) return 'text-green-400';
      if (value >= 50) return 'text-yellow-400';
      return 'text-red-400';
    }
    if (type === 'sharpe') {
      if (value > 2) return 'text-green-400';
      if (value > 1) return 'text-yellow-400';
      return 'text-gray-400';
    }
    return 'text-gray-400';
  };

  const getBestInCategory = (metric: string) => {
    if (selectedAgents.length === 0) return null;

    let best = selectedAgents[0];
    selectedAgents.forEach((agent) => {
      const currentValue = getMetricValue(agent, metric);
      const bestValue = getMetricValue(best, metric);
      if (currentValue > bestValue) {
        best = agent;
      }
    });
    return best.id;
  };

  const getMetricValue = (agent: Agent, metric: string): number => {
    switch (metric) {
      case 'roi':
        return agent.performance?.roi || 0;
      case 'winRate':
        return agent.performance?.winRate || 0;
      case 'profitFactor':
        return agent.performance?.profitFactor || 0;
      case 'sharpeRatio':
        return agent.performance?.sharpeRatio || 0;
      case 'totalTrades':
        return agent.totalTrades || 0;
      case 'totalVolume':
        return agent.totalVolume || 0;
      case 'balance':
        return agent.balance || 0;
      default:
        return 0;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Agent Comparison</h2>
            <p className="text-gray-300 text-sm">Compare up to 3 agents side-by-side</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Agent Selection */}
        {selectedAgentIds.length < 3 && (
          <div className="mb-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">
              Select Agents ({selectedAgentIds.length}/3)
            </h3>
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:border-purple-500 mb-3"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto custom-scrollbar">
              {filteredAgents
                .filter((agent) => !selectedAgentIds.includes(agent.id))
                .map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className="bg-gray-900 hover:bg-gray-700 border border-gray-700 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="font-semibold text-white text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.symbol}</div>
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Comparison Grid */}
        {selectedAgents.length > 0 ? (
          <div className="space-y-6">
            {/* Agent Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 relative"
                >
                  <button
                    onClick={() => toggleAgent(agent.id)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <h3 className="text-xl font-bold text-white mb-1">{agent.name}</h3>
                  <p className="text-sm text-gray-400 mb-2">{agent.symbol}</p>
                  <div className={`inline-block px-2 py-1 rounded text-xs ${
                    agent.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {agent.status}
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-4 text-gray-400 font-semibold">Metric</th>
                    {selectedAgents.map((agent) => (
                      <th key={agent.id} className="text-center p-4 text-white font-semibold">
                        {agent.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* ROI */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">ROI</td>
                    {selectedAgents.map((agent) => {
                      const roi = agent.performance?.roi || 0;
                      const isBest = getBestInCategory('roi') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className={`font-bold ${getMetricColor(roi, 'roi')}`}>
                            {roi > 0 ? '+' : ''}{roi.toFixed(2)}%
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Win Rate */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Win Rate</td>
                    {selectedAgents.map((agent) => {
                      const winRate = agent.performance?.winRate || 0;
                      const isBest = getBestInCategory('winRate') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className={`font-bold ${getMetricColor(winRate, 'winRate')}`}>
                            {winRate.toFixed(1)}%
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Trades */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Total Trades</td>
                    {selectedAgents.map((agent) => {
                      const isBest = getBestInCategory('totalTrades') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className="font-bold text-blue-400">
                            {agent.totalTrades}
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Total Volume */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Total Volume</td>
                    {selectedAgents.map((agent) => {
                      const isBest = getBestInCategory('totalVolume') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className="font-bold text-purple-400">
                            ${agent.totalVolume.toLocaleString()}
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Balance */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Balance</td>
                    {selectedAgents.map((agent) => {
                      const isBest = getBestInCategory('balance') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className="font-bold text-green-400">
                            {agent.balance?.toFixed(2) || 0} SOL
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Profit Factor */}
                  <tr className="border-b border-gray-700 hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Profit Factor</td>
                    {selectedAgents.map((agent) => {
                      const pf = agent.performance?.profitFactor || 0;
                      const isBest = getBestInCategory('profitFactor') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className={`font-bold ${pf > 2 ? 'text-green-400' : pf > 1 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {pf.toFixed(2)}
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Sharpe Ratio */}
                  <tr className="hover:bg-gray-800/30">
                    <td className="p-4 text-gray-300">Sharpe Ratio</td>
                    {selectedAgents.map((agent) => {
                      const sharpe = agent.performance?.sharpeRatio || 0;
                      const isBest = getBestInCategory('sharpeRatio') === agent.id;
                      return (
                        <td key={agent.id} className="p-4 text-center">
                          <span className={`font-bold ${getMetricColor(sharpe, 'sharpe')}`}>
                            {sharpe.toFixed(2)}
                            {isBest && ' 🏆'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Performance Chart Comparison */}
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Visual Comparison</h3>
              <div className="space-y-4">
                {['roi', 'winRate', 'sharpeRatio'].map((metric) => (
                  <div key={metric}>
                    <div className="text-sm text-gray-400 mb-2 capitalize">
                      {metric === 'roi' ? 'ROI' : metric === 'winRate' ? 'Win Rate' : 'Sharpe Ratio'}
                    </div>
                    <div className="space-y-2">
                      {selectedAgents.map((agent) => {
                        const value = getMetricValue(agent, metric);
                        const maxValue = Math.max(...selectedAgents.map(a => Math.abs(getMetricValue(a, metric))));
                        const percentage = maxValue > 0 ? (Math.abs(value) / maxValue) * 100 : 0;

                        return (
                          <div key={agent.id} className="flex items-center gap-3">
                            <div className="w-24 text-sm text-gray-300 truncate">{agent.name}</div>
                            <div className="flex-1 bg-gray-900 rounded-full h-6 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  value >= 0
                                    ? 'bg-gradient-to-r from-green-500 to-green-400'
                                    : 'bg-gradient-to-r from-red-500 to-red-400'
                                }`}
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="w-20 text-right text-sm font-semibold text-white">
                              {metric === 'roi' && (value > 0 ? '+' : '')}
                              {value.toFixed(2)}
                              {metric === 'roi' || metric === 'winRate' ? '%' : ''}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-400 mb-2">No agents selected</p>
            <p className="text-gray-500">Select agents above to start comparing</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
