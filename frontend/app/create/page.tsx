'use client';

import { useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction, Keypair } from '@solana/web3.js';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import MatrixRain from '@/components/MatrixRain';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

const COLOR_THEMES = [
  { name: 'Purple', from: 'from-purple-500', to: 'to-pink-500', border: 'border-purple-500' },
  { name: 'Blue', from: 'from-blue-500', to: 'to-cyan-500', border: 'border-blue-500' },
  { name: 'Green', from: 'from-green-500', to: 'to-emerald-500', border: 'border-green-500' },
  { name: 'Orange', from: 'from-orange-500', to: 'to-red-500', border: 'border-orange-500' },
  { name: 'Yellow', from: 'from-yellow-500', to: 'to-orange-500', border: 'border-yellow-500' },
  { name: 'Pink', from: 'from-pink-500', to: 'to-rose-500', border: 'border-pink-500' },
];

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
    colorTheme: 0,
    website: '',
    telegram: '',
    twitter: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
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

    if (!imagePreview) {
      setError('Please upload an agent image');
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
        imageData: imagePreview, // Send base64 image
        website: formData.website || undefined,
        telegram: formData.telegram || undefined,
        twitter: formData.twitter || undefined,
      });

      console.log('Response:', response.data);

      const { transaction: txBase64, agentId, agentPubkey, tokenMintKeypair, blockhash, lastValidBlockHeight } = response.data;

      // Deserialize transaction
      const txBuffer = Buffer.from(txBase64, 'base64');
      const transaction = Transaction.from(txBuffer);

      // Recreate token mint keypair from response
      const tokenMint = Keypair.fromSecretKey(new Uint8Array(tokenMintKeypair.secretKey));

      // Use blockhash from backend (already set in transaction)
      transaction.feePayer = publicKey;

      // Sign with token mint keypair first
      transaction.partialSign(tokenMint);

      // Send transaction (wallet will add its signature)
      console.log('Sending transaction...');
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      console.log('Transaction sent:', signature);

      // Wait for confirmation with longer timeout
      console.log('Waiting for confirmation...');
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error('Transaction failed: ' + JSON.stringify(confirmation.value.err));
      }

      console.log('Transaction confirmed!');

      // Redirect to agent page using database ID
      router.push(`/agent/${agentId}`);

    } catch (err: any) {
      console.error('Error creating agent:', err);
      setError(err.response?.data?.error || err.message || 'Failed to create agent');
    } finally {
      setLoading(false);
    }
  };

  const selectedTheme = COLOR_THEMES[formData.colorTheme];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file (PNG, JPG, GIF)');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be smaller than 5MB');
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute z-50 w-64 p-2 mt-2 text-sm text-white bg-gray-900 border border-gray-700 rounded-lg shadow-lg -left-24">
        {text}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <MatrixRain />
      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-20">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-4xl font-bold mb-3 sm:mb-4 px-2">Launch Your AI Agent</h1>
        <p className="text-sm sm:text-base text-gray-400 px-4">
          Create an autonomous trading agent powered by AI on Solana
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-gray-900/50 rounded-xl p-5 sm:p-8 border border-gray-800">
          <div className="space-y-5 sm:space-y-6">

            {/* Visual Customization Section */}
            <div className="border-2 border-dashed border-gray-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                🎨 Visual Identity
                <Tooltip text="Customize how your agent looks to make it stand out from others">
                  <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                </Tooltip>
              </h3>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Agent/Token Image <span className="text-red-500">*</span>
                  <Tooltip text="Upload an image for your agent. This will be used as the agent avatar and token logo. PNG, JPG, or GIF (max 5MB).">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
                </label>

                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {/* Preview */}
                  <div className={`relative w-32 h-32 rounded-xl border-2 ${imagePreview ? 'border-solana-purple' : 'border-dashed border-gray-700'} bg-gray-800 flex items-center justify-center overflow-hidden`}>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-gray-500 p-4">
                        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-xs">No image</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className="block">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <div className="cursor-pointer bg-gray-800 hover:bg-gray-750 border-2 border-gray-700 hover:border-solana-purple rounded-xl p-4 transition-all text-center">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-white">Click to upload</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                          </div>
                        </div>
                      </div>
                    </label>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="mt-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove image
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_THEMES.map((theme, index) => (
                    <button
                      key={theme.name}
                      type="button"
                      onClick={() => setFormData({ ...formData, colorTheme: index })}
                      className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                        formData.colorTheme === index
                          ? 'border-white scale-105'
                          : 'border-gray-700'
                      }`}
                    >
                      <div className={`h-8 rounded bg-gradient-to-r ${theme.from} ${theme.to}`} />
                      <p className="text-xs mt-1">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Agent Name <span className="text-red-500">*</span>
                <Tooltip text="A unique name for your agent. This will be visible to all users and should be memorable.">
                  <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                </Tooltip>
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
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Token Symbol <span className="text-red-500">*</span>
                <Tooltip text="A short ticker symbol (like BTC, ETH). This represents your agent's token on-chain.">
                  <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                </Tooltip>
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
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                Agent Mission <span className="text-red-500">*</span>
                <Tooltip text="Define your agent's trading strategy and goals. Be specific: what markets? what style? This guides the AI's decision-making.">
                  <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                </Tooltip>
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

            {/* Social Links (Optional) */}
            <div className="border-t border-gray-700 pt-5 sm:pt-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                Social Links
                <span className="text-xs text-gray-500 font-normal">(Optional)</span>
              </h3>

              {/* Website */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  🌐 Website
                  <Tooltip text="Your agent's official website or landing page">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="url"
                  placeholder="https://youragent.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>

              {/* Telegram */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  📱 Telegram
                  <Tooltip text="Telegram group/channel username (with or without @)">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  placeholder="@youragent or t.me/youragent"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base"
                  value={formData.telegram}
                  onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                />
              </div>

              {/* Twitter/X */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  𝕏 Twitter/X
                  <Tooltip text="Twitter/X username (with or without @)">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
                </label>
                <input
                  type="text"
                  placeholder="@youragent or x.com/youragent"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                />
              </div>
            </div>

            {/* Advanced Options */}
            <div className="border-t border-gray-700 pt-5 sm:pt-6">
              <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>

              {/* Risk Tolerance */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Risk Tolerance: <span className="text-solana-purple">{formData.riskTolerance}/10</span>
                  <Tooltip text="Controls how risky trades can be. Low = safer, stable returns. High = aggressive, bigger swings. Recommended: 5-7 for balanced approach.">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
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
                  <span>🛡️ Conservative</span>
                  <span>🚀 Aggressive</span>
                </div>
              </div>

              {/* Trading Frequency */}
              <div className="mb-5">
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Trading Frequency
                  <Tooltip text="How often your agent makes trades. Higher frequency = more opportunities but more gas fees. Recommended: Medium for most strategies.">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
                </label>
                <select
                  value={formData.tradingFrequency}
                  onChange={(e) => setFormData({ ...formData, tradingFrequency: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:border-solana-purple focus:ring-2 focus:ring-solana-purple/20 transition-all text-base"
                >
                  <option value="low">🐢 Low (1-2 trades/day)</option>
                  <option value="medium">⚡ Medium (3-5 trades/day)</option>
                  <option value="high">🔥 High (6-10 trades/day)</option>
                  <option value="very-high">💨 Very High (10+ trades/day)</option>
                </select>
              </div>

              {/* Max Trade Size */}
              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                  Max Trade Size: <span className="text-solana-purple">{formData.maxTradeSize}%</span>
                  <Tooltip text="Maximum percentage of vault funds used per trade. Lower = diversified risk. Higher = bigger positions. Recommended: 10-20% for safety.">
                    <span className="text-gray-500 text-sm cursor-help">ⓘ</span>
                  </Tooltip>
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
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>5% (Safe)</span>
                  <span>50% (Risky)</span>
                </div>
              </div>
            </div>

            {/* Subagent System Info - Expanded */}
            <div className="border-t border-gray-700 pt-5 sm:pt-6">
              <div className="bg-gradient-to-r from-solana-purple/10 to-solana-green/10 border-2 border-solana-purple/50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">🤖</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-2 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
                      Powered by 3-Subagent AI System
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      Your agent uses 3 specialized AI subagents working in coordination for intelligent, safe, and optimized trading decisions.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Market Analyzer */}
                  <div className="bg-black/30 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">📊</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-400 mb-1">Market Analyzer</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Scans markets 24/7 to identify profitable opportunities. Analyzes sentiment, volume, price action, and social trends to find the best trades aligned with your agent's mission.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Risk Manager */}
                  <div className="bg-black/30 border border-yellow-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">🛡️</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-400 mb-1">Risk Manager</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Protects your vault by evaluating every trade for risk. Checks position size, volatility, liquidity, and past performance. Only approves trades that match your risk tolerance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Execution Optimizer */}
                  <div className="bg-black/30 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">⚡</div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-purple-400 mb-1">Execution Optimizer</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Executes trades at the best possible price. Monitors slippage, gas fees, liquidity pools, and timing to maximize profits and minimize costs on every transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500 text-center">
                    ⚡ All three subagents run automatically - no configuration needed
                  </p>
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

        {/* Right Column - Live Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>👁️</span> Live Preview
            </h3>

            {/* Agent Card Preview */}
            <div className={`relative bg-gradient-to-br ${selectedTheme.from} ${selectedTheme.to} p-[2px] rounded-xl mb-6 overflow-hidden`}>
              <div className="bg-gray-900 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  {/* Agent Image Preview */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700 flex items-center justify-center flex-shrink-0">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Agent"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold truncate">
                      {formData.name || 'Agent Name'}
                    </h4>
                    <p className="text-sm text-gray-400">
                      ${formData.symbol || 'SYMBOL'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Mission</p>
                    <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">
                      {formData.purpose || 'Your agent\'s trading mission will appear here...'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Risk Level</p>
                      <div className="flex items-center gap-1">
                        {[...Array(10)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full ${
                              i < formData.riskTolerance ? 'bg-solana-purple' : 'bg-gray-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Frequency</p>
                      <p className="text-white text-sm capitalize">
                        {formData.tradingFrequency.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-800">
                    <p className="text-gray-500 text-xs mb-2">Max Trade Size</p>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-gradient-to-r ${selectedTheme.from} ${selectedTheme.to} transition-all duration-300`}
                        style={{ width: `${formData.maxTradeSize}%` }}
                      />
                    </div>
                    <p className="text-right text-xs text-gray-400 mt-1">{formData.maxTradeSize}% per trade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Preview */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold text-gray-400">Initial Stats</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Vault Balance</p>
                  <p className="text-lg font-bold text-white">0 SOL</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Your Tokens</p>
                  <p className="text-lg font-bold text-solana-green">1M {formData.symbol || 'TOKENS'}</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Total Trades</p>
                  <p className="text-lg font-bold text-white">0</p>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">ROI</p>
                  <p className="text-lg font-bold text-gray-500">-</p>
                </div>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <div className="text-xl">💡</div>
                <div className="flex-1">
                  <p className="text-xs text-blue-400 font-semibold mb-1">How it works</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    After launching, users can deposit SOL to your agent's vault. The AI will trade automatically based on your settings. You earn a % of all trading profits!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      </div>
    </div>
  );
}
