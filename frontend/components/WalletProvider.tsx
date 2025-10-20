'use client';

import { FC, ReactNode, useMemo } from 'react';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  CoinbaseWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

interface WalletProviderWrapperProps {
  children: ReactNode;
}

export const WalletProviderWrapper: FC<WalletProviderWrapperProps> = ({
  children,
}) => {
  // Use production network - FIXED: Always use mainnet-beta
  const network = WalletAdapterNetwork.Mainnet;

  // RPC endpoint with fallback
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_ENDPOINT;
    console.log('[WalletProvider] Using RPC:', rpcUrl ? 'Custom Helius' : 'Default cluster');
    return rpcUrl || clusterApiUrl(network);
  }, [network]);

  // Wallet configuration with mobile support
  const wallets = useMemo(
    () => {
      console.log('[WalletProvider] Initializing wallet adapters...');
      return [
        // Popular desktop & mobile wallets
        new PhantomWalletAdapter(),
        new SolflareWalletAdapter(),
        new CoinbaseWalletAdapter(),
        new TrustWalletAdapter(),
        new TorusWalletAdapter(),

        // Note: Solana Mobile Wallet Adapter automatically detects
        // and works with Solana Saga / Seeker phones via dApp browser
        // Backpack wallet is also auto-detected on mobile
        // No additional adapters needed - they're built into the phone
      ];
    },
    []
  );

  const onError = useMemo(
    () => (error: any) => {
      console.error('[WalletProvider] Error:', error);
    },
    []
  );

  console.log('[WalletProvider] Rendering with', wallets.length, 'wallet adapters');

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect onError={onError}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
