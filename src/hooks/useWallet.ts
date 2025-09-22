import { Wallet } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';

export default function useWallet(adapters: WalletAdapterExtended[]) {
  const walletState = useSelector((s) => s.walletState.wallet);

  if (walletState) {
    const adapter = adapters.find((x) => x.name === walletState.adapterName);

    if (!adapter) return null;

    if (adapter.name === 'Coinbase Wallet') {
      const enhancedWallet = {
        ...adapter,
        get publicKey() {
          return adapter.publicKey || new PublicKey(walletState.walletAddress);
        },
        async signTransaction(transaction: Transaction) {
          if (!adapter.connected) {
            await adapter.connect();
          }
          if (
            'signTransaction' in adapter &&
            typeof adapter.signTransaction === 'function'
          ) {
            return adapter.signTransaction(transaction);
          }
          throw new Error('Coinbase Wallet signing failed');
        },
      };
      return enhancedWallet as unknown as Wallet;
    }

    return (adapter as unknown as Wallet) ?? null;
  }

  return null;
}
