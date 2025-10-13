import { useEffect, useState } from 'react';

import { UserStakingExtended } from '@/types';

const MIN_ADX_AMOUNT = 10; // Filter out accounts with less than 10 ADX total

export function useAllAdxStaking(): {
  allAdxStaking: UserStakingExtended[] | null;
  triggerReload: () => void;
  isLoading: boolean;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [allAdxStaking, setAllAdxStaking] = useState<
    UserStakingExtended[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadAllAdxStaking = async () => {
      setIsLoading(true);
      try {
        // Fetch all ADX staking accounts (filtered on-chain by stakingType)
        const allStaking = await window.adrena.client.loadAllAdxStaking();

        if (!allStaking) {
          setAllAdxStaking(null);
          setIsLoading(false);
          return;
        }

        const stakingDecimals = window.adrena.client.adxToken.decimals;
        const minAmountNative = MIN_ADX_AMOUNT * Math.pow(10, stakingDecimals);

        // Filter out dust accounts (< 10 ADX total)
        const filtered = allStaking.filter((staking) => {
          const liquidAmount = staking.liquidStake.amount.toNumber();
          const lockedAmount = staking.lockedStakes.reduce(
            (acc, locked) => acc + locked.amount.toNumber(),
            0,
          );
          const totalAmount = liquidAmount + lockedAmount;

          return totalAmount >= minAmountNative;
        });

        setAllAdxStaking(filtered);
      } catch (e) {
        console.log('Error loading ADX staking accounts', e);
        setAllAdxStaking(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllAdxStaking();

    // Refresh every 60 seconds
    const interval = setInterval(loadAllAdxStaking, 60000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trickReload, window.adrena.client.readonlyConnection]);

  return {
    allAdxStaking,
    triggerReload: () => {
      triggerReload(trickReload + 1);
    },
    isLoading,
  };
}
