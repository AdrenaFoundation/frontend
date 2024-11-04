import { Wallet } from '@coral-xyz/anchor';

import { walletAdapters } from '@/constant';
import { useSelector } from '@/store/store';

export default function useWallet() {
  const walletState = useSelector((s) => s.walletState.wallet);
  // Cast to wallet because Adapters contains necessary Wallet functions
  const adapter = walletState
    ? (walletAdapters[walletState.adapterName] as unknown as Wallet)
    : null;

  return adapter;
}
