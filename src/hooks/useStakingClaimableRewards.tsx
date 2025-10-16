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
    // Early return if no wallet or connection
    if (!wallet || !window.adrena?.client?.connection) {
      return;
    }

    // Additional check: ensure the connection is actually available
    const walletAddress = new PublicKey(wallet.walletAddress);

    if (!walletAddress) {
      return;
    }

    try {
      const stakedTokenMint =
        tokenSymbol === 'ALP'
          ? window.adrena.client.lpTokenMint
          : window.adrena.client.lmTokenMint;

      // First check if user has a staking account for this token
      const userStakingAccount =
        await window.adrena.client.getUserStakingAccount({
          owner: walletAddress,
          stakedTokenMint,
        });

      if (!userStakingAccount) {
        // User doesn't have a staking account for this token, skip simulation
        setRewards(defaultRewardsData);
        return;
      }

      const simulatedRewards = await window.adrena.client.simulateClaimStakes({
        owner: walletAddress,
        stakedTokenMint,
        // TODO: replace this with a proper system allowing the user to claim on a TA instead of the ATA, but pretty niche usecase tbh
        // Special override for a user that has a different reward token account following a hack
        overrideRewardTokenAccount:
          walletAddress.toBase58() ===
          '5aBuBWGxkyHMDE6kqLLA1sKJjd2emdoKJWm8hhMTSKEs'
            ? new PublicKey('654FfF8WWJ7BTLdWtpAo4F3AiY2pRAPU8LEfLdMFwNK9')
            : undefined,
      });

      setRewards(simulatedRewards);
    } catch (error) {
      console.log('error fetching rewards', error);
      setRewards(defaultRewardsData);
    }
  }, [wallet, tokenSymbol]);

  useEffect(() => {
    // Early return if no wallet or connection
    if (!wallet || !window.adrena?.client?.connection) {
      return;
    }

    // Additional check: ensure the connection is actually available
    if (!window.adrena.client.connection.getLatestBlockhash) {
      console.warn('Connection not properly initialized for rewards useEffect');
      return;
    }

    const walletAddress = new PublicKey(wallet.walletAddress);

    if (!walletAddress) {
      return;
    }

    fetchRewards();
    const intervalId = setInterval(() => fetchRewards(), 10000);

    return () => clearInterval(intervalId);
  }, [
    fetchRewards,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena?.client?.connection,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena?.client,
    wallet,
  ]);

  return {
    rewards,
    fetchRewards,
  };
};
