'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { publicKey, disconnect } = useWallet();

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { href: '/', label: '🏠 Home' },
    { href: '/explore', label: '🔍 Explore' },
    { href: '/marketplace', label: '🛒 Marketplace' },
    { href: '/vaults', label: '💰 Vaults' },
    { href: '/leaderboard', label: '🏆 Leaderboard' },
    { href: '/create', label: '➕ Create Agent', highlight: true },
  ];

  const profileItems = publicKey ? [
    { href: '/profile', label: '👤 My Profile' },
    { href: '/analytics', label: '📊 Analytics' },
    { href: '/referrals', label: '🎁 Referrals' },
  ] : [];

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden relative z-[120] p-2 text-gray-300 hover:text-white focus:outline-none"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <span
            className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-current transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 w-full bg-current transform transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] md:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black border-l border-purple-600/30 shadow-2xl transform transition-transform duration-300 ease-in-out z-[110] md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header with Wallet */}
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 p-6 border-b border-gray-800">
          <div className="mb-4">
            <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700 !text-sm" />
          </div>
          {publicKey && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl">
                {publicKey.toString().slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs text-gray-400 font-mono">
                {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col px-4 py-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</p>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={toggleMenu}
              className={`py-3 px-4 rounded-lg text-base transition-colors mb-1 ${
                item.highlight
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Profile Section */}
          {profileItems.length > 0 && (
            <>
              <div className="border-t border-gray-800 my-4"></div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 px-2">Profile</p>
              {profileItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={toggleMenu}
                  className="py-3 px-4 rounded-lg text-base text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mb-1"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  disconnect();
                  toggleMenu();
                }}
                className="py-3 px-4 rounded-lg text-base text-red-400 hover:bg-gray-800 transition-colors mb-1 text-left w-full"
              >
                🚪 Disconnect Wallet
              </button>
            </>
          )}
        </nav>

        {/* Social Footer */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-900/50 backdrop-blur-sm p-4 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-3 text-center">Follow Us</p>
          <div className="flex justify-center gap-6">
            <a
              href="https://twitter.com/nachoweb3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#1DA1F2] transition-colors"
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
              className="text-gray-400 hover:text-[#0088cc] transition-colors"
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
              className="text-gray-400 hover:text-[#5865F2] transition-colors"
              title="Discord"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
