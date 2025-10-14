import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Notification {
  id: string;
  type: 'leaderboard' | 'trade' | 'referral' | 'achievement' | 'challenge';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  icon: string;
}

export default function NotificationCenter() {
  const { publicKey } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'leaderboard',
      title: 'Leaderboard Update',
      message: "You're now #4 on the leaderboard! Keep trading to reach top 3!",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      actionUrl: '/leaderboard',
      icon: '🏆'
    },
    {
      id: '2',
      type: 'trade',
      title: 'Trade Alert',
      message: 'Your agent Alpha Bot just made a profitable trade! +0.25 SOL',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      read: false,
      icon: '📊'
    },
    {
      id: '3',
      type: 'referral',
      title: 'Referral Success',
      message: 'Your referral just created an agent! You earned 0.05 SOL',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      actionUrl: '/referrals',
      icon: '🎁'
    },
    {
      id: '4',
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You earned the "Win Streak Master" badge! 🏅',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      read: true,
      icon: '⚡'
    },
    {
      id: '5',
      type: 'challenge',
      title: 'Daily Challenge',
      message: 'Only 2 hours left to complete today\'s challenges!',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      read: true,
      actionUrl: '/challenges',
      icon: '🎊'
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'leaderboard': return 'from-yellow-600 to-orange-600';
      case 'trade': return 'from-green-600 to-emerald-600';
      case 'referral': return 'from-purple-600 to-pink-600';
      case 'achievement': return 'from-blue-600 to-cyan-600';
      case 'challenge': return 'from-red-600 to-rose-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">🔔 Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <div className="text-4xl mb-2">🔕</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => markAsRead(notif.id)}
                    className={`p-4 hover:bg-gray-750 transition-colors cursor-pointer ${
                      !notif.read ? 'bg-purple-900/20' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getNotificationColor(notif.type)} flex items-center justify-center flex-shrink-0`}>
                        <span className="text-xl">{notif.icon}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-bold text-white text-sm">
                            {notif.title}
                          </h4>
                          {!notif.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          {notif.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {getTimeAgo(notif.timestamp)}
                          </span>
                          {notif.actionUrl && (
                            <button className="text-xs text-purple-400 hover:text-purple-300 font-medium">
                              View →
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 p-3 bg-gray-900">
            <button className="w-full text-center text-purple-400 hover:text-purple-300 text-sm font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Click Outside to Close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
}

// Notification Hook for sending push notifications
export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    }
    return false;
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (permission === 'granted' && 'Notification' in window) {
      new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        ...options
      });
    }
  };

  return {
    permission,
    requestPermission,
    sendNotification,
    canSendNotifications: permission === 'granted'
  };
}

// Example usage in other components:
// const { sendNotification } = useNotifications();
// sendNotification('Trade Alert', { body: 'Your agent made a profit!' });
