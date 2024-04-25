import { Wallet } from '@coral-xyz/anchor';
import { useEffect, useState } from 'react';

import { walletAdapters } from '@/constant';
import { useSelector } from '@/store/store';

const useWallet = () => {
  console.log('useWallet called');
  const walletState = useSelector((s) => s.walletState.wallet);

  const [wallet, setWallet] = useState<Wallet | null>(null);

  console.log('wallet', wallet);

  useEffect(() => {
    if (!walletState) {
      setWallet(null);
      return;
    }

    const adapter = walletAdapters[walletState.adapterName];

    // Cast to wallet because Adapters contains necessary Wallet functions
    setWallet(adapter as unknown as Wallet);
  }, [walletState]);

  return wallet;
};

export default useWallet;
