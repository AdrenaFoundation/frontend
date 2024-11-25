import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { CoinbaseWalletAdapter } from '@solana/wallet-adapter-coinbase';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { useStandardWalletAdapters } from "@solana/wallet-standard-wallet-adapter-react";
import { useMemo } from "react";

import { ImageRef, WalletAdapterExtended } from "@/types";

import backpackLogo from '../../public/images/backpack.png';
import coinbaseLogo from '../../public/images/coinbase.png';
import phantomLogo from '../../public/images/phantom.svg';
import solflareLogo from '../../public/images/solflare.png';
import squadxLogo from '../../public/images/squadx-logo.png';
import walletconnectLogo from '../../public/images/walletconnect.png';

export const WALLET_ICONS = {
    Phantom: phantomLogo,
    Backpack: backpackLogo,
    Solflare: solflareLogo,
    WalletConnect: walletconnectLogo,
    'Coinbase Wallet': coinbaseLogo,
    SquadsX: squadxLogo,
} as const satisfies Partial<Record<WalletAdapterName, ImageRef>>;

const SUPPORTED_WALLETS = [
    'Phantom',
    'Coinbase Wallet',
    'Solflare',
    'WalletConnect',
    'Backpack',
    'SquadsX',
] as const;

// Handpicked list of supported wallets
export type WalletAdapterName = typeof SUPPORTED_WALLETS[number];

export const WALLET_COLORS = {
    Phantom: '#ab9ff2',
    Backpack: '#E33E3F',
    Solflare: '#fda518',
    WalletConnect: '#0798fe',
    'Coinbase Wallet': '#072b79',
    SquadsX: '#000000',
} as const satisfies Record<WalletAdapterName, string>;

export default function useWalletAdapters(): WalletAdapterExtended[] {
    const adapters = useStandardWalletAdapters([
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

    // Remove the adapters that has been added automatically but that we don't want to use
    return useMemo(() => adapters.filter(adapter => {
        return SUPPORTED_WALLETS.includes(adapter.name as unknown as WalletAdapterName);
    }).map((adapter) => {
        (adapter as WalletAdapterExtended).color = WALLET_COLORS[adapter.name as WalletAdapterName] ?? '#444444';
        (adapter as WalletAdapterExtended).iconOverride = WALLET_ICONS[adapter.name as WalletAdapterName];
        (adapter as WalletAdapterExtended).recommended = adapter.name === 'Phantom';
        (adapter as WalletAdapterExtended).beta = adapter.name === 'WalletConnect' || adapter.name === 'SquadsX';

        return adapter as WalletAdapterExtended;
    }), [adapters]);
}