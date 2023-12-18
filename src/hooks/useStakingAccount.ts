import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { Staking } from '@/types';

// TODO: Reload periodically?
const useStakingAccount = (stakedTokenMint: PublicKey): Staking | null => {
  const [stakingAccount, setStakingAccount] = useState<Staking | null>(null);

  const pda = window.adrena.client.getStakingPda(stakedTokenMint);

  const fetchStakingAccount = useCallback(async () => {
    setStakingAccount(await window.adrena.client.loadStakingAccount(pda));
  }, [pda]);

  useEffect(() => {
    fetchStakingAccount();
  }, [fetchStakingAccount]);

  return stakingAccount;
};

export default useStakingAccount;
