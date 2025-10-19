'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface IndicatorsProps {
  agentId: string;
  timeframe?: string;
}

export default function TechnicalIndicators({ agentId, timeframe = '1h' }: IndicatorsProps) {
  const [indicators, setIndicators] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);

  useEffect(() => {
    fetchIndicators();
    const interval = setInterval(fetchIndicators, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [agentId, selectedTimeframe]);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${BACKEND_API}/indicators/${agentId}?timeframe=${selectedTimeframe}`
      );

      if (response.data.success) {
        setIndicators(response.data);
      }
    } catch (error) {
      console.error('Error fetching indicators:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRSIColor = (value: number) => {
    if (value > 70) return 'text-red-400';
    if (value < 30) return 'text-green-400';
    return 'text-yellow-400';
  };

  const getRSILabel = (signal: string) => {
    if (signal === 'overbought') return '⚠️ Overbought';
    if (signal === 'oversold') return '💰 Oversold';
    return '➡️ Neutral';
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'bullish') return '🚀';
    if (trend === 'bearish') return '📉';
    return '➡️';
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment === 'bullish') return 'from-green-600 to-emerald-600';
    if (sentiment === 'bearish') return 'from-red-600 to-pink-600';
    return 'from-gray-600 to-slate-600';
  };

  if (loading && !indicators) {
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

  if (!indicators?.latest) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">📊</div>
        <p className="text-gray-400">Insufficient data for technical indicators</p>
        <p className="text-sm text-gray-500 mt-2">More trading activity needed</p>
      </div>
    );
  }

  const { latest, signals } = indicators;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-white">📊 Technical Indicators</h3>
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm"
          >
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
          </select>
        </div>

        {/* Overall Sentiment */}
        <div className={`bg-gradient-to-r ${getSentimentColor(signals.overallSentiment)} rounded-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-white/80 mb-1">Overall Sentiment</div>
              <div className="text-2xl font-bold text-white capitalize">
                {getTrendIcon(signals.overallSentiment)} {signals.overallSentiment}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-white/80">Signal Breakdown</div>
              <div className="flex gap-4 mt-1">
                <span className="text-white font-semibold">🟢 {signals.buySignals}</span>
                <span className="text-white font-semibold">🔴 {signals.sellSignals}</span>
                <span className="text-white font-semibold">⚪ {signals.neutralSignals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* RSI */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">RSI (14)</div>
            <div className={`text-3xl font-bold ${getRSIColor(latest.rsi.value)} mb-2`}>
              {latest.rsi.value?.toFixed(2) || 'N/A'}
            </div>
            <div className="text-sm text-gray-300">
              {getRSILabel(latest.rsi.signal)}
            </div>
            <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getRSIColor(latest.rsi.value)}`}
                style={{ width: `${latest.rsi.value || 0}%` }}
              ></div>
            </div>
          </div>

          {/* MACD */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">MACD</div>
            <div className={`text-3xl font-bold mb-2 ${latest.macd.trend === 'bullish' ? 'text-green-400' : latest.macd.trend === 'bearish' ? 'text-red-400' : 'text-gray-400'}`}>
              {getTrendIcon(latest.macd.trend)} {latest.macd.trend}
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">MACD:</span>
                <span className="text-white">{latest.macd.macd?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Signal:</span>
                <span className="text-white">{latest.macd.signal?.toFixed(4) || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Histogram:</span>
                <span className={latest.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                  {latest.macd.histogram?.toFixed(4) || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Bollinger Bands */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Bollinger Bands</div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Upper:</span>
                <span className="text-red-400">{latest.bollingerBands.upper?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Middle:</span>
                <span className="text-yellow-400">{latest.bollingerBands.middle?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Lower:</span>
                <span className="text-green-400">{latest.bollingerBands.lower?.toFixed(6) || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-700">
                <span className="text-gray-400">%B:</span>
                <span className={`font-semibold ${latest.bollingerBands.percentB < 0.2 ? 'text-green-400' : latest.bollingerBands.percentB > 0.8 ? 'text-red-400' : 'text-yellow-400'}`}>
                  {(latest.bollingerBands.percentB * 100)?.toFixed(1) || 'N/A'}%
                </span>
              </div>
            </div>
          </div>

          {/* ATR */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">ATR (Volatility)</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {latest.atr?.toFixed(6) || 'N/A'}
            </div>
            <div className="text-sm text-gray-300">
              {latest.atr > 0.00001 ? '⚡ High Volatility' : '😴 Low Volatility'}
            </div>
          </div>

          {/* OBV */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">On-Balance Volume</div>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {latest.obv?.toLocaleString() || 'N/A'}
            </div>
            <div className="text-sm text-gray-300">
              Volume Trend Indicator
            </div>
          </div>

          {/* VWAP */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="text-sm text-gray-400 mb-2">VWAP</div>
            <div className="text-2xl font-bold text-cyan-400 mb-2">
              {latest.vwap?.toFixed(6) || 'N/A'}
            </div>
            <div className="text-sm text-gray-300">
              Volume Weighted Avg
            </div>
          </div>

          {/* Stochastic */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 md:col-span-2 lg:col-span-3">
            <div className="text-sm text-gray-400 mb-2">Stochastic Oscillator</div>
            <div className="flex gap-8">
              <div>
                <div className="text-sm text-gray-400 mb-1">%K</div>
                <div className="text-2xl font-bold text-purple-400">
                  {latest.stochastic.k?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">%D</div>
                <div className="text-2xl font-bold text-pink-400">
                  {latest.stochastic.d?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-400 mb-2">Signal</div>
                <div className="relative w-full bg-gray-700 rounded-full h-8">
                  {latest.stochastic.k && (
                    <div
                      className="absolute top-0 left-0 h-8 bg-purple-500/50 rounded-full transition-all"
                      style={{ width: `${latest.stochastic.k}%` }}
                    ></div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">
                      {latest.stochastic.k < 20 ? '💰 Oversold' : latest.stochastic.k > 80 ? '⚠️ Overbought' : '➡️ Neutral'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-6 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <div className="text-xs text-gray-400">
            <strong className="text-white">Note:</strong> Technical indicators are calculated based on historical price data ({indicators.dataPoints} data points).
            They should be used in conjunction with other analysis methods. Past performance does not guarantee future results.
          </div>
        </div>
      </div>
    </div>
  );
}
