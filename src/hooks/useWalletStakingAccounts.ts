import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { UserStaking } from '@/types';

export type WalletStakingAccounts = {
  ADX: UserStaking | null;
  ALP: UserStaking | null;
};

export default function useWalletStakingAccounts(): {
  stakingAccounts: WalletStakingAccounts | null;
  triggerWalletStakingAccountsReload: () => void;
} {
  const wallet = useSelector((s) => s.walletState.wallet);
  const [triggerCount, setTriggerCount] = useState<number>(0);

  const [stakingAccounts, setStakingAccounts] = useState<{
    ADX: UserStaking | null;
    ALP: UserStaking | null;
  } | null>(null);

  const getUserStakingAccount = useCallback(async () => {
    if (!wallet || !wallet.walletAddress || !window.adrena.client.connection) {
      return;
    }

    const owner = new PublicKey(wallet.walletAddress);

    const [adxStakingAccount, alpStakingAccount] = await Promise.all([
      window.adrena.client.getUserStakingAccount({
        owner,
        stakedTokenMint: window.adrena.client.adxToken.mint,
      }),

      window.adrena.client.getUserStakingAccount({
        owner,
        stakedTokenMint: window.adrena.client.alpToken.mint,
      }),
    ]);

    setStakingAccounts({
      ADX: adxStakingAccount,
      ALP: alpStakingAccount,
    });
  }, [wallet]);

  useEffect(() => {
    getUserStakingAccount();

    // trigger also when connection change in case the call happens before everything is set up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getUserStakingAccount, window.adrena.client.connection, triggerCount]);

  return {
    stakingAccounts,
    triggerWalletStakingAccountsReload: () => {
      setTriggerCount(triggerCount + 1);
    },
  };
}
