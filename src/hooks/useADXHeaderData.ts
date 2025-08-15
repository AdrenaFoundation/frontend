import { useCallback, useEffect, useMemo, useState } from 'react';

import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useAPR from '@/hooks/useAPR';
import { useSelector } from '@/store/store';

export type ADXHeaderData = {
  circulatingSupply: number | null;
  totalStaked: number | null;
  tokenPrice: number | null;
  apr: number | null;
  circulatingPercentage: number | null;
  stakedPercentage: number | null;
};

export default function useADXHeaderData(): ADXHeaderData {
  const [totalStaked, setTotalStaked] = useState<number | null>(null);

  const adxTotalSupply = useADXTotalSupply();
  const adxCirculatingSupply = useADXCirculatingSupply({
    totalSupplyADX: adxTotalSupply,
  });
  const { aprs } = useAPR();
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const loadADXStakingData = useCallback(async () => {
    try {
      const allStaking = await window.adrena.client.loadAllStaking();

      if (!allStaking) {
        setTotalStaked(null);
        return;
      }

      let total = 0;
      allStaking.forEach((staking) => {
        if (staking.stakingType === 1) {
          const decimals = window.adrena.client.adxToken.decimals;

          total +=
            staking.liquidStake.amount.toNumber() / Math.pow(10, decimals);

          staking.lockedStakes.forEach((lockedStake) => {
            if (
              !lockedStake.endTime.isZero() &&
              lockedStake.endTime.toNumber() > Date.now() / 1000
            ) {
              total += lockedStake.amount.toNumber() / Math.pow(10, decimals);
            }
          });
        }
      });

      setTotalStaked(total);
    } catch (e) {
      console.error('Error loading ADX staking data:', e);
      setTotalStaked(null);
    }
  }, []);

  useEffect(() => {
    loadADXStakingData();

    const interval = setInterval(loadADXStakingData, 60 * 1000); // 1 minute

    return () => clearInterval(interval);
  }, [loadADXStakingData]);

  const circulatingPercentage =
    adxTotalSupply && adxCirculatingSupply
      ? (adxCirculatingSupply / adxTotalSupply) * 100
      : null;

  const stakedPercentage = useMemo(() => {
    return adxCirculatingSupply && totalStaked
      ? (totalStaked / adxCirculatingSupply) * 100
      : null;
  }, [adxCirculatingSupply, totalStaked]);

  return {
    circulatingSupply: adxCirculatingSupply,
    totalStaked,
    tokenPrice: tokenPriceADX,
    apr: aprs?.lm ?? null,
    circulatingPercentage,
    stakedPercentage,
  };
}
