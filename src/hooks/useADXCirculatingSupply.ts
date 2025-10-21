import { useCallback, useEffect, useMemo, useState } from 'react';

let interval: NodeJS.Timeout | null = null;

const CIRCULATING_SUPPLY_LOADING_INTERVAL_IN_MS = 30_000;

export default function useADXCirculatingSupply({
  totalSupplyADX,
}: {
  totalSupplyADX: number | null;
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
  }, [loadTokenTreasuryBalance]);

  const circulatingSupply = useMemo(() => {
    if (
      !window.adrena.client.readonlyConnection ||
      totalSupplyADX === null ||
      lmTokenTreasuryBalance === null
    ) {
      return null;
    }

    return totalSupplyADX - lmTokenTreasuryBalance;
  }, [lmTokenTreasuryBalance, totalSupplyADX]);

  return circulatingSupply;
}
