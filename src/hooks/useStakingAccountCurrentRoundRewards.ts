import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';

const useStakingAccountCurrentRoundRewards = (
  stakedTokenMint: PublicKey,
): number | null => {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [usdcAmount, setUsdcAmount] = useState<number | null>(null);
  const [usDollarAmount, setUsDollarAmount] = useState<number | null>(null);

  const usdc = window.adrena.client.getUsdcToken();

  const pda = window.adrena.client.getStakingRewardTokenVaultPda(
    window.adrena.client.getStakingPda(stakedTokenMint),
  );

  const fetchRewards = useCallback(async () => {
    const amount =
      await window.adrena.client.readonlyConnection?.getTokenAccountBalance(
        pda,
      );

    setUsdcAmount(amount?.value.uiAmount ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pda.toBase58(), !!window.adrena.client.readonlyConnection]);

  useEffect(() => {
    fetchRewards();
    const interval = setInterval(() => {
      fetchRewards();
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [fetchRewards]);

  useEffect(() => {
    const usdcPrice = tokenPrices[usdc.symbol];

    if (!usdcPrice || usdcAmount === null) {
      setUsDollarAmount(null);
      return;
    }

    setUsDollarAmount(usdcAmount * usdcPrice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenPrices[usdc.symbol], usdcAmount]);

  return usDollarAmount;
};

export default useStakingAccountCurrentRoundRewards;
