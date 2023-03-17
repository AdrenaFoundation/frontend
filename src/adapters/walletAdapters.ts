import { Adapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

export type WalletAdapterName = 'phantom';

export function getWalletAdapters(): Record<WalletAdapterName, Adapter> {
    return {
        phantom: new PhantomWalletAdapter(),
    };
}
