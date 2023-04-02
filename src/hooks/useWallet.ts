import { Wallet } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import { useSelector } from '@/store/store';
import { walletAdapters } from '@/constant';

const useWallet = () => {
  const walletState = useSelector((s) => s.wallet);

  const [wallet, setWallet] = useState<Wallet | null>(null);

  useEffect(() => {
    if (!walletState) return;

    const adapter = walletAdapters[walletState.adapterName];

    // Cast to wallet because Adapters contains necessary Wallet functions
    setWallet(adapter as unknown as Wallet);
  }, [walletState]);

  return wallet;
};

export default useWallet;
