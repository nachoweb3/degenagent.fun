import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletProviderWrapper } from '@/components/WalletProvider';
import MobileMenu from '@/components/MobileMenu';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DegenAgent.fun - AI Trading Agents on Solana',
  description: 'Create and manage autonomous AI trading agents on Solana. Compete for prizes, earn referral rewards, and dominate the leaderboard.',
  manifest: '/manifest.json',
  themeColor: '#9945FF',
  icons: {
    icon: [
      { url: '/logo.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProviderWrapper>
          <nav className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16 items-center">
                <a href="/" className="flex items-center gap-2 sm:gap-3">
                  <img src="/logo.svg" alt="DegenAgent.fun" className="w-8 h-8 sm:w-10 sm:h-10" />
                  <span className="text-xl sm:text-2xl logo-shine">DegenAgent.fun</span>
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-4">
                  <a href="/create" className="text-gray-300 hover:text-white transition-colors">
                    Create Agent
                  </a>
                  <a href="/vaults" className="text-gray-300 hover:text-white transition-colors font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                    💰 Vaults
                  </a>
                  <a href="/copy-trading" className="text-gray-300 hover:text-white transition-colors font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    📋 Copy Trading
                  </a>
                  <a href="/leaderboard" className="text-gray-300 hover:text-white transition-colors font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    🏆 Leaderboard
                  </a>
                  <a href="/challenges" className="text-gray-300 hover:text-white transition-colors">
                    🎊 Challenges
                  </a>
                  <a href="/feed" className="text-gray-300 hover:text-white transition-colors">
                    💬 Feed
                  </a>
                  <a href="/referrals" className="text-gray-300 hover:text-white transition-colors font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    🎁 Earn 10%
                  </a>
                  <a href="/reality-show" className="text-gray-300 hover:text-white transition-colors font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
                    🔴 LIVE
                  </a>
                  <div className="flex items-center gap-3 ml-4 border-l border-gray-700 pl-4">
                    <a
                      href="https://twitter.com/nachoweb3"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
                      title="Twitter"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                    <a
                      href="https://t.me/agentfun"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#0088cc] transition-colors"
                      title="Telegram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                      </svg>
                    </a>
                    <a
                      href="https://discord.gg/agentfun"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#5865F2] transition-colors"
                      title="Discord"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Mobile Menu */}
                <MobileMenu />
              </div>
            </div>
          </nav>
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="border-t border-gray-800 bg-black/50 backdrop-blur-sm mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex flex-col items-center gap-4">
                <div className="flex items-center gap-4">
                  <a
                    href="https://twitter.com/nachoweb3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#1DA1F2] transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
                    title="Twitter"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a
                    href="https://t.me/agentfun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#0088cc] transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
                    title="Telegram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                    </svg>
                  </a>
                  <a
                    href="https://discord.gg/agentfun"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-[#5865F2] transition-colors p-2 hover:bg-gray-800/50 rounded-lg"
                    title="Discord"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                  </a>
                </div>
                <p className="text-center text-gray-500">
                  Built on Solana by{' '}
                  <a
                    href="https://twitter.com/nachoweb3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-transparent hover:from-solana-green hover:to-solana-purple transition-all font-semibold"
                  >
                    @nachoweb3
                  </a>
                  {' '}| Powered by AI
                </p>
              </div>
            </div>
          </footer>
        </WalletProviderWrapper>
      </body>
    </html>
  );
}
