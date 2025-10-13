'use client';

export default function RoadmapTimeline() {
  const roadmapData = [
    {
      quarter: 'Q4 2024',
      title: 'Platform Launch',
      status: 'completed',
      features: ['Agent creation', 'Basic trading', 'Token system']
    },
    {
      quarter: 'Q1 2025',
      title: 'AI Trading Agents',
      status: 'completed',
      features: ['GPT-4 integration', 'Jupiter DEX', 'Automated trading']
    },
    {
      quarter: 'Q2 2025',
      title: 'Subagent System',
      status: 'inProgress',
      features: ['Market analyzer subagent', 'Risk manager subagent', 'Execution optimizer']
    },
    {
      quarter: 'Q2 2025',
      title: 'NFT Collection',
      status: 'inProgress',
      features: ['Unique AI-generated art', 'Premium features', 'Revenue share boost']
    },
    {
      quarter: 'Q3 2025',
      title: 'Social Trading',
      status: 'upcoming',
      features: ['Agent leaderboards', 'Copy trading', 'Social portfolios']
    },
    {
      quarter: 'Q4 2025',
      title: 'DAO Governance',
      status: 'upcoming',
      features: ['Token voting', 'Community proposals', 'Treasury management']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-solana-green border-solana-green';
      case 'inProgress':
        return 'bg-solana-purple border-solana-purple animate-pulse';
      case 'upcoming':
        return 'bg-gray-700 border-gray-600';
      default:
        return 'bg-gray-700 border-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed ✓';
      case 'inProgress':
        return 'In Progress';
      case 'upcoming':
        return 'Upcoming';
      default:
        return 'Planned';
    }
  };

  return (
    <div className="relative w-full py-8 sm:py-12">
      {/* Timeline line - Hidden on mobile, shown on desktop */}
      <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-solana-green via-solana-purple to-gray-700" />

      {/* Mobile timeline line - Left side */}
      <div className="md:hidden absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-solana-green via-solana-purple to-gray-700" />

      {/* Roadmap items */}
      <div className="space-y-8 sm:space-y-16">
        {roadmapData.map((item, index) => (
          <div
            key={index}
            className={`relative flex items-center ${
              index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
            } flex-row`}
          >
            {/* Content */}
            <div className={`w-full md:w-5/12 ${
              index % 2 === 0
                ? 'md:pr-8 md:text-right pl-12 md:pl-0'
                : 'md:pl-8 md:text-left pl-12'
            }`}>
              <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-solana-purple transition-all hover:scale-105 touch-manipulation">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-400">{item.quarter}</span>
                  <span
                    className={`text-xs font-semibold px-2 sm:px-3 py-1 rounded-full ${
                      item.status === 'completed'
                        ? 'bg-solana-green/20 text-solana-green'
                        : item.status === 'inProgress'
                        ? 'bg-solana-purple/20 text-solana-purple'
                        : 'bg-gray-700/50 text-gray-400'
                    }`}
                  >
                    {getStatusText(item.status)}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{item.title}</h3>
                <ul className="space-y-1 sm:space-y-2">
                  {item.features.map((feature, i) => (
                    <li key={i} className="text-xs sm:text-sm text-gray-400 flex items-start">
                      <span className="text-solana-green mr-2 flex-shrink-0">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Center/Left dot */}
            <div className={`absolute ${
              index % 2 === 0 ? 'md:left-1/2' : 'md:left-1/2'
            } left-4 md:transform md:-translate-x-1/2 z-10`}>
              <div
                className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 sm:border-4 ${getStatusColor(
                  item.status
                )} shadow-lg`}
              />
            </div>

            {/* Empty space on other side - Desktop only */}
            <div className="hidden md:block md:w-5/12" />
          </div>
        ))}
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-4 md:left-1/2 md:transform md:-translate-x-1/2">
        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-solana-purple to-solana-green animate-pulse" />
      </div>
    </div>
  );
}
