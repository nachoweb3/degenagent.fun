'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface BondingCurveData {
  tokensSold: string;
  totalValueLocked: string;
  graduated: boolean;
  stats: {
    currentPrice: number;
    tokensSold: number;
    tokensRemaining: number;
    progress: number;
    totalValueLocked: number;
    canGraduate: boolean;
  };
}

interface Trade {
  id: string;
  type: 'buy' | 'sell';
  trader: string;
  tokenAmount: string;
  solAmount: string;
  pricePerToken: string;
  createdAt: string;
}

export default function BondingCurveTrading({ agentId }: { agentId: string }) {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [bondingCurve, setBondingCurve] = useState<BondingCurveData | null>(null);
  const [recentTrades, setRecentTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  // Trade state
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [trading, setTrading] = useState(false);

  useEffect(() => {
    fetchBondingCurve();
  }, [agentId]);

  useEffect(() => {
    if (amount && parseFloat(amount) > 0) {
      const debounce = setTimeout(() => {
        fetchQuote();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setQuote(null);
    }
  }, [amount, tradeType]);

  const fetchBondingCurve = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/bonding-curve/${agentId}`);
      if (response.data.success) {
        setBondingCurve(response.data.bondingCurve);
        setRecentTrades(response.data.recentTrades || []);
      }
    } catch (error) {
      console.error('Error fetching bonding curve:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuote = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    try {
      setQuoteLoading(true);
      const endpoint = tradeType === 'buy' ? '/bonding-curve/quote-buy' : '/bonding-curve/quote-sell';
      const response = await axios.post(`${BACKEND_API}${endpoint}`, {
        agentId,
        amount: parseFloat(amount),
      });

      if (response.data.success) {
        setQuote(response.data.quote);
      }
    } catch (error: any) {
      console.error('Error fetching quote:', error);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  const executeTrade = async () => {
    if (!publicKey || !amount || !quote) return;

    try {
      setTrading(true);

      if (tradeType === 'buy') {
        // Get transaction from backend
        const response = await axios.post(`${BACKEND_API}/bonding-curve/buy`, {
          agentId,
          amount: parseFloat(amount),
          buyerWallet: publicKey.toString(),
        });

        // Deserialize and send transaction
        const txBuffer = Buffer.from(response.data.transaction, 'base64');
        const transaction = Transaction.from(txBuffer);

        const signature = await sendTransaction(transaction, connection);
        console.log('Transaction sent:', signature);

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');

        // Confirm with backend
        await axios.post(`${BACKEND_API}/bonding-curve/confirm-buy`, {
          agentId,
          amount: parseFloat(amount),
          signature,
          buyerWallet: publicKey.toString(),
        });

        alert(`Successfully bought ${amount} tokens!`);
      } else {
        // Sell functionality (similar to buy)
        alert('Sell functionality coming soon!');
      }

      // Refresh data
      setAmount('');
      setQuote(null);
      await fetchBondingCurve();

    } catch (error: any) {
      console.error('Error executing trade:', error);
      alert(error.response?.data?.error || error.message || 'Trade failed');
    } finally {
      setTrading(false);
    }
  };

  const formatSOL = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (num === 0) return '0';
    if (num < 0.001) return num.toExponential(4);
    return num.toFixed(6);
  };

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
    return num.toFixed(0);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-400">Loading bonding curve...</p>
      </div>
    );
  }

  if (!bondingCurve) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center">
        <p className="text-gray-400">Bonding curve not available</p>
      </div>
    );
  }

  if (bondingCurve.graduated) {
    return (
      <div className="bg-gray-800 rounded-xl p-8 text-center border-2 border-green-500">
        <div className="text-6xl mb-4">🎓</div>
        <h3 className="text-2xl font-bold text-green-400 mb-2">Graduated to Raydium!</h3>
        <p className="text-gray-400 mb-4">
          This token has completed its bonding curve and graduated to Raydium DEX
        </p>
        {bondingCurve && (
          <a
            href={`https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${bondingCurve}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 transition"
          >
            Trade on Raydium →
          </a>
        )}
      </div>
    );
  }

  const stats = bondingCurve.stats;

  return (
    <div className="space-y-6">
      {/* Bonding Curve Stats */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-bold text-white mb-4">Bonding Curve</h3>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>Progress to Graduation</span>
            <span>{stats.progress.toFixed(2)}%</span>
          </div>
          <div className="bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-purple-500 via-pink-500 to-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {formatNumber(stats.tokensRemaining)} tokens remaining until Raydium
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Current Price</div>
            <div className="text-lg font-bold text-green-400">{formatSOL(stats.currentPrice)} SOL</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Total Sold</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.tokensSold)}</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">TVL</div>
            <div className="text-lg font-bold text-purple-400">{formatSOL(stats.totalValueLocked)} SOL</div>
          </div>
          <div className="bg-gray-900 rounded-lg p-4">
            <div className="text-gray-400 text-xs mb-1">Available</div>
            <div className="text-lg font-bold text-white">{formatNumber(stats.tokensRemaining)}</div>
          </div>
        </div>
      </div>

      {/* Trading Interface */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTradeType('buy')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              tradeType === 'buy'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Buy
          </button>
          <button
            onClick={() => setTradeType('sell')}
            className={`flex-1 py-3 rounded-lg font-semibold transition ${
              tradeType === 'sell'
                ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            Sell
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">
            Amount of tokens to {tradeType}
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            className="w-full bg-gray-900 text-white text-2xl rounded-lg px-4 py-4 border border-gray-700 focus:border-purple-500 outline-none"
            disabled={!publicKey}
          />
          <div className="flex gap-2 mt-2">
            {[100_000, 500_000, 1_000_000, 5_000_000].map((preset) => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs py-2 rounded transition"
                disabled={!publicKey}
              >
                {formatNumber(preset)}
              </button>
            ))}
          </div>
        </div>

        {/* Quote Display */}
        {quoteLoading ? (
          <div className="bg-gray-900 rounded-lg p-4 mb-4">
            <div className="text-center text-gray-400">Calculating quote...</div>
          </div>
        ) : quote ? (
          <div className="bg-gray-900 rounded-lg p-4 mb-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">You {tradeType === 'buy' ? 'pay' : 'receive'}:</span>
              <span className="text-white font-semibold">
                {formatSOL(tradeType === 'buy' ? quote.totalCostSOL : quote.netProceedsSOL)} SOL
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per token:</span>
              <span className="text-white font-semibold">{formatSOL(quote.pricePerToken)} SOL</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price impact:</span>
              <span className={`font-semibold ${quote.priceImpact > 5 ? 'text-red-400' : 'text-green-400'}`}>
                {quote.priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform fee (1%):</span>
              <span className="text-gray-400">{formatSOL(quote.platformFee)} SOL</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-300 font-semibold">New price:</span>
                <span className="text-purple-400 font-semibold">{formatSOL(quote.newPrice)} SOL</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Trade Button */}
        {!publicKey ? (
          <button
            disabled
            className="w-full bg-gray-700 text-gray-400 py-4 rounded-lg font-bold cursor-not-allowed"
          >
            Connect Wallet to Trade
          </button>
        ) : (
          <button
            onClick={executeTrade}
            disabled={!quote || trading || !amount || parseFloat(amount) <= 0}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white py-4 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95"
          >
            {trading ? 'Processing...' : `${tradeType === 'buy' ? 'Buy' : 'Sell'} Tokens`}
          </button>
        )}
      </div>

      {/* Recent Trades */}
      {recentTrades.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold text-white mb-4">Recent Trades</h3>
          <div className="space-y-2">
            {recentTrades.slice(0, 10).map((trade) => (
              <div
                key={trade.id}
                className="flex items-center justify-between bg-gray-900 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${trade.type === 'buy' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div>
                    <div className="text-sm font-semibold text-white">
                      {trade.type === 'buy' ? 'Buy' : 'Sell'} {formatNumber(parseFloat(trade.tokenAmount))} tokens
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(trade.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">{formatSOL(trade.solAmount)} SOL</div>
                  <div className="text-xs text-gray-400">{formatSOL(trade.pricePerToken)} per token</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
