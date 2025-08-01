import { BN } from '@coral-xyz/anchor';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { nativeToUi } from '@/utils';

let interval: NodeJS.Timeout | null = null;

const CIRCULATING_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

export default function useADXCirculatingSupply({
  totalSupplyADX,
  adxStakingAccountLockedTokens,
}: {
  totalSupplyADX: number | null;
  adxStakingAccountLockedTokens: BN | null;
}) {
  const [lmTokenTreasuryBalance, setLmTokenTreasuryBalance] = useState<
    number | null
  >(null);

  const loadTokenTreasuryBalance = useCallback(async () => {
    const connection = window.adrena.client.readonlyConnection;

    if (!connection) return;

    if (!window.adrena.client.readonlyConnection)
      return setLmTokenTreasuryBalance(null);

    const lmTokenTreasuryBalance =
      await window.adrena.client.readonlyConnection.getTokenAccountBalance(
        window.adrena.client.lmTokenTreasury,
      );

    setLmTokenTreasuryBalance(lmTokenTreasuryBalance.value.uiAmount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.readonlyConnection]);

  useEffect(() => {
    loadTokenTreasuryBalance();

    interval = setInterval(() => {
      loadTokenTreasuryBalance();
    }, CIRCULATING_SUPPLY_LOADING_INTERVAL_IN_MS);

    return () => {
      if (!interval) {
        return;
      }

      clearInterval(interval);
      interval = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTokenTreasuryBalance]);

  const circulatingSupply = useMemo(() => {
    if (
      !window.adrena.client.readonlyConnection ||
      totalSupplyADX === null ||
      adxStakingAccountLockedTokens === null ||
      lmTokenTreasuryBalance === null
    ) {
      return null;
    }

    return (
      totalSupplyADX -
      lmTokenTreasuryBalance -
      nativeToUi(
        adxStakingAccountLockedTokens,
        window.adrena.client.adxToken.decimals,
      )
    );
  }, [adxStakingAccountLockedTokens, lmTokenTreasuryBalance, totalSupplyADX]);

  return circulatingSupply;
}
