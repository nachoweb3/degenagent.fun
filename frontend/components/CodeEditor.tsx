'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('typescript', typescript);

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

interface CodeEditorProps {
  agentId: string;
  initialCode?: string;
  onSave?: (code: string) => void;
}

const DEFAULT_STRATEGY_TEMPLATE = `// 🤖 Your Custom Trading Strategy
// This code runs when your agent evaluates trading opportunities

interface MarketData {
  price: number;
  volume24h: number;
  priceChange24h: number;
  liquidity: number;
}

interface Position {
  amount: number;
  entryPrice: number;
}

// Your strategy function - return true to BUY, false to SKIP
export function shouldBuy(market: MarketData, position: Position | null): boolean {
  // Example: Buy if price dropped >5% and volume is high
  if (market.priceChange24h < -5 && market.volume24h > 100000) {
    return true;
  }

  // Add your own logic here!
  return false;
}

// Your sell strategy - return true to SELL, false to HOLD
export function shouldSell(market: MarketData, position: Position): boolean {
  const profit = ((market.price - position.entryPrice) / position.entryPrice) * 100;

  // Example: Take profit at +20% or stop loss at -10%
  if (profit > 20 || profit < -10) {
    return true;
  }

  return false;
}

// Risk management - how much SOL to trade (0.1 to 1.0)
export function calculatePositionSize(market: MarketData, availableBalance: number): number {
  // Start conservative
  return availableBalance * 0.1;
}`;

export default function CodeEditor({ agentId, initialCode, onSave }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_STRATEGY_TEMPLATE);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [backtesting, setBacktesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [backtestResult, setBacktestResult] = useState<any>(null);

  // Load existing strategy on mount
  useEffect(() => {
    loadStrategy();
  }, [agentId]);

  const loadStrategy = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/strategy/${agentId}`);
      if (response.data.success) {
        setCode(response.data.strategy.code);
      }
    } catch (error) {
      console.log('No existing strategy found, using template');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to backend
      const response = await axios.post(`${BACKEND_API}/strategy/save`, {
        agentId,
        name: 'Custom Strategy',
        description: 'User-defined trading strategy',
        code,
      });

      if (response.data.success) {
        alert('✅ Strategy saved! Your agent will use this code on next trade.');
        setIsEditing(false);

        // Call optional callback
        if (onSave) {
          await onSave(code);
        }
      }
    } catch (error: any) {
      const details = error.response?.data?.details || [];
      const errorMsg = details.length > 0
        ? `Validation errors:\n${details.join('\n')}`
        : error.response?.data?.error || error.message;
      alert('❌ Failed to save:\n' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const testStrategy = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await axios.post(`${BACKEND_API}/strategy/test`, {
        code,
        marketData: {
          price: 0.5,
          volume24h: 150000,
          priceChange24h: -7.5,
          liquidity: 50000,
        },
      });

      if (response.data.success && !response.data.result.error) {
        setTestResult({
          success: true,
          shouldBuy: response.data.result.shouldBuy,
          shouldSell: response.data.result.shouldSell,
          positionSize: response.data.result.positionSize,
          market: response.data.result.market,
        });
      } else {
        setTestResult({
          success: false,
          error: response.data.result.error || 'Unknown error',
        });
      }
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.response?.data?.error || error.message,
      });
    } finally {
      setTesting(false);
    }
  };

  const runBacktest = async () => {
    setBacktesting(true);
    setBacktestResult(null);

    try {
      const response = await axios.post(`${BACKEND_API}/strategy/backtest`, {
        agentId,
        code,
      });

      if (response.data.success) {
        setBacktestResult(response.data.results);
      }
    } catch (error: any) {
      setBacktestResult({
        error: error.response?.data?.error || error.message,
      });
    } finally {
      setBacktesting(false);
    }
  };

  const examples = [
    {
      name: '📈 Momentum Trader',
      desc: 'Buy on strong upward momentum',
      code: `export function shouldBuy(market: MarketData): boolean {
  return market.priceChange24h > 10 && market.volume24h > 200000;
}`,
    },
    {
      name: '🔍 Value Hunter',
      desc: 'Buy dips with good liquidity',
      code: `export function shouldBuy(market: MarketData): boolean {
  return market.priceChange24h < -15 && market.liquidity > 100000;
}`,
    },
    {
      name: '⚡ Scalper',
      desc: 'Quick profits on volatility',
      code: `export function shouldSell(market: MarketData, position: Position): boolean {
  const profit = ((market.price - position.entryPrice) / position.entryPrice) * 100;
  return profit > 3 || profit < -2; // Quick 3% profit or 2% stop
}`,
    },
  ];

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-4 border-b border-purple-500/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">⚡ Custom Trading Strategy</h3>
            <p className="text-sm text-gray-300">
              Write your own trading logic in TypeScript
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-bold transition disabled:opacity-50"
                >
                  {saving ? 'Saving...' : '💾 Save Strategy'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-bold transition"
              >
                ✏️ Edit Code
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Code Editor/Viewer */}
      <div className="p-6">
        {isEditing ? (
          <div className="space-y-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-96 bg-gray-900 text-white font-mono text-sm p-4 rounded-lg border border-gray-700 focus:border-purple-500 outline-none resize-none"
              spellCheck={false}
            />

            <div className="flex gap-3">
              <button
                onClick={testStrategy}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {testing ? '🔄 Testing...' : '🧪 Test Strategy'}
              </button>
              <button
                onClick={runBacktest}
                disabled={backtesting}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition disabled:opacity-50"
              >
                {backtesting ? '🔄 Backtesting...' : '📊 Backtest'}
              </button>
              <button
                onClick={() => setCode(DEFAULT_STRATEGY_TEMPLATE)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                🔄 Reset to Template
              </button>
            </div>

            {/* Test Results */}
            {testResult && (
              <div className={`rounded-lg p-4 border ${testResult.success ? 'bg-green-900/20 border-green-600/50' : 'bg-red-900/20 border-red-600/50'}`}>
                {testResult.success ? (
                  <div>
                    <h4 className="font-bold text-green-400 mb-3">✅ Test Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Market Price:</span>
                        <span className="text-white">${testResult.market.price}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Volume 24h:</span>
                        <span className="text-white">{testResult.market.volume24h.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Price Change:</span>
                        <span className={testResult.market.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {testResult.market.priceChange24h.toFixed(2)}%
                        </span>
                      </div>
                      <div className="border-t border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Should Buy:</span>
                          <span className={testResult.shouldBuy ? 'text-green-400 font-bold' : 'text-gray-500'}>
                            {testResult.shouldBuy ? 'YES ✓' : 'NO'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Should Sell:</span>
                          <span className={testResult.shouldSell ? 'text-red-400 font-bold' : 'text-gray-500'}>
                            {testResult.shouldSell ? 'YES ✓' : 'NO'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Position Size:</span>
                          <span className="text-purple-400 font-bold">{testResult.positionSize.toFixed(4)} SOL</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-red-400 mb-2">❌ Test Failed</h4>
                    <p className="text-sm text-red-300">{testResult.error}</p>
                  </div>
                )}
              </div>
            )}

            {/* Backtest Results */}
            {backtestResult && (
              <div className={`rounded-lg p-4 border ${backtestResult.error ? 'bg-red-900/20 border-red-600/50' : 'bg-purple-900/20 border-purple-600/50'}`}>
                {backtestResult.error ? (
                  <div>
                    <h4 className="font-bold text-red-400 mb-2">❌ Backtest Failed</h4>
                    <p className="text-sm text-red-300">{backtestResult.error}</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-purple-400 mb-3">📊 Backtest Results (100 periods)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400 mb-1">Total Trades</div>
                        <div className="text-2xl font-bold text-white">{backtestResult.totalTrades}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Win Rate</div>
                        <div className="text-2xl font-bold text-green-400">{backtestResult.winRate.toFixed(1)}%</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Total Return</div>
                        <div className={`text-2xl font-bold ${backtestResult.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestResult.totalReturn >= 0 ? '+' : ''}{backtestResult.totalReturn.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Wins</div>
                        <div className="text-xl font-bold text-green-400">{backtestResult.wins}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Losses</div>
                        <div className="text-xl font-bold text-red-400">{backtestResult.losses}</div>
                      </div>
                      <div>
                        <div className="text-gray-400 mb-1">Avg Return/Trade</div>
                        <div className={`text-xl font-bold ${backtestResult.avgReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {backtestResult.avgReturn.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-900 rounded-lg overflow-hidden">
            <SyntaxHighlighter
              language="typescript"
              style={atomOneDark}
              customStyle={{
                margin: 0,
                padding: '1.5rem',
                background: 'transparent',
                fontSize: '0.875rem',
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )}
      </div>

      {/* Strategy Examples */}
      {isEditing && (
        <div className="p-6 pt-0">
          <h4 className="text-lg font-bold text-white mb-3">📚 Quick Examples</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {examples.map((example) => (
              <button
                key={example.name}
                onClick={() => setCode(code + '\n\n' + example.code)}
                className="bg-gray-900 hover:bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-purple-500 transition text-left"
              >
                <div className="font-bold text-white mb-1">{example.name}</div>
                <div className="text-xs text-gray-400">{example.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-gray-900/50 p-4 border-t border-gray-700">
        <div className="flex items-start gap-3 text-sm text-gray-400">
          <span className="text-2xl">💡</span>
          <div>
            <strong className="text-white">Pro Tips:</strong>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Your code runs in a secure sandbox - no network access</li>
              <li>Backtest your strategy before going live</li>
              <li>Start conservative with position sizes</li>
              <li>Use stop losses to protect your capital</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
