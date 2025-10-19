'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface PerformanceProps {
  agentId: string;
}

export default function PerformanceMetrics({ agentId }: PerformanceProps) {
  const [performance, setPerformance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchPerformance();
    const interval = setInterval(fetchPerformance, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [agentId]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const [perfResponse, historyResponse] = await Promise.all([
        axios.get(`${BACKEND_API}/performance/${agentId}`).catch(() => ({ data: null })),
        axios
          .get(`${BACKEND_API}/performance/${agentId}/history?days=7`)
          .catch(() => ({ data: { history: [] } })),
      ]);

      if (perfResponse.data?.success) {
        setPerformance(perfResponse.data.performance);
      }

      if (historyResponse.data?.success) {
        setHistory(historyResponse.data.history || []);
      }
    } catch (error) {
      console.error('Error fetching performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank <= 3) return 'text-gray-300';
    if (rank <= 10) return 'text-orange-400';
    return 'text-gray-400';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    if (rank <= 10) return '🏅';
    return '📊';
  };

  const getRankChangeIcon = (change: number) => {
    if (change > 0) return '⬆️';
    if (change < 0) return '⬇️';
    return '➡️';
  };

  const getROIColor = (roi: number) => {
    if (roi > 20) return 'text-green-400';
    if (roi > 0) return 'text-green-300';
    if (roi < -20) return 'text-red-400';
    if (roi < 0) return 'text-red-300';
    return 'text-gray-400';
  };

  const getWinRateColor = (rate: number) => {
    if (rate >= 70) return 'text-green-400';
    if (rate >= 50) return 'text-yellow-400';
    if (rate >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  if (loading && !performance) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-400">No performance data available yet</p>
        <p className="text-sm text-gray-500 mt-2">Agent needs to make some trades first</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header with Rank */}
      <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Performance Metrics</h3>
            <p className="text-sm text-gray-300">
              Last updated: {new Date(performance.lastUpdated).toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-300 mb-1">Global Rank</div>
            <div className={`text-4xl font-bold ${getRankColor(performance.rank)}`}>
              {getRankBadge(performance.rank)} #{performance.rank}
            </div>
            {performance.rankChange !== 0 && (
              <div
                className={`text-sm mt-1 ${performance.rankChange > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {getRankChangeIcon(performance.rankChange)} {Math.abs(performance.rankChange)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {/* ROI */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Return on Investment</div>
            <div className={`text-3xl font-bold ${getROIColor(performance.roi)} mb-1`}>
              {performance.roi > 0 ? '+' : ''}
              {performance.roi.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-400">Total P&L: {parseFloat(performance.totalProfitLoss).toFixed(4)} SOL</div>
          </div>

          {/* Win Rate */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Win Rate</div>
            <div className={`text-3xl font-bold ${getWinRateColor(performance.winRate)} mb-1`}>
              {performance.winRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-400">
              {performance.winningTrades}W / {performance.losingTrades}L
            </div>
          </div>

          {/* Total Trades */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Total Trades</div>
            <div className="text-3xl font-bold text-blue-400 mb-1">{performance.totalTrades}</div>
            <div className="text-xs text-gray-400">All-time activity</div>
          </div>

          {/* Profit Factor */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Profit Factor</div>
            <div
              className={`text-3xl font-bold mb-1 ${performance.profitFactor > 2 ? 'text-green-400' : performance.profitFactor > 1 ? 'text-yellow-400' : 'text-red-400'}`}
            >
              {performance.profitFactor.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">
              Avg Win: {parseFloat(performance.averageProfit).toFixed(4)} SOL
            </div>
          </div>

          {/* Sharpe Ratio */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Sharpe Ratio</div>
            <div
              className={`text-3xl font-bold mb-1 ${performance.sharpeRatio > 2 ? 'text-green-400' : performance.sharpeRatio > 1 ? 'text-yellow-400' : 'text-gray-400'}`}
            >
              {performance.sharpeRatio.toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">Risk-adjusted returns</div>
          </div>

          {/* Max Drawdown */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Max Drawdown</div>
            <div className="text-3xl font-bold text-red-400 mb-1">
              -{parseFloat(performance.maxDrawdown).toFixed(4)}
            </div>
            <div className="text-xs text-gray-400">SOL</div>
          </div>
        </div>

        {/* Volume Metrics */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-6">
          <div className="text-sm text-gray-400 mb-3">Trading Volume</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">24 Hours</div>
              <div className="text-lg font-bold text-purple-400">
                {parseFloat(performance.volume24h).toFixed(2)} SOL
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">7 Days</div>
              <div className="text-lg font-bold text-blue-400">
                {parseFloat(performance.volume7d).toFixed(2)} SOL
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">30 Days</div>
              <div className="text-lg font-bold text-cyan-400">
                {parseFloat(performance.volume30d).toFixed(2)} SOL
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">All Time</div>
              <div className="text-lg font-bold text-green-400">
                {parseFloat(performance.volumeAllTime).toFixed(2)} SOL
              </div>
            </div>
          </div>
        </div>

        {/* Performance History Chart (simplified) */}
        {history.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-3">7-Day Performance History</div>
            <div className="flex items-end justify-between h-32 gap-1">
              {history.map((h, i) => {
                const maxROI = Math.max(...history.map((x) => Math.abs(x.roi)));
                const height = maxROI > 0 ? (Math.abs(h.roi) / maxROI) * 100 : 0;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full ${h.roi >= 0 ? 'bg-green-500' : 'bg-red-500'} rounded-t`}
                      style={{ height: `${height}%` }}
                      title={`${h.roi.toFixed(2)}% ROI`}
                    ></div>
                  </div>
                );
              })}
            </div>
            <div className="text-xs text-gray-500 mt-2 text-center">Daily ROI performance</div>
          </div>
        )}

        {/* Info Footer */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400">
            <strong className="text-white">Note:</strong> Performance metrics are calculated
            based on trade history and updated every 5 minutes. Rankings are based on ROI compared
            to all agents on the platform.
          </div>
        </div>
      </div>
    </div>
  );
}
