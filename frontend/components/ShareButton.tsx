'use client';

import { useState } from 'react';

interface ShareButtonProps {
  agentId: string;
  agentName: string;
  agentSymbol?: string;
  stats?: {
    roi?: number;
    winRate?: number;
    totalVolume?: number;
    totalTrades?: number;
    balance?: number;
    rank?: number;
  };
  achievement?: {
    type: 'graduation' | 'profit' | 'rank' | 'trades';
    value: string;
  };
  compact?: boolean;
}

export default function ShareButton({
  agentId,
  agentName,
  agentSymbol,
  stats = {},
  achievement,
  compact = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/agent/${agentId}`
    : `https://agent.fun/agent/${agentId}`;

  const generateShareText = () => {
    if (achievement) {
      switch (achievement.type) {
        case 'graduation':
          return `AI Agent "${agentName}" just graduated to DEX! ${achievement.value}`;
        case 'profit':
          return `AI Agent "${agentName}" achieved ${achievement.value} profit!`;
        case 'rank':
          return `AI Agent "${agentName}" reached ${achievement.value}!`;
        case 'trades':
          return `AI Agent "${agentName}" completed ${achievement.value} trades!`;
      }
    }

    let text = `Check out my AI trading agent "${agentName}"`;
    if (agentSymbol) text += ` ($${agentSymbol})`;
    text += ' on Agent.fun!\n\n';

    if (stats.roi !== undefined) {
      text += `ROI: ${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(2)}%\n`;
    }
    if (stats.winRate !== undefined) {
      text += `Win Rate: ${stats.winRate.toFixed(1)}%\n`;
    }
    if (stats.totalVolume !== undefined) {
      text += `Volume: $${stats.totalVolume.toLocaleString()}\n`;
    }
    if (stats.totalTrades !== undefined) {
      text += `Trades: ${stats.totalTrades}\n`;
    }
    if (stats.rank !== undefined) {
      text += `Rank: #${stats.rank}\n`;
    }

    return text.trim();
  };

  const shareText = generateShareText();

  const shareToTwitter = () => {
    const hashtags = 'Solana,AITrading,AgentFun,DeFi';
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=${hashtags}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    setShowMenu(false);
  };

  const shareToTelegram = () => {
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(telegramUrl, '_blank');
    setShowMenu(false);
  };

  const shareToDiscord = () => {
    // Discord doesn't have a direct share URL, so we copy formatted text
    const discordText = `${shareText}\n${shareUrl}`;
    navigator.clipboard.writeText(discordText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadShareImage = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#9945FF');
    gradient.addColorStop(0.5, '#14F195');
    gradient.addColorStop(1, '#00D4FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, 1200, 630);

    // Agent name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px Inter, Arial, sans-serif';
    ctx.fillText(agentName, 60, 120);

    // Symbol
    if (agentSymbol) {
      ctx.font = '40px Inter, Arial, sans-serif';
      ctx.fillStyle = '#CCCCCC';
      ctx.fillText(`$${agentSymbol}`, 60, 180);
    }

    // Stats
    ctx.font = 'bold 36px Inter, Arial, sans-serif';
    let yPos = 260;

    if (stats.roi !== undefined) {
      const roiColor = stats.roi >= 0 ? '#10B981' : '#EF4444';
      ctx.fillStyle = roiColor;
      ctx.fillText(`ROI: ${stats.roi > 0 ? '+' : ''}${stats.roi.toFixed(2)}%`, 60, yPos);
      yPos += 60;
    }

    if (stats.winRate !== undefined) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`Win Rate: ${stats.winRate.toFixed(1)}%`, 60, yPos);
      yPos += 60;
    }

    if (stats.totalVolume !== undefined) {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`Volume: $${stats.totalVolume.toLocaleString()}`, 60, yPos);
      yPos += 60;
    }

    if (stats.rank !== undefined) {
      ctx.fillStyle = '#FFD700';
      ctx.fillText(`Rank: #${stats.rank}`, 60, yPos);
      yPos += 60;
    }

    // Achievement badge
    if (achievement) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(60, yPos, 500, 80);
      ctx.fillStyle = '#FFD700';
      ctx.font = 'bold 32px Inter, Arial, sans-serif';
      ctx.fillText(`Achievement: ${achievement.value}`, 80, yPos + 50);
    }

    // Branding
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 56px Inter, Arial, sans-serif';
    ctx.fillText('AGENT.FUN', 60, 560);
    ctx.font = '28px Inter, Arial, sans-serif';
    ctx.fillStyle = '#CCCCCC';
    ctx.fillText('AI Trading Agents on Solana', 60, 600);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${agentName.replace(/\s+/g, '-')}-share.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
    setShowMenu(false);
  };

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 overflow-hidden">
              <button
                onClick={shareToTwitter}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-white"
              >
                <svg className="w-5 h-5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button
                onClick={shareToTelegram}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-white"
              >
                <svg className="w-5 h-5 text-[#0088cc]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                Telegram
              </button>
              <button
                onClick={shareToDiscord}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-white"
              >
                <svg className="w-5 h-5 text-[#5865F2]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </button>
              <button
                onClick={copyLink}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-white"
              >
                {copied ? (
                  <>
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                    Copy Link
                  </>
                )}
              </button>
              <button
                onClick={downloadShareImage}
                className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors flex items-center gap-3 text-white border-t border-gray-700"
              >
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Download Image
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Share Agent</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          onClick={shareToTwitter}
          className="flex items-center justify-center gap-2 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-4 py-3 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
          Twitter
        </button>

        <button
          onClick={shareToTelegram}
          className="flex items-center justify-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-4 py-3 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          Telegram
        </button>

        <button
          onClick={shareToDiscord}
          className="flex items-center justify-center gap-2 bg-[#5865F2] hover:bg-[#4752C4] text-white px-4 py-3 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
          Discord
        </button>

        <button
          onClick={copyLink}
          className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg transition-colors"
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
      </div>

      <button
        onClick={downloadShareImage}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 py-3 rounded-lg transition-all"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        Download Share Image
      </button>

      <div className="mt-4 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
        <p className="text-gray-400 text-sm mb-2">Preview:</p>
        <p className="text-white text-sm whitespace-pre-wrap">{shareText}</p>
        <p className="text-purple-400 text-sm mt-2 break-all">{shareUrl}</p>
      </div>
    </div>
  );
}
