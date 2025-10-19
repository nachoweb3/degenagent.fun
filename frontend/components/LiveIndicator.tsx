'use client';

import { useWebSocket } from '../hooks/useWebSocket';

interface LiveIndicatorProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LiveIndicator({ className = '', showText = true, size = 'md' }: LiveIndicatorProps) {
  const { isConnected } = useWebSocket({ autoConnect: true });

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative">
        {isConnected ? (
          <>
            {/* Animated pulse ring */}
            <div className={`${sizeClasses[size]} rounded-full bg-green-500 animate-pulse`}></div>
            <div className={`absolute inset-0 ${sizeClasses[size]} rounded-full bg-green-400 animate-ping`}></div>
          </>
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-gray-500`}></div>
        )}
      </div>
      {showText && (
        <span className={`font-semibold ${textSizeClasses[size]} ${isConnected ? 'text-green-400' : 'text-gray-500'}`}>
          {isConnected ? 'LIVE' : 'Offline'}
        </span>
      )}
    </div>
  );
}
