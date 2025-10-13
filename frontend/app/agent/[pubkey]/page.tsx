'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface AgentData {
  pubkey: string;
  name: string;
  purpose: string;
  tokenMint: string;
  agentWallet: string;
  vaultBalance: number;
  totalTrades: string;
  totalVolume: string;
  status: string;
  recentTrades: any[];
}

export default function AgentDashboard() {
  const params = useParams();
  const pubkey = params.pubkey as string;

  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();

  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [userTokenBalance, setUserTokenBalance] = useState<number>(0);

  useEffect(() => {
    fetchAgentData();
    const interval = setInterval(fetchAgentData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [pubkey]);

  const fetchAgentData = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/agent/${pubkey}`);
      setAgent(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching agent:', error);
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!publicKey || !depositAmount) return;

    setDepositing(true);
    try {
      const amount = parseFloat(depositAmount);

      const response = await axios.post(`${BACKEND_API}/agent/${pubkey}/deposit`, {
        amount,
        userWallet: publicKey.toString(),
      });

      const txBuffer = Buffer.from(response.data.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      setDepositAmount('');
      fetchAgentData();
      alert('Deposit successful!');

    } catch (error: any) {
      console.error('Error depositing:', error);
      alert(error.response?.data?.error || 'Failed to deposit');
    } finally {
      setDepositing(false);
    }
  };

  const handleClaimRevenue = async () => {
    if (!publicKey) return;

    setClaiming(true);
    try {
      const response = await axios.post(`${BACKEND_API}/agent/${pubkey}/claim`, {
        userWallet: publicKey.toString(),
      });

      const txBuffer = Buffer.from(response.data.transaction, 'base64');
      const transaction = Transaction.from(txBuffer);

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      fetchAgentData();
      alert('Revenue claimed successfully!');

    } catch (error: any) {
      console.error('Error claiming:', error);
      alert(error.response?.data?.error || 'Failed to claim revenue');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-solana-purple"></div>
          <div className="text-lg sm:text-xl">Loading agent...</div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-12 sm:py-20 text-center">
        <div className="text-lg sm:text-xl text-red-500">Agent not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
      {/* Header - Mobile Optimized */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
          <h1 className="text-2xl sm:text-4xl font-bold">{agent.name}</h1>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold w-fit ${
            agent.status === 'Active'
              ? 'bg-green-500/20 text-green-500 shadow-lg shadow-green-500/20'
              : 'bg-gray-500/20 text-gray-500'
          }`}>
            {agent.status}
          </span>
        </div>
        <p className="text-gray-400 text-sm sm:text-lg mb-4">{agent.purpose}</p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="text-gray-500 break-all">
            Agent: <span className="text-gray-400 font-mono">{shortenAddress(agent.agentWallet)}</span>
          </div>
          <div className="text-gray-500 break-all">
            Token: <span className="text-gray-400 font-mono">{shortenAddress(agent.tokenMint)}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <StatCard label="Vault Balance" value={`${agent.vaultBalance.toFixed(4)} SOL`} highlight />
        <StatCard label="Total Trades" value={agent.totalTrades} />
        <StatCard label="Total Volume" value={`$${agent.totalVolume}`} />
        <StatCard label="Win Rate" value="N/A" />
      </div>

      {/* Actions - Mobile First */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Deposit Card */}
        <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Fund Agent</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            Deposit SOL to enable autonomous trading
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="Amount in SOL"
              className="flex-1 px-4 py-3 sm:py-4 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base touch-manipulation"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            {publicKey ? (
              <button
                onClick={handleDeposit}
                disabled={depositing || !depositAmount}
                className="bg-solana-purple hover:bg-purple-700 active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:transform-none text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[48px] whitespace-nowrap"
              >
                {depositing ? 'Depositing...' : 'Deposit'}
              </button>
            ) : (
              <div className="[&>button]:w-full sm:[&>button]:w-auto [&>button]:min-h-[48px] [&>button]:rounded-xl">
                <WalletMultiButton />
              </div>
            )}
          </div>
        </div>

        {/* Claim Revenue Card */}
        <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Claim Revenue</h2>
          <p className="text-sm sm:text-base text-gray-400 mb-4">
            Token holders earn share of profits
          </p>
          <div className="flex flex-col gap-3">
            <div className="text-sm text-gray-500">
              Your Tokens: <span className="text-solana-green font-bold">{userTokenBalance.toLocaleString()}</span>
            </div>
            {publicKey ? (
              <button
                onClick={handleClaimRevenue}
                disabled={claiming || userTokenBalance === 0}
                className="w-full bg-solana-green hover:bg-green-600 active:scale-95 disabled:bg-gray-700 disabled:cursor-not-allowed disabled:transform-none text-white font-bold py-3 sm:py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl touch-manipulation min-h-[48px]"
              >
                {claiming ? 'Claiming...' : 'Claim Revenue'}
              </button>
            ) : (
              <div className="[&>button]:w-full [&>button]:min-h-[48px] [&>button]:rounded-xl">
                <WalletMultiButton />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800 mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Performance Overview</h2>
        <div className="h-48 sm:h-64 flex items-end justify-around gap-2 sm:gap-4 pb-4">
          {[65, 78, 82, 71, 88, 92, 85].map((value, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-solana-purple/20 rounded-t-lg relative overflow-hidden" style={{ height: `${value}%` }}>
                <div className="absolute bottom-0 w-full bg-solana-purple rounded-t-lg transition-all duration-500" style={{ height: '100%' }}></div>
              </div>
              <span className="text-xs text-gray-500">D{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Trades - Mobile Optimized */}
      <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold">Recent Trades</h2>
          <span className="text-xs sm:text-sm text-gray-500">{agent.recentTrades.length} trades</span>
        </div>
        {agent.recentTrades.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="text-4xl sm:text-6xl mb-4 opacity-50">📊</div>
            <p className="text-sm sm:text-base text-gray-500">No trades yet. Fund your agent to start trading!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {agent.recentTrades.map((trade, idx) => (
              <TradeCard key={idx} trade={trade} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`bg-gray-900/50 rounded-xl p-4 sm:p-6 border transition-all ${
      highlight
        ? 'border-solana-purple shadow-lg shadow-solana-purple/20'
        : 'border-gray-800'
    }`}>
      <div className="text-gray-500 text-xs sm:text-sm mb-1">{label}</div>
      <div className={`text-lg sm:text-2xl font-bold ${highlight ? 'text-solana-purple' : 'text-solana-green'}`}>
        {value}
      </div>
    </div>
  );
}

function TradeCard({ trade }: { trade: any }) {
  return (
    <div className="bg-gray-800/50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-800/70 transition-all">
      <div className="flex-1">
        <div className="font-mono text-xs sm:text-sm text-gray-400 mb-1">
          {shortenAddress(trade.signature)}
        </div>
        <div className="text-xs sm:text-sm text-gray-500">
          {trade.timestamp ? new Date(trade.timestamp * 1000).toLocaleString() : 'N/A'}
        </div>
      </div>
      <a
        href={`https://explorer.solana.com/tx/${trade.signature}?cluster=devnet`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-solana-purple hover:text-purple-400 font-medium text-sm sm:text-base whitespace-nowrap touch-manipulation active:scale-95 transition-all"
      >
        View Explorer →
      </a>
    </div>
  );
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}
