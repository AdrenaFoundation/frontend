import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';

export interface RewardsData {
  pendingUsdcRewards: number;
  pendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
}

export const defaultRewardsData: RewardsData = {
  pendingUsdcRewards: 0,
  pendingAdxRewards: 0,
  pendingGenesisAdxRewards: 0,
};

export const useStakingClaimableRewards = (tokenSymbol: 'ADX' | 'ALP') => {
  const [rewards, setRewards] = useState<RewardsData>({
    pendingUsdcRewards: 0,
    pendingAdxRewards: 0,
    pendingGenesisAdxRewards: 0,
  });
  const wallet = useSelector((s) => s.walletState.wallet);


  const fetchRewards = useCallback(async () => {
    const walletAddress = wallet ? new PublicKey(wallet.walletAddress) : null;

    if (
      !walletAddress ||
      !window.adrena.client ||
      !window.adrena.client.connection
    ) {
      return;
    }

    try {
      const stakedTokenMint = tokenSymbol === 'ALP'
        ? window.adrena.client.lpTokenMint
        : window.adrena.client.lmTokenMint;
      const simulatedRewards = await window.adrena.client.simulateClaimStakes(
        walletAddress,
        stakedTokenMint,
      );

      setRewards(simulatedRewards);
    } catch (error) {
      console.log('error fetching rewards', error);
      setRewards(defaultRewardsData);
    }
  }, [wallet, tokenSymbol]);

  useEffect(() => {
    const walletAddress = wallet ? new PublicKey(wallet.walletAddress) : null;

    if (
      !walletAddress ||
      !window.adrena.client ||
      !window.adrena.client.connection
    ) {
      return;
    }

    fetchRewards();
    const intervalId = setInterval(() => fetchRewards(), 10000);

    return () => clearInterval(intervalId);
  }, [fetchRewards, tokenSymbol, wallet]);

  return {
    rewards,
    fetchRewards,
  };
};
