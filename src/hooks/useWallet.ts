import { Wallet } from '@coral-xyz/anchor';

import { useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';

export default function useWallet(adapters: WalletAdapterExtended[]) {
  const walletState = useSelector((s) => s.walletState.wallet);

  if (walletState) {
    const adapter = adapters.find((x) => x.name === walletState.adapterName);

    // Cast to wallet because Adapters contains necessary Wallet functions
    return (adapter as unknown as Wallet) ?? null;
  }

  return null;
}
