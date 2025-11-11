import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

export default function useStakingAccountRewardsAccumulated(
  stakedTokenMint: PublicKey,
): { usdcRewards: number | null; adxRewards: number | null } {
  const [usdcAmount, setUsdcAmount] = useState<number | null>(null);
  const [adxAmount, setAdxAmount] = useState<number | null>(null);

  const usdcRewardsVaultPda =
    window.adrena.client.getStakingRewardTokenVaultPda(
      window.adrena.client.getStakingPda(stakedTokenMint),
    );
  const adxRewardsVaultPda =
    window.adrena.client.getStakingLmRewardTokenVaultPda(
      window.adrena.client.getStakingPda(stakedTokenMint),
    );

  const fetchRewards = useCallback(async () => {
    const [usdcBalance, adxBalance] = await Promise.all([
      window.adrena.client.readonlyConnection?.getTokenAccountBalance(
        usdcRewardsVaultPda,
      ),
      window.adrena.client.readonlyConnection?.getTokenAccountBalance(
        adxRewardsVaultPda,
      ),
    ]);

    setUsdcAmount(usdcBalance?.value.uiAmount ?? null);
    setAdxAmount(adxBalance?.value.uiAmount ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps
    !!window.adrena.client.readonlyConnection,
  ]);

  useEffect(() => {
    fetchRewards();

    const interval = setInterval(fetchRewards, 30000);

    return () => clearInterval(interval);
  }, [fetchRewards]);

  return { usdcRewards: usdcAmount, adxRewards: adxAmount };
}
