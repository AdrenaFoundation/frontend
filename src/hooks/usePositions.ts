import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

export default function usePositions(): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  const loadPositions = useCallback(async () => {
    if (!wallet) {
      setPositions(null);
      return;
    }

    try {
      const positions = await window.adrena.client.loadUserPositions(
        new PublicKey(wallet.walletAddress),
      );

      calculatePnLandLiquidationPrice(positions);

      setPositions(positions);
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const calculatePnLandLiquidationPrice = useCallback(
    (positions: PositionExtended[] | null) => {
      if (!positions || !positions.length) {
        return null;
      }

      positions.forEach((position) => {
        // Calculate PnL
        const pnl = window.adrena.client.calculatePositionPnL({
          position,
          tokenPrices,
        });

        if (pnl === null) {
          return;
        }

        const { profitUsd, lossUsd, borrowFeeUsd } = pnl;

        position.profitUsd = profitUsd;
        position.lossUsd = lossUsd;
        position.borrowFeeUsd = borrowFeeUsd;
        position.pnl = profitUsd + -lossUsd;
        position.priceChangeUsd = lossUsd !== 0 ? lossUsd : profitUsd;

        // Calculate liquidation price
        const liquidationPrice = window.adrena.client.calculateLiquidationPrice(
          {
            position,
          },
        );

        if (liquidationPrice !== null) {
          position.liquidationPrice = liquidationPrice;
        }
      });
    },
    [tokenPrices],
  );

  useEffect(() => {
    loadPositions();

    const interval = setInterval(async () => {
      await loadPositions();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPositions, trickReload, window.adrena.client.connection]);

  useEffect(() => {
    calculatePnLandLiquidationPrice(positions);
  }, [calculatePnLandLiquidationPrice]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
