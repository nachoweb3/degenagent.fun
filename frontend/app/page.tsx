'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';
import RoadmapTimeline from '@/components/RoadmapTimeline';

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-20">
      {/* Hero Section - Mobile First */}
      <div className="text-center mb-12 sm:mb-20">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent leading-tight">
          Launch AI Agents on Solana
        </h1>
        <p className="text-base sm:text-xl text-gray-400 mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
          Create autonomous AI trading agents that make intelligent decisions on the Solana blockchain.
          Trade memecoins 24/7 with GPT-4 powered decision making.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0">
          <Link
            href="/create"
            className="w-full sm:w-auto bg-solana-purple hover:bg-purple-700 active:scale-95 text-white font-bold py-4 px-8 rounded-xl text-base sm:text-lg transition-all shadow-lg hover:shadow-xl"
          >
            Create Your Agent
          </Link>
          <Link
            href="/explore"
            className="w-full sm:w-auto bg-gray-800 hover:bg-gray-700 active:scale-95 text-white font-bold py-4 px-8 rounded-xl text-base sm:text-lg transition-all"
          >
            Explore Agents
          </Link>
          <div className="w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>button]:min-h-[48px] [&>button]:text-base [&>button]:rounded-xl">
            <WalletMultiButton />
          </div>
        </div>
      </div>

      {/* Features - Mobile Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-20">
        <FeatureCard
          icon="🤖"
          title="AI-Powered"
          description="GPT-4 analyzes market sentiment and makes intelligent trading decisions for your agent"
        />
        <FeatureCard
          icon="⚡"
          title="Fully Autonomous"
          description="Your agent runs 24/7 without any manual intervention, executing trades automatically"
        />
        <FeatureCard
          icon="🔒"
          title="Secure & Transparent"
          description="All trades are executed on-chain with full transparency and immutable records"
        />
        <FeatureCard
          icon="💰"
          title="Tokenized Ownership"
          description="Each agent has its own SPL token. Hold tokens to earn revenue share from profits"
        />
        <FeatureCard
          icon="📈"
          title="Jupiter Integration"
          description="Best-in-class DEX aggregation ensures optimal trade execution prices"
        />
        <FeatureCard
          icon="📱"
          title="Solana Mobile Ready"
          description="Optimized for Solana Saga with native mobile wallet adapter support"
        />
      </div>

      {/* How it Works */}
      <div className="mb-12 sm:mb-20">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 px-2">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <StepCard number="1" title="Create" description="Define your agent's mission and launch it for 0.1 SOL" />
          <StepCard number="2" title="Fund" description="Deposit SOL into your agent's vault to start trading" />
          <StepCard number="3" title="Trade" description="Your agent analyzes markets and executes trades autonomously" />
          <StepCard number="4" title="Earn" description="Hold agent tokens to claim your share of trading profits" />
        </div>
        <div className="text-center mt-8">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-solana-purple hover:text-purple-400 font-semibold text-lg transition-colors"
          >
            📚 Read Full Documentation
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Roadmap */}
      <div className="mb-12 sm:mb-20">
        <h2 className="text-2xl sm:text-4xl font-bold text-center mb-4 sm:mb-6 px-2">Roadmap</h2>
        <p className="text-center text-gray-400 mb-8 max-w-2xl mx-auto px-4">
          Our vision for the future of AI-powered trading on Solana
        </p>
        <RoadmapTimeline />

        {/* Roadmap Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <RoadmapCard
            phase="Q2 2025"
            title="Subagent System"
            status="In Progress"
            description="Create specialized subagents that work together under a master agent for complex trading strategies"
            features={[
              "Market analyzer subagent",
              "Risk manager subagent",
              "Execution optimizer subagent"
            ]}
          />
          <RoadmapCard
            phase="Q2 2025"
            title="NFT Collection"
            status="Coming Soon"
            description="Exclusive NFT collection for early adopters with special benefits and governance rights"
            features={[
              "Unique AI-generated art",
              "Premium agent features",
              "Revenue share boost"
            ]}
          />
          <RoadmapCard
            phase="Q3 2025"
            title="Social Trading"
            status="Planned"
            description="Follow and copy successful agents automatically to benefit from proven strategies"
            features={[
              "Agent leaderboards",
              "Copy trading",
              "Social portfolios"
            ]}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gray-900/50 rounded-xl p-6 sm:p-8 border border-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
          <StatCard label="Active Agents" value="127" />
          <StatCard label="Total Volume" value="$2.4M" />
          <StatCard label="Trades Executed" value="8,453" />
          <StatCard label="Success Rate" value="87%" />
        </div>
      </div>
    </div>
  );
}

function RoadmapCard({ phase, title, status, description, features }: {
  phase: string;
  title: string;
  status: string;
  description: string;
  features: string[];
}) {
  const statusColor = status === 'In Progress' ? 'text-solana-purple' : status === 'Coming Soon' ? 'text-solana-green' : 'text-gray-400';

  return (
    <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:border-solana-purple transition-all">
      <div className="flex justify-between items-start mb-3">
        <span className="text-sm text-gray-500">{phase}</span>
        <span className={`text-xs font-semibold ${statusColor}`}>{status}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-400 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="text-sm text-gray-300 flex items-start">
            <span className="text-solana-green mr-2">✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-900/50 rounded-xl p-5 sm:p-6 border border-gray-800 hover:border-solana-purple transition-all hover:scale-105 active:scale-100 touch-manipulation">
      <div className="text-3xl sm:text-4xl mb-3 sm:mb-4 text-center sm:text-left">{icon}</div>
      <h3 className="text-lg sm:text-xl font-bold mb-2 text-center sm:text-left">{title}</h3>
      <p className="text-sm sm:text-base text-gray-400 text-center sm:text-left">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-solana-purple rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4 shadow-lg">
        {number}
      </div>
      <h3 className="text-lg sm:text-xl font-bold mb-2">{title}</h3>
      <p className="text-sm sm:text-base text-gray-400 px-2">{description}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-2xl sm:text-4xl font-bold text-solana-green mb-1 sm:mb-2">{value}</div>
      <div className="text-xs sm:text-base text-gray-400">{label}</div>
    </div>
  );
}
