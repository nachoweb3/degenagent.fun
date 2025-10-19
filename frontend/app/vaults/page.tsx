'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import axios from 'axios';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface Vault {
  id: string;
  name: string;
  description: string;
  strategy: 'conservative' | 'balanced' | 'aggressive';
  currentAPY: number;
  totalValueLocked: string;
  minDeposit: string;
  depositFee: number;
  withdrawalFee: number;
  performanceFee: number;
  lockPeriod: number;
  riskLevel: number;
  totalDepositors: number;
  utilizationRate: string;
  dailyReturn: string;
  available: string;
}

export default function VaultsPage() {
  const { publicKey } = useWallet();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);

  useEffect(() => {
    fetchVaults();
  }, []);

  const fetchVaults = async () => {
    try {
      const response = await axios.get(`${BACKEND_API}/vaults`);
      setVaults(response.data.vaults);
    } catch (error) {
      console.error('Error fetching vaults:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'conservative': return 'from-green-500 to-emerald-600';
      case 'balanced': return 'from-blue-500 to-cyan-600';
      case 'aggressive': return 'from-red-500 to-orange-600';
      default: return 'from-purple-500 to-pink-600';
    }
  };

  const getRiskBadge = (risk: number) => {
    if (risk <= 3) return { text: 'Low Risk', color: 'bg-green-500' };
    if (risk <= 6) return { text: 'Medium Risk', color: 'bg-yellow-500' };
    return { text: 'High Risk', color: 'bg-red-500' };
  };

  const handleDeposit = async () => {
    if (!publicKey || !selectedVault || !depositAmount) return;

    try {
      const response = await axios.post(`${BACKEND_API}/vaults/deposit`, {
        vaultId: selectedVault.id,
        userWallet: publicKey.toString(),
        amount: depositAmount,
      });

      alert(response.data.message);
      setShowDepositModal(false);
      setDepositAmount('');
      fetchVaults();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to deposit');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">💰 APY Vaults</h1>
              <p className="text-gray-400">Earn passive income with AI-powered trading vaults</p>
            </div>
            <WalletMultiButton />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Total Value Locked</div>
              <div className="text-2xl font-bold text-white">
                {vaults.reduce((sum, v) => sum + parseFloat(v.totalValueLocked), 0).toFixed(2)} SOL
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Total Depositors</div>
              <div className="text-2xl font-bold text-white">
                {vaults.reduce((sum, v) => sum + v.totalDepositors, 0)}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Avg APY</div>
              <div className="text-2xl font-bold text-green-400">
                {(vaults.reduce((sum, v) => sum + v.currentAPY, 0) / vaults.length || 0).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-sm">Active Vaults</div>
              <div className="text-2xl font-bold text-white">{vaults.length}</div>
            </div>
          </div>
        </div>

        {/* Vaults Grid */}
        {loading ? (
          <div className="text-center py-12 text-white">Loading vaults...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaults.map((vault) => {
              const riskBadge = getRiskBadge(vault.riskLevel);
              return (
                <div
                  key={vault.id}
                  className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all hover:shadow-xl hover:shadow-purple-500/20"
                >
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-r ${getStrategyColor(vault.strategy)} p-6`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white">{vault.name}</h3>
                      <span className={`${riskBadge.color} text-white text-xs px-2 py-1 rounded`}>
                        {riskBadge.text}
                      </span>
                    </div>
                    <p className="text-white/90 text-sm">{vault.description}</p>
                  </div>

                  {/* Stats */}
                  <div className="p-6">
                    {/* APY - Big and Prominent */}
                    <div className="bg-gray-900 rounded-lg p-4 mb-4">
                      <div className="text-gray-400 text-sm mb-1">Current APY</div>
                      <div className="text-4xl font-bold text-green-400">{vault.currentAPY}%</div>
                      <div className="text-gray-500 text-xs mt-1">≈ {vault.dailyReturn}% daily</div>
                    </div>

                    {/* Other Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <div className="text-gray-400 text-xs">TVL</div>
                        <div className="text-white font-semibold">{parseFloat(vault.totalValueLocked).toFixed(2)} SOL</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Min Deposit</div>
                        <div className="text-white font-semibold">{vault.minDeposit} SOL</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Lock Period</div>
                        <div className="text-white font-semibold">{vault.lockPeriod} days</div>
                      </div>
                      <div>
                        <div className="text-gray-400 text-xs">Depositors</div>
                        <div className="text-white font-semibold">{vault.totalDepositors}</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Capacity</span>
                        <span>{vault.utilizationRate}%</span>
                      </div>
                      <div className="bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                          style={{ width: `${Math.min(parseFloat(vault.utilizationRate), 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Fees */}
                    <div className="text-xs text-gray-400 mb-4">
                      <div className="flex justify-between">
                        <span>Deposit Fee:</span>
                        <span>{vault.depositFee}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Withdrawal Fee:</span>
                        <span>{vault.withdrawalFee}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Performance Fee:</span>
                        <span>{vault.performanceFee}%</span>
                      </div>
                    </div>

                    {/* Deposit Button */}
                    <button
                      onClick={() => {
                        setSelectedVault(vault);
                        setShowDepositModal(true);
                      }}
                      disabled={!publicKey}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition-all"
                    >
                      {publicKey ? 'Deposit' : 'Connect Wallet'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Deposit Modal */}
        {showDepositModal && selectedVault && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">Deposit to {selectedVault.name}</h3>

              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Amount (SOL)</label>
                <input
                  type="number"
                  step="0.1"
                  min={selectedVault.minDeposit}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full bg-gray-900 text-white rounded-lg px-4 py-3 border border-gray-700 focus:border-purple-500 outline-none"
                  placeholder={`Min: ${selectedVault.minDeposit} SOL`}
                />
              </div>

              {depositAmount && (
                <div className="bg-gray-900 rounded-lg p-4 mb-4 text-sm">
                  <div className="flex justify-between text-gray-400 mb-2">
                    <span>Estimated Annual Return:</span>
                    <span className="text-green-400 font-semibold">
                      {(parseFloat(depositAmount) * (selectedVault.currentAPY / 100)).toFixed(4)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Deposit Fee:</span>
                    <span>{(parseFloat(depositAmount) * (selectedVault.depositFee / 100)).toFixed(4)} SOL</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) < parseFloat(selectedVault.minDeposit)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white py-3 rounded-lg font-semibold transition"
                >
                  Confirm Deposit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
