import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { calculatePnLandLiquidationPrice } from '@/actions/thunks';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

export default function usePositionsByAddress({
  walletAddress,
}: {
  walletAddress: string | null;
}): PositionExtended[] | null {
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  const initialSetup = useCallback(async () => {
    if (!walletAddress) return;

    // Load positions
    try {
      const freshPositions = await window.adrena.client.loadUserPositions(
        new PublicKey(walletAddress),
      );

      setPositions(freshPositions);
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.readonlyConnection, walletAddress]);

  useEffect(() => {
    initialSetup();
  }, [initialSetup]);

  useEffect(() => {
    if (!positions || !tokenPrices) return;

    positions.forEach((position) => {
      calculatePnLandLiquidationPrice(position, tokenPrices);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenPrices, positions]);

  return positions;
}
