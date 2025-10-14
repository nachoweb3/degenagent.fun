import React, { useState } from 'react';
import { Agent } from '../services/api';

interface ShareAgentProps {
  agent: Agent;
}

export default function ShareAgent({ agent }: ShareAgentProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/agent/${agent.pubkey}`;
  const shareText = `🤖 Check out my AI trading agent "${agent.name}" on AGENT.FUN!\n\n💰 P&L: ${agent.profitLoss > 0 ? '+' : ''}${agent.profitLoss.toFixed(2)} SOL\n🎯 Win Rate: ${agent.winRate.toFixed(1)}%\n📊 Volume: ${agent.totalVolume.toFixed(2)} SOL\n\n`;

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=Solana,AITrading,AgentFun`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadImage = () => {
    // Generate shareable image with agent stats
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#9945FF');
    gradient.addColorStop(1, '#14F195');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, 1200, 630);

    // Agent name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 72px Arial';
    ctx.fillText(agent.name, 60, 120);

    // Stats
    ctx.font = '36px Arial';
    ctx.fillText(`💰 P&L: ${agent.profitLoss > 0 ? '+' : ''}${agent.profitLoss.toFixed(2)} SOL`, 60, 220);
    ctx.fillText(`🎯 Win Rate: ${agent.winRate.toFixed(1)}%`, 60, 280);
    ctx.fillText(`📊 Volume: ${agent.totalVolume.toFixed(2)} SOL`, 60, 340);

    // AGENT.FUN branding
    ctx.font = 'bold 48px Arial';
    ctx.fillText('AGENT.FUN', 60, 550);
    ctx.font = '24px Arial';
    ctx.fillText('AI Trading Agents on Solana', 60, 590);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agent.name}-stats.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
      <h3 className="text-xl font-bold text-white mb-4">📢 Share Agent</h3>

      <div className="flex flex-wrap gap-3 mb-4">
        {/* Twitter */}
        <button
          onClick={shareToTwitter}
          className="flex items-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Twitter
        </button>

        {/* Telegram */}
        <button
          onClick={shareToTelegram}
          className="flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram
        </button>

        {/* Copy Link */}
        <button
          onClick={copyLink}
          className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
              </svg>
              Copy Link
            </>
          )}
        </button>

        {/* Download Image */}
        <button
          onClick={downloadImage}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-green-400 hover:from-purple-700 hover:to-green-500 text-white px-4 py-2 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Download Image
        </button>
      </div>

      {/* Preview */}
      <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-2">Preview:</p>
        <p className="text-white text-sm whitespace-pre-wrap">{shareText}</p>
        <p className="text-purple-400 text-sm mt-2 break-all">{shareUrl}</p>
      </div>
    </div>
  );
}
