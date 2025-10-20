'use client';

import { useState, useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';

interface SubagentActivity {
  agentId: string;
  agentName: string;
  phase: 'start' | 'market_analysis' | 'risk_assessment' | 'execution_optimization' | 'complete';
  subagent?: 'market' | 'risk' | 'execution';
  message: string;
  data?: any;
  timestamp: string;
}

interface SubagentStats {
  agentId: string;
  agentName: string;
  totalDecisions: number;
  completedDecisions: number;
  successCount: number;
  failCount: number;
  successRate: string;
  totalProfit: string;
  avgProfit: string;
}

export default function SubagentDashboard({ agentId }: { agentId?: string }) {
  const [activities, setActivities] = useState<SubagentActivity[]>([]);
  const [stats, setStats] = useState<SubagentStats | null>(null);
  const [currentPhase, setCurrentPhase] = useState<string>('idle');

  const { lastMessage, isConnected } = useWebSocket();

  // Fetch stats on mount
  useEffect(() => {
    if (agentId) {
      fetchStats();
    }
  }, [agentId]);

  const fetchStats = async () => {
    if (!agentId) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api'}/subagent/${agentId}/stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.subagentStats);
      }
    } catch (error) {
      console.error('Error fetching subagent stats:', error);
    }
  };

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'subagent_activity') {
      const activity = lastMessage.data as SubagentActivity;

      // Filter by agentId if specified
      if (!agentId || activity.agentId === agentId) {
        setActivities(prev => [...prev.slice(-9), activity]); // Keep last 10
        setCurrentPhase(activity.phase);

        // Refresh stats when cycle completes
        if (activity.phase === 'complete') {
          setTimeout(fetchStats, 1000);
        }
      }
    }
  }, [lastMessage, agentId]);

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'start': return '🤖';
      case 'market_analysis': return '📊';
      case 'risk_assessment': return '🛡️';
      case 'execution_optimization': return '⚡';
      case 'complete': return '✅';
      default: return '💤';
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'start': return 'from-blue-500 to-cyan-500';
      case 'market_analysis': return 'from-purple-500 to-pink-500';
      case 'risk_assessment': return 'from-yellow-500 to-orange-500';
      case 'execution_optimization': return 'from-green-500 to-emerald-500';
      case 'complete': return 'from-green-600 to-green-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSubagentName = (subagent?: string) => {
    switch (subagent) {
      case 'market': return 'Market Analyzer';
      case 'risk': return 'Risk Manager';
      case 'execution': return 'Execution Optimizer';
      default: return 'System';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            Subagent System
          </h2>
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Performance Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Total Profit</p>
              <p className={`text-2xl font-bold ${parseFloat(stats.totalProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(stats.totalProfit) >= 0 ? '+' : ''}{stats.totalProfit}%
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Decisions</p>
              <p className="text-2xl font-bold text-white">{stats.totalDecisions}</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-xs text-gray-500 mb-1">Avg Profit</p>
              <p className={`text-2xl font-bold ${parseFloat(stats.avgProfit) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {parseFloat(stats.avgProfit) >= 0 ? '+' : ''}{stats.avgProfit}%
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Current Phase Indicator */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Current Status</h3>
        <div className={`bg-gradient-to-r ${getPhaseColor(currentPhase)} p-6 rounded-xl text-center`}>
          <div className="text-6xl mb-3">{getPhaseIcon(currentPhase)}</div>
          <div className="text-xl font-bold text-white capitalize">
            {currentPhase === 'idle' ? 'Waiting for Next Cycle' : currentPhase.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold mb-4">Activity Log</h3>

        {activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-3">💤</div>
            <p>No recent activity</p>
            <p className="text-sm mt-1">Subagents will appear here when they start working</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors"
              >
                {/* Icon */}
                <div className="text-2xl flex-shrink-0">
                  {getPhaseIcon(activity.phase)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {activity.subagent && (
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-medium">
                        {getSubagentName(activity.subagent)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{activity.message}</p>

                  {/* Additional Data */}
                  {activity.data && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(activity.data).map(([key, value]) => (
                        <span
                          key={key}
                          className="text-xs px-2 py-1 bg-gray-900/50 rounded text-gray-400"
                        >
                          {key}: <span className="text-white">{String(value)}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Subagent Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market Analyzer */}
        <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-5">
          <div className="text-3xl mb-3">📊</div>
          <h4 className="text-lg font-bold text-purple-400 mb-2">Market Analyzer</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Scans markets 24/7, analyzes sentiment, volume, and price action.
            Learns from past successful patterns to find the best opportunities.
          </p>
          {stats && (
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <p className="text-xs text-purple-300">
                Learning from {stats.completedDecisions} past decisions
              </p>
            </div>
          )}
        </div>

        {/* Risk Manager */}
        <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-5">
          <div className="text-3xl mb-3">🛡️</div>
          <h4 className="text-lg font-bold text-yellow-400 mb-2">Risk Manager</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Evaluates every trade for risk. Checks position size, volatility, liquidity.
            Adapts limits based on agent's success rate.
          </p>
          {stats && (
            <div className="mt-3 pt-3 border-t border-yellow-500/20">
              <p className="text-xs text-yellow-300">
                {stats.successRate}% approval accuracy
              </p>
            </div>
          )}
        </div>

        {/* Execution Optimizer */}
        <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-5">
          <div className="text-3xl mb-3">⚡</div>
          <h4 className="text-lg font-bold text-green-400 mb-2">Execution Optimizer</h4>
          <p className="text-sm text-gray-400 leading-relaxed">
            Optimizes trade execution for best price. Monitors slippage, gas fees,
            and timing to maximize profits on every transaction.
          </p>
          {stats && (
            <div className="mt-3 pt-3 border-t border-green-500/20">
              <p className="text-xs text-green-300">
                Avg {stats.avgProfit}% profit per trade
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
