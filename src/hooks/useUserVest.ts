import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { VestExtended } from '@/types';
import { nativeToUi } from '@/utils';

export default function useUserVest(walletAddress: string | null): {
  vestAmounts: {
    amount: number;
    claimedAmount: number;
    claimableAmount: number;
  };
  userVest: VestExtended | false | null;
  triggerUserVestReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);

  // null = not loaded yet
  // false = no vest
  const [userVest, setUserVest] = useState<VestExtended | false | null>(null);
  const [vestAmounts, setVestAmounts] = useState<{
    amount: number;
    claimedAmount: number;
    claimableAmount: number;
  }>({
    amount: 0,
    claimedAmount: 0,
    claimableAmount: 0,
  });

  const fetchUserVest = useCallback(async () => {
    if (!walletAddress || !window.adrena.client.readonlyConnection) {
      setUserVest(null);
      return;
    }

    setUserVest(
      await window.adrena.client.loadUserVest(new PublicKey(walletAddress)),
    );
  }, [walletAddress]);

  useEffect(() => {
    fetchUserVest();

    const interval = setInterval(() => {
      fetchUserVest();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUserVest, trickReload, window.adrena.client.readonlyConnection]);

  useEffect(() => {
    if (!userVest) return;

    const amount = nativeToUi(
      userVest.amount,
      window.adrena.client.adxToken.decimals,
    );

    const claimedAmount = nativeToUi(
      userVest.claimedAmount,
      window.adrena.client.adxToken.decimals,
    );

    // Calculate how much tokens per seconds are getting accrued for the userVest
    const amountPerSecond =
      amount /
      (userVest.unlockEndTimestamp.toNumber() * 1000 -
        userVest.unlockStartTimestamp.toNumber() * 1000);

    const start = new Date(userVest.unlockStartTimestamp.toNumber() * 1000);

    const interval = setInterval(() => {
      if (!userVest) return;
      if (start > new Date()) return;

      // Calculate how many seconds has passed since the last claim
      const nbSecondsSinceLastClaim =
        Date.now() -
        (userVest.lastClaimTimestamp.toNumber() === 0
          ? userVest.unlockStartTimestamp.toNumber()
          : userVest.lastClaimTimestamp.toNumber()) *
          1000;

      const claimableAmount = nbSecondsSinceLastClaim * amountPerSecond;

      setVestAmounts({
        amount,
        claimedAmount,
        claimableAmount,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userVest]);

  return {
    vestAmounts,
    userVest,
    triggerUserVestReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
