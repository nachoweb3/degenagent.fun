import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  target: number;
  completed: boolean;
  emoji: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function DailyChallenges() {
  const { publicKey } = useWallet();
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'daily_trades',
      title: 'Daily Trader',
      description: 'Execute 3 successful trades today',
      reward: '0.01 SOL + 🏅 Trader Badge',
      progress: 0,
      target: 3,
      completed: false,
      emoji: '📊',
      difficulty: 'easy'
    },
    {
      id: 'win_streak',
      title: 'Win Streak',
      description: 'Win 5 trades in a row',
      reward: '0.05 SOL + ⚡ Streak Master Badge',
      progress: 0,
      target: 5,
      completed: false,
      emoji: '⚡',
      difficulty: 'hard'
    },
    {
      id: 'refer_friend',
      title: 'Share the Love',
      description: 'Refer 1 friend who creates an agent',
      reward: '0.05 SOL + 🎁 Influencer Badge',
      progress: 0,
      target: 1,
      completed: false,
      emoji: '🎁',
      difficulty: 'medium'
    },
    {
      id: 'profit_goal',
      title: 'Profit Master',
      description: 'Reach 0.1 SOL profit today',
      reward: '0.02 SOL + 💰 Money Maker Badge',
      progress: 0,
      target: 0.1,
      completed: false,
      emoji: '💰',
      difficulty: 'hard'
    },
    {
      id: 'volume_goal',
      title: 'Volume King',
      description: 'Trade 1 SOL total volume',
      reward: '0.015 SOL + 👑 Volume King Badge',
      progress: 0,
      target: 1.0,
      completed: false,
      emoji: '👑',
      difficulty: 'medium'
    },
    {
      id: 'social_share',
      title: 'Social Butterfly',
      description: 'Share your agent on Twitter',
      reward: '0.005 SOL + 🦋 Influencer Badge',
      progress: 0,
      target: 1,
      completed: false,
      emoji: '🦋',
      difficulty: 'easy'
    }
  ]);

  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Calculate time until midnight UTC
    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setUTCHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDifficultyBg = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-900/30 border-green-500/50';
      case 'medium': return 'bg-yellow-900/30 border-yellow-500/50';
      case 'hard': return 'bg-red-900/30 border-red-500/50';
      default: return 'bg-gray-900/30 border-gray-500/50';
    }
  };

  const completedCount = challenges.filter(c => c.completed).length;
  const totalRewards = challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + parseFloat(c.reward.split(' ')[0]), 0);

  if (!publicKey) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-8 text-center backdrop-blur-sm">
        <h3 className="text-2xl font-bold text-white mb-4">🎊 Daily Challenges</h3>
        <p className="text-gray-400">Connect your wallet to view challenges</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">🎊 Daily Challenges</h2>
            <p className="text-lg opacity-90">Complete challenges to earn rewards!</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Resets in</div>
            <div className="text-2xl font-bold">{timeLeft}</div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="bg-black/20 rounded-lg p-4 flex justify-between items-center">
          <div>
            <div className="text-sm opacity-75">Progress</div>
            <div className="text-2xl font-bold">
              {completedCount} / {challenges.length}
            </div>
          </div>
          <div>
            <div className="text-sm opacity-75">Rewards Earned</div>
            <div className="text-2xl font-bold text-green-400">
              {totalRewards.toFixed(3)} SOL
            </div>
          </div>
          <div>
            <div className="text-sm opacity-75">Badges</div>
            <div className="text-2xl font-bold">
              {completedCount} 🏅
            </div>
          </div>
        </div>
      </div>

      {/* Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <div
            key={challenge.id}
            className={`relative rounded-lg p-6 border-2 transition-all ${
              challenge.completed
                ? 'bg-green-900/20 border-green-500'
                : getDifficultyBg(challenge.difficulty)
            }`}
          >
            {/* Completed Badge */}
            {challenge.completed && (
              <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                ✓ DONE
              </div>
            )}

            {/* Emoji */}
            <div className="text-5xl mb-3">{challenge.emoji}</div>

            {/* Title */}
            <h3 className="text-xl font-bold text-white mb-2">
              {challenge.title}
            </h3>

            {/* Difficulty */}
            <div className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty.toUpperCase()}
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4">{challenge.description}</p>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progress</span>
                <span>{challenge.progress} / {challenge.target}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    challenge.completed ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{
                    width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%`
                  }}
                ></div>
              </div>
            </div>

            {/* Reward */}
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-400 mb-1">Reward</div>
              <div className="text-sm font-bold text-yellow-400">{challenge.reward}</div>
            </div>

            {/* Claim Button */}
            {challenge.completed && (
              <button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                Claim Reward
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bonus Challenge */}
      <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-6xl">🌟</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">🎁 BONUS: Complete All Challenges!</h3>
            <p className="text-lg mb-2">
              Complete all 6 challenges today to unlock a special bonus:
            </p>
            <div className="bg-black/30 rounded-lg p-3 inline-block">
              <span className="text-2xl font-bold">0.1 SOL + 🏆 Perfect Day Badge</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-75">Progress</div>
            <div className="text-4xl font-bold">
              {completedCount} / {challenges.length}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gray-800/50 rounded-lg p-6 backdrop-blur-sm">
        <h3 className="text-xl font-bold text-white mb-4">💡 Tips</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Challenges reset daily at 00:00 UTC</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Rewards are paid instantly upon completion</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Badges are permanent and displayed on your profile</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400 mt-1">✓</span>
            <span>Complete all challenges for a 2x bonus!</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
