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

// Memoize adapter instances to prevent new objects on every render
const walletAdapterInstances = [
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
        url: 'https://www.adrena.trade',
        icons: ['https://avatars.githubusercontent.com/u/179229932'],
      },
    },
  }),
];

export default function useWalletAdapters(): WalletAdapterExtended[] {
  const standardAdapters = useStandardWalletAdapters(walletAdapterInstances);

  // Use pure Privy adapter for all Privy-based connections (including external wallets)
  const privyAdapter = usePrivyAdapter();

  // Combine standard adapters with Privy adapter
  const allAdapters = useMemo(() => {
    const combinedAdapters = privyAdapter
      ? [...standardAdapters, privyAdapter]
      : standardAdapters;

    return combinedAdapters;
  }, [standardAdapters, privyAdapter]);

  const filteredAdapters = allAdapters.filter(adapter => {
    // Always include the Privy adapter - identify by name to avoid reference issues
    if (adapter.name === 'Privy') {
      return true;
    }

    // For native (non-Privy) adapters, check if they're in our supported list
    const isSupported = SUPPORTED_WALLETS.includes(adapter.name as WalletAdapterName);

    return isSupported;
  });

  return filteredAdapters.map((adapter) => {
    const name = adapter.name as WalletAdapterName;

    // Check if adapter already has extended properties to avoid unnecessary mutations
    const extendedAdapter = adapter as WalletAdapterExtended;
    if (extendedAdapter.color && extendedAdapter.walletName) {
      return extendedAdapter; // Already enhanced, return as-is
    }

    // Safely mutate the adapter by adding only the UI properties
    // This preserves all the wallet functionality while adding our custom properties
    extendedAdapter.color = WALLET_COLORS[name] ?? '#444444';
    extendedAdapter.iconOverride = WALLET_ICONS[name];
    extendedAdapter.recommended = adapter.name === 'Phantom';
    extendedAdapter.beta = adapter.name === 'WalletConnect' || adapter.name === 'SquadsX';
    extendedAdapter.walletName = name;

    return extendedAdapter;
  });
}
