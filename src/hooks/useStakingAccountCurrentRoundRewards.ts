import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useSelector } from '@/store/store';

export default function useStakingAccountCurrentRoundRewards(
  stakedTokenMint: PublicKey,
): { usdcRewards: number | null; adxRewards: number | null } {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const [usdcAmount, setUsdcAmount] = useState<number | null>(null);
  const [adxAmount, setAdxAmount] = useState<number | null>(null);

  const usdc = window.adrena.client.getUsdcToken();
  const adx = window.adrena.client.adxToken;

  const usdcPda = window.adrena.client.getStakingRewardTokenVaultPda(
    window.adrena.client.getStakingPda(stakedTokenMint),
  );
  const adxPda = window.adrena.client.getStakingLmRewardTokenVaultPda(
    window.adrena.client.getStakingPda(stakedTokenMint),
  );

  const fetchRewards = useCallback(async () => {
    const [usdcBalance, adxBalance] = await Promise.all([
      window.adrena.client.readonlyConnection?.getTokenAccountBalance(usdcPda),
      window.adrena.client.readonlyConnection?.getTokenAccountBalance(adxPda),
    ]);

    setUsdcAmount(usdcBalance?.value.uiAmount ?? null);
    setAdxAmount(adxBalance?.value.uiAmount ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdcPda.toBase58(), adxPda.toBase58(), !!window.adrena.client.readonlyConnection]);

  useEffect(() => {
    fetchRewards();
    const interval = setInterval(fetchRewards, 30000);
    return () => clearInterval(interval);
  }, [fetchRewards]);

  const usdcRewards = useMemo(() =>
    usdcAmount !== null && tokenPrices[usdc.symbol]
      ? usdcAmount * (tokenPrices[usdc.symbol] ?? 0)
      : null,
    [usdcAmount, tokenPrices, usdc.symbol]);

  const adxRewards = useMemo(() =>
    adxAmount !== null
      ? adxAmount
      : null,
    [adxAmount]);

  return { usdcRewards, adxRewards };
}
