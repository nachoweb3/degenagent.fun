'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction } from '@solana/web3.js';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import MatrixRain from '@/components/MatrixRain';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

export default function CreateAgent() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    purpose: '',
    riskTolerance: 5,
    tradingFrequency: 'medium',
    maxTradeSize: 10,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!publicKey) {
      setError('Please connect your wallet first');
      return;
    }

    if (!formData.name || !formData.symbol || !formData.purpose) {
      setError('All fields are required');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating agent...');

      // Call backend to prepare transaction
      const response = await axios.post(`${BACKEND_API}/agent/create`, {
        name: formData.name,
        symbol: formData.symbol,
        purpose: formData.purpose,
        creatorWallet: publicKey.toString(),
        riskTolerance: formData.riskTolerance,
        tradingFrequency: formData.tradingFrequency,
        maxTradeSize: formData.maxTradeSize,
      });

      console.log('Response:', response.data);

      const { transaction: txBase64, agentPubkey } = response.data;

      // Deserialize transaction
      const txBuffer = Buffer.from(txBase64, 'base64');
      const transaction = Transaction.from(txBuffer);

      // Send transaction
      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection);

      console.log('Transaction sent:', signature);

      // Wait for confirmation
      console.log('Waiting for confirmation...');
      await connection.confirmTransaction(signature, 'confirmed');

      console.log('Transaction confirmed!');

      // Redirect to agent page
      router.push(`/agent/${agentPubkey}`);

    } catch (err: any) {
      console.error('Error creating agent:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="relative z-10 max-w-2xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-20">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 px-2">Launch Your AI Agent</h1>
        <p className="text-sm sm:text-base text-gray-400 px-4">
          Create an autonomous trading agent powered by GPT-4 on Solana
        </p>
      </div>

      {!publicKey ? (
        <div className="bg-gray-900/50 rounded-xl p-8 sm:p-12 border border-gray-800 text-center">
          <p className="text-lg sm:text-xl mb-6">Connect your wallet to continue</p>
          <div className="[&>button]:w-full sm:[&>button]:w-auto [&>button]:min-h-[48px] [&>button]:text-base [&>button]:rounded-xl">
            <WalletMultiButton />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-900/50 rounded-xl p-5 sm:p-8 border border-gray-800">
          <div className="space-y-5 sm:space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Agent Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={32}
                placeholder="e.g. MemeKing"
                className="w-full px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base touch-manipulation"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{formData.name.length}/32 characters</p>
            </div>

            {/* Symbol */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Token Symbol <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. MKING"
                className="w-full px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all uppercase text-base touch-manipulation"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{formData.symbol.length}/10 characters</p>
            </div>

            {/* Purpose */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Agent Mission <span className="text-red-500">*</span>
              </label>
              <textarea
                maxLength={200}
                rows={4}
                placeholder="e.g. Trade trending memecoins with aggressive risk appetite to maximize short-term gains"
                className="w-full px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all resize-none text-base touch-manipulation"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              />
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{formData.purpose.length}/200 characters</p>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-700 pt-5 sm:pt-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>

              {/* Risk Tolerance */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">
                  Risk Tolerance: <span className="text-solana-purple">{formData.riskTolerance}/10</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.riskTolerance}
                  onChange={(e) => setFormData({ ...formData, riskTolerance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-solana-purple"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>

              {/* Trading Frequency */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2">
                  Trading Frequency
                </label>
                <select
                  value={formData.tradingFrequency}
                  onChange={(e) => setFormData({ ...formData, tradingFrequency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base"
                >
                  <option value="low">Low (1-2 trades/day)</option>
                  <option value="medium">Medium (3-5 trades/day)</option>
                  <option value="high">High (6-10 trades/day)</option>
                  <option value="very-high">Very High (10+ trades/day)</option>
                </select>
              </div>

              {/* Max Trade Size */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Trade Size: <span className="text-solana-purple">{formData.maxTradeSize}%</span>
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={formData.maxTradeSize}
                  onChange={(e) => setFormData({ ...formData, maxTradeSize: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-solana-purple"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum % of vault balance per trade
                </p>
              </div>
            </div>

            {/* Subagent System Info */}
            <div className="border-t border-gray-700 pt-5 sm:pt-6">
              <div className="bg-gradient-to-r from-solana-purple/10 to-solana-green/10 border-2 border-solana-purple/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🤖</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                      Powered by 3-Subagent System
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Your agent uses 3 specialized AI subagents working together for optimal trading:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-xl mb-1">📊</div>
                        <div className="text-xs font-semibold text-blue-400">Market Analyzer</div>
                        <div className="text-xs text-gray-400 mt-1">Finds opportunities</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-xl mb-1">🛡️</div>
                        <div className="text-xs font-semibold text-yellow-400">Risk Manager</div>
                        <div className="text-xs text-gray-400 mt-1">Protects your funds</div>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <div className="text-xl mb-1">⚡</div>
                        <div className="text-xs font-semibold text-purple-400">Execution Optimizer</div>
                        <div className="text-xs text-gray-400 mt-1">Best price execution</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-xl text-sm sm:text-base animate-shake">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-solana-purple hover:bg-purple-700 active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:transform-none text-white font-bold py-4 sm:py-5 px-8 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[56px]"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Agent...
                </span>
              ) : (
                'Launch Agent (0.1 SOL)'
              )}
            </button>

            <p className="text-xs sm:text-sm text-gray-500 text-center px-2">
              By creating an agent, you agree to pay the 0.1 SOL creation fee.
              You will receive 1,000,000 tokens of your agent.
            </p>
          </div>
        </form>
      )}
      </div>
    </div>
  );
}
