'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3001/api';

interface Activity {
  id: string;
  type: 'trade' | 'agent_created' | 'graduation' | 'new_king' | 'achievement';
  timestamp: string;
  data: {
    agentId?: string;
    agentName?: string;
    amount?: number;
    tokenSymbol?: string;
    profit?: number;
    creator?: string;
    marketCap?: number;
    achievement?: string;
  };
}

interface LiveActivityFeedProps {
  limit?: number;
  compact?: boolean;
}

export default function LiveActivityFeed({ limit = 10, compact = false }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [newActivityCount, setNewActivityCount] = useState(0);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(() => {
      fetchActivities(true);
    }, 10000); // Auto-refresh every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchActivities = async (isRefresh = false) => {
    try {
      const response = await axios.get(`${BACKEND_API}/activity/recent?limit=${limit}`).catch(() => ({
        data: { activities: generateMockActivities() }
      }));

      const newActivities = response.data.activities || generateMockActivities();

      if (isRefresh && activities.length > 0) {
        // Count new activities
        const newCount = newActivities.filter(
          (newAct: Activity) => !activities.some((oldAct) => oldAct.id === newAct.id)
        ).length;
        setNewActivityCount(newCount);
        setTimeout(() => setNewActivityCount(0), 3000);
      }

      setActivities(newActivities);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setActivities(generateMockActivities());
      setLoading(false);
    }
  };

  const generateMockActivities = (): Activity[] => {
    const types: Activity['type'][] = ['trade', 'agent_created', 'graduation', 'new_king', 'achievement'];
    const agentNames = ['AlphaTrader', 'MoonBot', 'DiamondHands', 'QuantumAI', 'SniperBot', 'DeFiWhale'];

    return Array.from({ length: limit }, (_, i) => {
      const type = types[Math.floor(Math.random() * types.length)];
      const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];

      return {
        id: `activity-${Date.now()}-${i}`,
        type,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        data: {
          agentId: `agent-${i}`,
          agentName,
          amount: Math.random() * 100,
          tokenSymbol: 'SOL',
          profit: (Math.random() - 0.5) * 50,
          creator: '0x' + Math.random().toString(16).slice(2, 10),
          marketCap: Math.random() * 1000000,
          achievement: 'First 100 trades completed'
        }
      };
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'trade':
        return '💹';
      case 'agent_created':
        return '🤖';
      case 'graduation':
        return '🎓';
      case 'new_king':
        return '👑';
      case 'achievement':
        return '🏆';
      default:
        return '📊';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'trade':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'agent_created':
        return 'border-purple-500/50 bg-purple-500/10';
      case 'graduation':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'new_king':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'achievement':
        return 'border-green-500/50 bg-green-500/10';
      default:
        return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const renderActivityContent = (activity: Activity) => {
    const { type, data } = activity;

    switch (type) {
      case 'trade':
        const profitClass = (data.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400';
        return (
          <div>
            <span className="font-semibold text-white">{data.agentName}</span> executed a trade
            <div className="text-sm text-gray-400 mt-1">
              {data.amount?.toFixed(2)} {data.tokenSymbol} • {' '}
              <span className={profitClass}>
                {(data.profit || 0) >= 0 ? '+' : ''}{data.profit?.toFixed(2)} {data.tokenSymbol}
              </span>
            </div>
          </div>
        );

      case 'agent_created':
        return (
          <div>
            <span className="font-semibold text-white">{data.agentName}</span> was created
            <div className="text-sm text-gray-400 mt-1">
              By {data.creator?.slice(0, 6)}...{data.creator?.slice(-4)}
            </div>
          </div>
        );

      case 'graduation':
        return (
          <div>
            <span className="font-semibold text-white">{data.agentName}</span> graduated to DEX
            <div className="text-sm text-gray-400 mt-1">
              Market Cap: ${data.marketCap?.toLocaleString()}
            </div>
          </div>
        );

      case 'new_king':
        return (
          <div>
            <span className="font-semibold text-white">{data.agentName}</span> is the new King
            <div className="text-sm text-gray-400 mt-1">
              Top performer of the platform
            </div>
          </div>
        );

      case 'achievement':
        return (
          <div>
            <span className="font-semibold text-white">{data.agentName}</span> unlocked achievement
            <div className="text-sm text-gray-400 mt-1">
              {data.achievement}
            </div>
          </div>
        );

      default:
        return <div>Unknown activity</div>;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Live Activity</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600 animate-pulse"></div>
            <span className="text-sm text-gray-400">Loading...</span>
          </div>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-800/50 rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold`}>
          Live Activity
          {newActivityCount > 0 && (
            <span className="ml-2 text-sm bg-green-500 text-white px-2 py-1 rounded-full animate-pulse">
              +{newActivityCount} new
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm text-gray-400">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
        {activities.map((activity, index) => (
          <Link
            key={activity.id}
            href={`/agent/${activity.data.agentId}`}
            className={`block border rounded-lg p-4 transition-all hover:scale-[1.02] hover:shadow-lg ${getActivityColor(
              activity.type
            )} animate-fadeIn`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                {renderActivityContent(activity)}
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {formatTimestamp(activity.timestamp)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {!compact && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-center">
          <button
            onClick={() => fetchActivities()}
            className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            Refresh Activity
          </button>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.7);
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
