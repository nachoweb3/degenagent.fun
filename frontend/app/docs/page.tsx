'use client';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent">
            Agent.fun Documentation
          </h1>
          <p className="text-xl text-gray-400">
            Complete guide to creating and managing AI trading agents on Solana
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-12">
          <h2 className="text-2xl font-bold mb-4">Table of Contents</h2>
          <nav className="space-y-2">
            <a href="#getting-started" className="block text-solana-purple hover:text-solana-green transition-colors">
              1. Getting Started
            </a>
            <a href="#creating-agents" className="block text-solana-purple hover:text-solana-green transition-colors">
              2. Creating Your First Agent
            </a>
            <a href="#funding" className="block text-solana-purple hover:text-solana-green transition-colors">
              3. Funding Your Agent
            </a>
            <a href="#trading" className="block text-solana-purple hover:text-solana-green transition-colors">
              4. How Trading Works
            </a>
            <a href="#fees" className="block text-solana-purple hover:text-solana-green transition-colors">
              5. Fees & Revenue
            </a>
            <a href="#security" className="block text-solana-purple hover:text-solana-green transition-colors">
              6. Security & Keys
            </a>
            <a href="#advanced" className="block text-solana-purple hover:text-solana-green transition-colors">
              7. Advanced Features
            </a>
          </nav>
        </div>

        {/* Content Sections */}
        <div className="space-y-16">

          {/* Getting Started */}
          <section id="getting-started" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">1. Getting Started</h2>
            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Prerequisites</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>A Solana wallet (Phantom, Solflare, or Torus)</li>
                  <li>SOL for agent creation fee (0.5 SOL minimum)</li>
                  <li>Additional SOL for trading capital</li>
                </ul>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Quick Start</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Connect your Solana wallet using the button in the top right</li>
                  <li>Navigate to "Create Agent" page</li>
                  <li>Fill in your agent's details and mission</li>
                  <li>Approve the transaction (0.5 SOL creation fee)</li>
                  <li>Fund your agent with trading capital</li>
                  <li>Your agent will start trading automatically!</li>
                </ol>
              </div>
            </div>
          </section>

          {/* Creating Agents */}
          <section id="creating-agents" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">2. Creating Your First Agent</h2>
            <div className="space-y-6 text-gray-300">
              <p>
                Each agent is a unique autonomous trader with its own personality, strategy, and token.
              </p>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Agent Parameters</h3>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-solana-purple">Name</h4>
                    <p className="text-sm text-gray-400">
                      A unique identifier for your agent (max 32 characters)
                    </p>
                    <code className="block mt-2 bg-gray-800 p-2 rounded text-sm">
                      Example: "MoonHunter", "DiamondHands"
                    </code>
                  </div>

                  <div>
                    <h4 className="font-semibold text-solana-purple">Token Symbol</h4>
                    <p className="text-sm text-gray-400">
                      Your agent's token ticker (max 10 characters, uppercase)
                    </p>
                    <code className="block mt-2 bg-gray-800 p-2 rounded text-sm">
                      Example: "MOON", "DIAM"
                    </code>
                  </div>

                  <div>
                    <h4 className="font-semibold text-solana-purple">Mission</h4>
                    <p className="text-sm text-gray-400">
                      Describe your agent's trading strategy (max 200 characters)
                    </p>
                    <code className="block mt-2 bg-gray-800 p-2 rounded text-sm">
                      Example: "Trade trending memecoins with aggressive risk appetite to maximize short-term gains"
                    </code>
                  </div>
                </div>
              </div>

              <div className="bg-solana-purple/10 border border-solana-purple rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2 text-solana-purple">💡 Pro Tip</h3>
                <p className="text-sm">
                  The more specific your mission, the better your agent will perform.
                  Include risk tolerance, preferred tokens, and trading style.
                </p>
              </div>
            </div>
          </section>

          {/* Funding */}
          <section id="funding" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">3. Funding Your Agent</h2>
            <div className="space-y-6 text-gray-300">
              <p>
                After creating your agent, you need to deposit SOL for it to trade with.
              </p>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">How to Fund</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li>Navigate to your agent's page</li>
                  <li>Click "Deposit Funds"</li>
                  <li>Enter the amount of SOL to deposit</li>
                  <li>Approve the transaction</li>
                </ol>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Recommended Amounts</h3>
                <ul className="space-y-2">
                  <li><strong className="text-solana-green">Beginner:</strong> 1-5 SOL</li>
                  <li><strong className="text-solana-green">Intermediate:</strong> 5-20 SOL</li>
                  <li><strong className="text-solana-green">Advanced:</strong> 20+ SOL</li>
                </ul>
                <p className="mt-4 text-sm text-gray-400">
                  Note: Your agent needs at least 0.1 SOL to execute trades effectively.
                </p>
              </div>
            </div>
          </section>

          {/* Trading */}
          <section id="trading" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">4. How Trading Works</h2>
            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Trading Cycle</h3>
                <ol className="space-y-3 list-decimal list-inside">
                  <li><strong>Market Analysis:</strong> Agent fetches real-time market data</li>
                  <li><strong>AI Decision:</strong> Google Gemini AI analyzes data based on agent's mission</li>
                  <li><strong>Trade Execution:</strong> If opportunity found, executes swap via Jupiter</li>
                  <li><strong>Fee Collection:</strong> Platform takes 1% of profits</li>
                  <li><strong>Repeat:</strong> Cycle runs every 5 minutes</li>
                </ol>
              </div>

              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Supported Tokens</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="font-semibold">SOL</div>
                    <div className="text-xs text-gray-400">Solana</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="font-semibold">USDC</div>
                    <div className="text-xs text-gray-400">USD Coin</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="font-semibold">WIF</div>
                    <div className="text-xs text-gray-400">dogwifhat</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="font-semibold">BONK</div>
                    <div className="text-xs text-gray-400">Bonk</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg text-center">
                    <div className="font-semibold">MYRO</div>
                    <div className="text-xs text-gray-400">Myro</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Fees */}
          <section id="fees" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">5. Fees & Revenue</h2>
            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Fee Structure</h3>
                <ul className="space-y-3">
                  <li>
                    <strong className="text-solana-purple">Agent Creation:</strong> 0.5 SOL (one-time)
                  </li>
                  <li>
                    <strong className="text-solana-purple">Trading Fee:</strong> 1% of profits only
                  </li>
                  <li>
                    <strong className="text-solana-purple">Network Fees:</strong> Standard Solana gas (~0.000005 SOL per tx)
                  </li>
                </ul>
              </div>

              <div className="bg-solana-green/10 border border-solana-green rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2 text-solana-green">💰 Revenue Model</h3>
                <p className="text-sm">
                  Platform earns 1% only when YOUR agent makes profitable trades.
                  If the trade loses money, no fee is charged. We succeed when you succeed!
                </p>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="security" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">6. Security & Keys</h2>
            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">How We Protect Your Funds</h3>
                <ul className="space-y-3 list-disc list-inside">
                  <li><strong>Encrypted Storage:</strong> Agent keys encrypted with AES-256-GCM</li>
                  <li><strong>Secure Vault:</strong> Funds stored in PDA (Program Derived Address)</li>
                  <li><strong>No Custody:</strong> You maintain full control via your wallet</li>
                  <li><strong>Open Source:</strong> Code is auditable on GitHub</li>
                </ul>
              </div>

              <div className="bg-red-500/10 border border-red-500 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-2 text-red-500">⚠️ Important Security Notes</h3>
                <ul className="text-sm space-y-2 list-disc list-inside">
                  <li>Never share your wallet private key</li>
                  <li>Always verify transaction details before signing</li>
                  <li>Start with small amounts to test the system</li>
                  <li>Monitor your agent's activity regularly</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Advanced */}
          <section id="advanced" className="scroll-mt-20">
            <h2 className="text-3xl font-bold mb-6">7. Advanced Features</h2>
            <div className="space-y-6 text-gray-300">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-white">Coming Soon</h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Custom trading strategies</li>
                  <li>Portfolio rebalancing</li>
                  <li>Social trading (copy successful agents)</li>
                  <li>Advanced analytics dashboard</li>
                  <li>Multi-agent coordination</li>
                  <li>Stop-loss and take-profit orders</li>
                </ul>
              </div>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-16 bg-gradient-to-r from-solana-purple to-solana-green p-8 rounded-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start?</h2>
          <p className="text-lg mb-6">Create your first AI trading agent now</p>
          <a
            href="/create"
            className="inline-block bg-white text-black font-bold py-4 px-8 rounded-xl hover:scale-105 transition-transform"
          >
            Launch Your Agent
          </a>
        </div>
      </div>
    </div>
  );
}
