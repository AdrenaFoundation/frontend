import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';

export type WalletStakingAccounts = {
  ADX: UserStakingExtended | null;
  ALP: UserStakingExtended | null;
};

export default function useWalletStakingAccounts(
  walletAddress: string | null,
): {
  stakingAccounts: WalletStakingAccounts | null;
  triggerWalletStakingAccountsReload: () => void;
} {
  const [triggerCount, setTriggerCount] = useState<number>(0);

  const [stakingAccounts, setStakingAccounts] = useState<{
    ADX: UserStakingExtended | null;
    ALP: UserStakingExtended | null;
  } | null>(null);

  const getUserStakingAccount = useCallback(async () => {
    if (!walletAddress || !window.adrena.client.readonlyConnection) {
      return;
    }

    const owner = new PublicKey(walletAddress);

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
  }, [walletAddress]);

  useEffect(() => {
    getUserStakingAccount();

    // trigger also when connection change in case the call happens before everything is set up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getUserStakingAccount,
    window.adrena.client.readonlyConnection,
    triggerCount,
  ]);

  return {
    stakingAccounts,
    triggerWalletStakingAccountsReload: () => {
      setTriggerCount(triggerCount + 1);
    },
  };
}
