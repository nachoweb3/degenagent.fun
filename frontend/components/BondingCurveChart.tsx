'use client';

import { useEffect, useRef, useState } from 'react';

interface BondingCurveChartProps {
  currentPrice: number;
  tokensSold: number;
  totalSupply: number;
  marketCap: number;
  progress: number;
}

export default function BondingCurveChart({
  currentPrice,
  tokensSold,
  totalSupply,
  marketCap,
  progress,
}: BondingCurveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 10; i++) {
      const x = padding + (i / 10) * (width - padding * 2);
      const y = padding + (i / 10) * (height - padding * 2);

      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw bonding curve (exponential)
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 3;
    ctx.beginPath();

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const x = padding + t * (width - padding * 2);

      // Exponential bonding curve formula: price = base * (1 + supply)^2
      const supply = t * totalSupply;
      const price = 0.00001 * Math.pow(1 + supply / 1000000, 2);
      const maxPrice = 0.00001 * Math.pow(1 + totalSupply / 1000000, 2);
      const y = height - padding - (price / maxPrice) * (height - padding * 2);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw current position
    const currentX = padding + (tokensSold / totalSupply) * (width - padding * 2);
    const currentY = height - padding - (currentPrice / (0.00001 * Math.pow(1 + totalSupply / 1000000, 2))) * (height - padding * 2);

    // Draw vertical line at current position
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(currentX, padding);
    ctx.lineTo(currentX, height - padding);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw filled area under curve (up to current position)
    const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);

    for (let i = 0; i <= (tokensSold / totalSupply) * 100; i++) {
      const t = i / 100;
      const x = padding + t * (width - padding * 2);
      const supply = t * totalSupply;
      const price = 0.00001 * Math.pow(1 + supply / 1000000, 2);
      const maxPrice = 0.00001 * Math.pow(1 + totalSupply / 1000000, 2);
      const y = height - padding - (price / maxPrice) * (height - padding * 2);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(currentX, height - padding);
    ctx.closePath();
    ctx.fill();

    // Draw current point
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Draw glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#22d3ee';
    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    // X-axis labels
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i / 4) * (width - padding * 2);
      const supply = (i / 4) * totalSupply;
      ctx.fillText(`${(supply / 1000000).toFixed(1)}M`, x, height - 20);
    }

    // Y-axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - (i / 4) * (height - padding * 2);
      const maxPrice = 0.00001 * Math.pow(1 + totalSupply / 1000000, 2);
      const price = (i / 4) * maxPrice;
      ctx.fillText(price.toFixed(6), padding - 5, y + 4);
    }

    // Draw axis labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Tokens Sold', width / 2, height - 5);

    ctx.save();
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Price (SOL)', 0, 0);
    ctx.restore();

  }, [currentPrice, tokensSold, totalSupply]);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">📈 Bonding Curve</h3>
        <p className="text-sm text-gray-400">
          Exponential price discovery curve - price increases as more tokens are sold
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Current Price</div>
          <div className="text-xl font-bold text-cyan-400">{currentPrice.toFixed(6)} SOL</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Market Cap</div>
          <div className="text-xl font-bold text-purple-400">{marketCap.toFixed(2)} SOL</div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Tokens Sold</div>
          <div className="text-xl font-bold text-green-400">
            {((tokensSold / 1000000).toFixed(2))}M
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="text-xs text-gray-400 mb-1">Progress</div>
          <div className="text-xl font-bold text-yellow-400">{progress.toFixed(1)}%</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-400">Progress to Graduation</span>
          <span className="text-white font-semibold">{progress.toFixed(2)}% / 100%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 rounded-full transition-all duration-500 relative"
            style={{ width: `${Math.min(progress, 100)}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
        {progress >= 99 && (
          <div className="mt-2 text-center text-yellow-400 font-semibold animate-pulse">
            🎓 Ready for Raydium Graduation!
          </div>
        )}
      </div>

      {/* Canvas Chart */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full rounded-lg bg-gray-950"
          style={{ height: '300px' }}
        />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-purple-500"></div>
          <span className="text-gray-400">Bonding Curve</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-cyan-400"></div>
          <span className="text-gray-400">Current Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500/20 rounded"></div>
          <span className="text-gray-400">Filled Area</span>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="text-sm font-semibold text-blue-300 mb-1">How it works</h4>
            <p className="text-xs text-gray-400">
              The bonding curve uses an exponential formula where price increases as more tokens are sold.
              When 100% of tokens are sold, the agent graduates to Raydium with automatic liquidity provision.
              Early buyers get lower prices, later buyers pay more - incentivizing early discovery!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
