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
      const simulatedRewards = await window.adrena.client.simulateClaimStakes({
        owner: walletAddress,
        stakedTokenMint,
        // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
        // Special override for a user that has a different reward token account following a hack
        overrideRewardTokenAccount: walletAddress.toBase58() === '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs' ?
          new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9') : undefined
      });

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
  }, [
    fetchRewards,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena.client.connection,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena.client,
    wallet,
  ]);

  return {
    rewards,
    fetchRewards,
  };
};
