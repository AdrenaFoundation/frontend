import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { useStandardWalletAdapters } from '@solana/wallet-standard-wallet-adapter-react';
import { useMemo } from 'react';

import { ImageRef, WalletAdapterExtended } from "@/types";

import backpackLogo from '../../public/images/backpack.png';
import coinbaseLogo from '../../public/images/coinbase.png';
import phantomLogo from '../../public/images/phantom.svg';
import solflareLogo from '../../public/images/solflare.png';
import squadxLogo from '../../public/images/squadx-logo.png';
import walletconnectLogo from '../../public/images/walletconnect.png';
import { usePrivyAdapter } from "./usePrivyAdapter";

export const WALLET_ICONS = {
  Phantom: phantomLogo,
  Backpack: backpackLogo,
  Solflare: solflareLogo,
  WalletConnect: walletconnectLogo,
  'Coinbase Wallet': coinbaseLogo,
  SquadsX: squadxLogo,
  Privy: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgdmlld0JveD0iMCAwIDEyOCAxMjgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4IiByeD0iNjQiIGZpbGw9IiM2QTU5RkYiLz4KPHBhdGggZD0iTTY0IDMyQzQ1LjIgMzIgMzAgNDcuMiAzMCA2NkMzMCA4NC44IDQ1LjIgMTAwIDY0IDEwMEM4Mi44IDEwMCA5OCA4NC44IDk4IDY2Qzk4IDQ3LjIgODIuOCAzMiA2NCAzMlpNNjQgODhDNTEuOSA4OCA0MiA3OC4xIDQyIDY2QzQyIDUzLjkgNTEuOSA0NCA2NCA0NEM3Ni4xIDQ0IDg2IDUzLjkgODYgNjZDODYgNzguMSA3Ni4xIDg4IDY0IDg4WiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+',
} as const satisfies Partial<Record<WalletAdapterName, ImageRef | string>>;

const SUPPORTED_WALLETS = [
  'Phantom',
  'Coinbase Wallet',
  'Solflare',
  'WalletConnect',
  'Backpack',
  'SquadsX',
  'Privy',
] as const;

// Handpicked list of supported wallets
export type WalletAdapterName = (typeof SUPPORTED_WALLETS)[number];

export const WALLET_COLORS = {
  Phantom: '#ab9ff2',
  Backpack: '#E33E3F',
  Solflare: '#FFEF46',
  WalletConnect: '#0798fe',
  'Coinbase Wallet': '#072b79',
  SquadsX: '#000000',
  Privy: '#6A59FF',
} as const satisfies Record<WalletAdapterName, string>;

export default function useWalletAdapters(): WalletAdapterExtended[] {

  const standardAdapters = useStandardWalletAdapters([
    // Add specialized wallet adapters here
    //
    // Wallets compatible with the @solana/wallet-adapter-wallets package will be added automatically
    new PhantomWalletAdapter(),
    new CoinbaseWalletAdapter(),
    new SolflareWalletAdapter(),
    new WalletConnectWalletAdapter({
      network: WalletAdapterNetwork.Mainnet,
      options: {
        projectId: '549f49d83c4bc0a5c405d8ef6db7972a',
        relayUrl: 'wss://relay.walletconnect.org',
        metadata: {
          name: 'Adrena',
          description: 'Perpetuals DEX for the Solana community',
          url: 'https://app.adrena.xyz',
          icons: ['https://avatars.githubusercontent.com/u/179229932'],
        },
      },
    }),
  ]);

  // Use pure Privy adapter for all Privy-based connections (including external wallets)
  const privyAdapter = usePrivyAdapter();

  // Combine standard adapters with Privy adapter
  const allAdapters = useMemo(() => {
    const combinedAdapters = privyAdapter
      ? [...standardAdapters, privyAdapter]
      : standardAdapters;

    return combinedAdapters;
  }, [standardAdapters, privyAdapter]);

  // Remove the adapters that has been added automatically but that we don't want to use
  return useMemo(() => allAdapters.filter(adapter => {
    // Always include the Privy adapter - it handles external wallet validation internally
    if (adapter === privyAdapter) {
      return true;
    }

    // For native (non-Privy) adapters, check if they're in our supported list
    const isSupported = SUPPORTED_WALLETS.includes(adapter.name as WalletAdapterName);

    return isSupported;
  }).map((adapter) => {
    const name = adapter.name as WalletAdapterName;

    (adapter as WalletAdapterExtended).color = WALLET_COLORS[name] ?? '#444444';
    (adapter as WalletAdapterExtended).iconOverride = WALLET_ICONS[name];
    (adapter as WalletAdapterExtended).recommended = adapter.name === 'Phantom';
    (adapter as WalletAdapterExtended).beta = adapter.name === 'WalletConnect' || adapter.name === 'SquadsX';
    (adapter as WalletAdapterExtended).walletName = name;

    return adapter as WalletAdapterExtended;
  }), [allAdapters, privyAdapter]);
}
