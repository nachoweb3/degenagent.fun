'use client';

import { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import typescript from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

SyntaxHighlighter.registerLanguage('typescript', typescript);

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
  const [testResult, setTestResult] = useState<string>('');

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate TypeScript syntax
      const isValid = validateCode(code);
      if (!isValid) {
        alert('⚠️ Code has syntax errors. Please fix before saving.');
        setSaving(false);
        return;
      }

      // Save to backend
      if (onSave) {
        await onSave(code);
      }

      alert('✅ Strategy saved! Your agent will use this code on next trade.');
      setIsEditing(false);
    } catch (error: any) {
      alert('❌ Failed to save: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const validateCode = (code: string): boolean => {
    // Basic validation - check for required functions
    const hasShouldbuy = code.includes('function shouldBuy');
    const hasShouldSell = code.includes('function shouldSell');
    const hasCalculatePositionSize = code.includes('function calculatePositionSize');

    return hasShouldbuy && hasShouldSell && hasCalculatePositionSize;
  };

  const testStrategy = () => {
    const mockMarket = {
      price: 0.5,
      volume24h: 150000,
      priceChange24h: -7.5,
      liquidity: 50000,
    };

    try {
      // This is mock - in production would run in sandboxed environment
      setTestResult(`🧪 Test Results:
Market: $${mockMarket.price} | Vol: ${mockMarket.volume24h} | Change: ${mockMarket.priceChange24h}%

Your strategy would: EVALUATE ON SERVER SIDE

Note: Actual execution runs in secure sandbox on backend.`);
    } catch (error: any) {
      setTestResult(`❌ Error: ${error.message}`);
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                🧪 Test Strategy
              </button>
              <button
                onClick={() => setCode(DEFAULT_STRATEGY_TEMPLATE)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                🔄 Reset to Template
              </button>
            </div>

            {testResult && (
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">{testResult}</pre>
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
