'use client';

import { useState, useEffect } from 'react';

interface SubagentStatus {
  name: string;
  icon: string;
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  output: string;
  color: string;
}

export default function SubagentSystem({ agentPubkey }: { agentPubkey: string }) {
  const [subagents, setSubagents] = useState<SubagentStatus[]>([
    {
      name: 'Market Analyzer',
      icon: '📊',
      status: 'idle',
      output: 'Waiting for trading cycle...',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Risk Manager',
      icon: '🛡️',
      status: 'idle',
      output: 'Waiting for opportunities...',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'Execution Optimizer',
      icon: '⚡',
      status: 'idle',
      output: 'Standing by...',
      color: 'from-purple-500 to-pink-500'
    }
  ]);

  const [cycleActive, setCycleActive] = useState(false);

  // Simulate subagent activity (replace with real API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!cycleActive) return;

      // Market Analyzer phase
      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 0 ? { ...s, status: 'analyzing', output: 'Scanning 5 tokens... Analyzing market sentiment...' } : s
        ));
      }, 1000);

      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 0 ? { ...s, status: 'complete', output: '✅ Found 3 opportunities. Best: BUY WIF (+15% expected)' } : s
        ));
      }, 3000);

      // Risk Manager phase
      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 1 ? { ...s, status: 'analyzing', output: 'Evaluating trade risk... Calculating position size...' } : s
        ));
      }, 4000);

      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 1 ? { ...s, status: 'complete', output: '✅ Risk: MEDIUM. Max Position: 8%. APPROVED ✓' } : s
        ));
      }, 6000);

      // Execution Optimizer phase
      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 2 ? { ...s, status: 'analyzing', output: 'Optimizing entry price... Checking liquidity...' } : s
        ));
      }, 7000);

      setTimeout(() => {
        setSubagents(prev => prev.map((s, i) =>
          i === 2 ? { ...s, status: 'complete', output: '✅ Entry: $2.45 | Slippage: 1.2% | EXECUTING...' } : s
        ));
        setCycleActive(false);
      }, 9000);

    }, 10000);

    return () => clearInterval(interval);
  }, [cycleActive]);

  const startCycle = () => {
    setCycleActive(true);
    setSubagents(prev => prev.map(s => ({ ...s, status: 'idle', output: 'Starting trading cycle...' })));
  };

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">🤖 3-Subagent System</h3>
          <p className="text-sm text-gray-400">
            Advanced AI collaboration for optimal trading decisions
          </p>
        </div>
        <button
          onClick={startCycle}
          disabled={cycleActive}
          className="bg-solana-purple hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all"
        >
          {cycleActive ? '⏳ Running...' : '▶️ Start Cycle'}
        </button>
      </div>

      <div className="space-y-4">
        {subagents.map((subagent, index) => (
          <div
            key={index}
            className={`bg-gray-800/50 border-2 rounded-xl p-4 transition-all ${
              subagent.status === 'analyzing'
                ? 'border-solana-purple shadow-lg shadow-solana-purple/20 animate-pulse'
                : subagent.status === 'complete'
                ? 'border-solana-green'
                : 'border-gray-700'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`text-4xl w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br ${subagent.color} ${
                  subagent.status === 'analyzing' ? 'animate-spin' : ''
                }`}
              >
                {subagent.icon}
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-bold text-lg">{subagent.name}</h4>
                  <StatusBadge status={subagent.status} />
                </div>

                <div className="bg-black/50 rounded-lg p-3 font-mono text-sm">
                  <TypewriterText
                    text={subagent.output}
                    isActive={subagent.status === 'analyzing'}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-gradient-to-r from-solana-purple/10 to-solana-green/10 border border-solana-purple/30 rounded-xl p-4">
        <h4 className="font-semibold mb-2 text-solana-purple">💡 How it works:</h4>
        <ul className="space-y-1 text-sm text-gray-300">
          <li>• <strong>Market Analyzer</strong> finds the best trading opportunities</li>
          <li>• <strong>Risk Manager</strong> ensures safe position sizing and stop-loss</li>
          <li>• <strong>Execution Optimizer</strong> gets you the best price with minimal slippage</li>
        </ul>
        <p className="text-xs text-gray-500 mt-3">
          All 3 subagents must approve before any trade executes. Your funds stay safe.
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SubagentStatus['status'] }) {
  const colors = {
    idle: 'bg-gray-700 text-gray-300',
    analyzing: 'bg-solana-purple text-white animate-pulse',
    complete: 'bg-solana-green text-black',
    error: 'bg-red-500 text-white'
  };

  const labels = {
    idle: 'IDLE',
    analyzing: 'ANALYZING...',
    complete: 'COMPLETE',
    error: 'ERROR'
  };

  return (
    <span className={`${colors[status]} text-xs font-bold px-3 py-1 rounded-full`}>
      {labels[status]}
    </span>
  );
}

function TypewriterText({ text, isActive }: { text: string; isActive: boolean }) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (isActive) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 30);
      return () => clearInterval(timer);
    } else {
      setDisplayText(text);
    }
  }, [text, isActive]);

  return (
    <span className="text-solana-green">
      {displayText}
      {isActive && <span className="animate-pulse">▊</span>}
    </span>
  );
}
