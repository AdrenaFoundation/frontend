import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import { useSelector } from '@/store/store';

interface RewardsData {
  pendingUsdcRewards: number;
  pendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
}

export const useStakingClaimableRewards = (isALP: boolean) => {
  const [rewards, setRewards] = useState<RewardsData>({
    pendingUsdcRewards: 0,
    pendingAdxRewards: 0,
    pendingGenesisAdxRewards: 0,
  });
  const wallet = useSelector((s) => s.walletState.wallet);

  useEffect(() => {
    const walletAddress = wallet ? new PublicKey(wallet.walletAddress) : null;

    if (
      !walletAddress ||
      !window.adrena.client ||
      !window.adrena.client.connection
    ) {
      return;
    }

    const fetchRewards = async () => {
      try {
        const stakedTokenMint = isALP
          ? window.adrena.client.lpTokenMint
          : window.adrena.client.lmTokenMint;
        const simulatedRewards = await window.adrena.client.simulateClaimStakes(
          walletAddress,
          stakedTokenMint,
        );

        setRewards(simulatedRewards);
      } catch (error) {
        console.log('error fetching rewards', error);
        setRewards({
          pendingUsdcRewards: 0,
          pendingAdxRewards: 0,
          pendingGenesisAdxRewards: 0,
        });
      }
    };

    fetchRewards();
    const intervalId = setInterval(fetchRewards, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena.client.connection,
    isALP,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena.client,
    wallet,
  ]);

  return rewards;
};
