import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { Staking } from '@/types';

const useStakingAccount = (stakedTokenMint: PublicKey): Staking | null => {
  const [stakingAccount, setStakingAccount] = useState<Staking | null>(null);

  const pda = window.adrena.client.getStakingPda(stakedTokenMint);

  const fetchStakingAccount = useCallback(async () => {
    setStakingAccount(await window.adrena.client.loadStakingAccount(pda));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pda.toBase58()]);

  useEffect(() => {
    fetchStakingAccount();

    // Reload periodically every 30 seconds
    const intervalId = setInterval(() => {
      fetchStakingAccount();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchStakingAccount]);

  return stakingAccount;
};

export default useStakingAccount;
