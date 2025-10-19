'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ISeriesApi, ColorType } from 'lightweight-charts';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  marketCap: number;
  trades: number;
}

interface ChartStats {
  currentPrice: number;
  marketCap: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  totalTrades: number;
}

interface PriceChartProps {
  agentId: string;
}

const TIMEFRAMES = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '1h', label: '1h' },
  { value: '4h', label: '4h' },
  { value: '1d', label: '1d' },
];

export default function PriceChart({ agentId }: PriceChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);

  const [timeframe, setTimeframe] = useState('1h');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [stats, setStats] = useState<ChartStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { type: ColorType.Solid, color: '#1f2937' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: '#374151' },
        horzLines: { color: '#374151' },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#374151',
      },
      rightPriceScale: {
        borderColor: '#374151',
      },
    });

    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  // Fetch chart data
  useEffect(() => {
    fetchChartData();
    const interval = setInterval(fetchChartData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [agentId, timeframe]);

  // Update chart when data changes
  useEffect(() => {
    if (!candlestickSeriesRef.current || candles.length === 0) return;

    const formattedData = candles.map((candle) => ({
      time: new Date(candle.timestamp).getTime() / 1000 as any,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeriesRef.current.setData(formattedData as any);

    // Auto-fit content
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BACKEND_API}/chart/${agentId}`, {
        params: { timeframe, limit: 100 },
      });

      if (response.data.success) {
        setCandles(response.data.data.candles);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOL = (amount: number) => {
    if (amount === 0) return '0';
    if (amount < 0.001) return amount.toExponential(4);
    return amount.toFixed(6);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Stats Header */}
      <div className="p-4 sm:p-6 border-b border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Current Price */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Price</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {stats ? formatSOL(stats.currentPrice) : '...'} SOL
            </div>
            {stats && stats.priceChangePercent24h !== 0 && (
              <div
                className={`text-xs font-semibold ${
                  stats.priceChangePercent24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {stats.priceChangePercent24h >= 0 ? '+' : ''}
                {stats.priceChangePercent24h.toFixed(2)}% (24h)
              </div>
            )}
          </div>

          {/* Market Cap */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Market Cap</div>
            <div className="text-lg sm:text-xl font-bold text-purple-400">
              ${stats ? formatNumber(stats.marketCap) : '...'}
            </div>
          </div>

          {/* 24h Change */}
          <div>
            <div className="text-xs text-gray-400 mb-1">24h Change</div>
            <div
              className={`text-lg sm:text-xl font-bold ${
                stats && stats.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {stats ? (stats.priceChange24h >= 0 ? '+' : '') : ''}
              {stats ? formatSOL(Math.abs(stats.priceChange24h)) : '...'} SOL
            </div>
          </div>

          {/* Total Trades */}
          <div>
            <div className="text-xs text-gray-400 mb-1">Total Trades</div>
            <div className="text-lg sm:text-xl font-bold text-white">
              {stats ? formatNumber(stats.totalTrades) : '...'}
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-700 flex gap-2 overflow-x-auto">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition whitespace-nowrap ${
              timeframe === tf.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50 z-10">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
          </div>
        )}
        <div ref={chartContainerRef} className="w-full" />
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-700 flex gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-gray-400">Bullish (Buy Pressure)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-400">Bearish (Sell Pressure)</span>
        </div>
      </div>
    </div>
  );
}
