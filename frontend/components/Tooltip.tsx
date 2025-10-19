'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: number;
  delay?: number;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  maxWidth = 300,
  delay = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      checkPosition();
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const checkPosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Check if tooltip goes off screen and adjust position
    if (position === 'top' && tooltipRect.top < 0) {
      newPosition = 'bottom';
    } else if (position === 'bottom' && tooltipRect.bottom > viewportHeight) {
      newPosition = 'top';
    } else if (position === 'left' && tooltipRect.left < 0) {
      newPosition = 'right';
    } else if (position === 'right' && tooltipRect.right > viewportWidth) {
      newPosition = 'left';
    }

    setActualPosition(newPosition);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getPositionClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2';
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2';
    }
  };

  const getArrowClasses = () => {
    switch (actualPosition) {
      case 'top':
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
      case 'bottom':
        return 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800';
      case 'left':
        return 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800';
      case 'right':
        return 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800';
      default:
        return 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800';
    }
  };

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-flex items-center"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-50 ${getPositionClasses()} pointer-events-none animate-fadeIn`}
          style={{ maxWidth: `${maxWidth}px` }}
        >
          <div className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl border border-gray-700">
            {content}
          </div>
          <div
            className={`absolute w-0 h-0 border-4 ${getArrowClasses()}`}
          ></div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </div>
  );
}

// Predefined tooltip contents for common terms
export const TooltipContent = {
  BondingCurve: (
    <div className="space-y-2">
      <p className="font-semibold">Bonding Curve</p>
      <p>
        A mathematical curve that determines token price based on supply. As more tokens are bought,
        the price increases automatically.
      </p>
    </div>
  ),
  ROI: (
    <div className="space-y-2">
      <p className="font-semibold">Return on Investment (ROI)</p>
      <p>
        Percentage showing total profit or loss relative to initial investment. Positive ROI means
        profit, negative means loss.
      </p>
    </div>
  ),
  WinRate: (
    <div className="space-y-2">
      <p className="font-semibold">Win Rate</p>
      <p>
        Percentage of profitable trades out of total trades. Higher win rate indicates more
        consistent performance.
      </p>
    </div>
  ),
  SharpeRatio: (
    <div className="space-y-2">
      <p className="font-semibold">Sharpe Ratio</p>
      <p>
        Risk-adjusted return metric. Above 1 is good, above 2 is excellent. Measures how much return
        you get per unit of risk.
      </p>
    </div>
  ),
  ProfitFactor: (
    <div className="space-y-2">
      <p className="font-semibold">Profit Factor</p>
      <p>
        Ratio of gross profits to gross losses. Above 2 is excellent. Shows how many dollars are
        made for each dollar lost.
      </p>
    </div>
  ),
  MaxDrawdown: (
    <div className="space-y-2">
      <p className="font-semibold">Maximum Drawdown</p>
      <p>
        Largest peak-to-trough decline in account value. Lower is better. Shows worst-case loss
        scenario.
      </p>
    </div>
  ),
  MarketCap: (
    <div className="space-y-2">
      <p className="font-semibold">Market Capitalization</p>
      <p>
        Total value of all tokens in circulation. Calculated as token price multiplied by total
        supply.
      </p>
    </div>
  ),
  Liquidity: (
    <div className="space-y-2">
      <p className="font-semibold">Liquidity</p>
      <p>
        Amount of funds available for trading. Higher liquidity means easier buying/selling without
        price impact.
      </p>
    </div>
  ),
  TechnicalIndicators: (
    <div className="space-y-2">
      <p className="font-semibold">Technical Indicators</p>
      <p>
        Mathematical calculations based on price and volume data used to predict market movements.
        Includes RSI, MACD, Moving Averages, etc.
      </p>
    </div>
  ),
  RSI: (
    <div className="space-y-2">
      <p className="font-semibold">Relative Strength Index (RSI)</p>
      <p>
        Momentum indicator ranging from 0-100. Above 70 suggests overbought, below 30 suggests
        oversold.
      </p>
    </div>
  ),
  MACD: (
    <div className="space-y-2">
      <p className="font-semibold">Moving Average Convergence Divergence</p>
      <p>
        Trend-following indicator showing relationship between two moving averages. Crossovers signal
        potential buy/sell opportunities.
      </p>
    </div>
  ),
  Volume: (
    <div className="space-y-2">
      <p className="font-semibold">Trading Volume</p>
      <p>
        Total amount of tokens traded in a given period. Higher volume indicates more market
        activity and interest.
      </p>
    </div>
  ),
  Graduation: (
    <div className="space-y-2">
      <p className="font-semibold">Token Graduation</p>
      <p>
        When a token reaches the market cap threshold on the bonding curve and migrates to a
        decentralized exchange (DEX) with locked liquidity.
      </p>
    </div>
  ),
  Strategy: (
    <div className="space-y-2">
      <p className="font-semibold">Trading Strategy</p>
      <p>
        The set of rules and logic an AI agent uses to make trading decisions. Can include technical
        analysis, pattern recognition, or other approaches.
      </p>
    </div>
  ),
  Slippage: (
    <div className="space-y-2">
      <p className="font-semibold">Slippage</p>
      <p>
        Difference between expected trade price and actual execution price. Higher in low liquidity
        markets or large trades.
      </p>
    </div>
  ),
};

// Helper component for info icon with tooltip
export function InfoTooltip({
  content,
  size = 'sm',
}: {
  content: string | ReactNode;
  size?: 'xs' | 'sm' | 'md';
}) {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <Tooltip content={content}>
      <svg
        className={`${sizeClasses[size]} text-gray-400 hover:text-gray-300 cursor-help inline-block`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
          clipRule="evenodd"
        />
      </svg>
    </Tooltip>
  );
}
