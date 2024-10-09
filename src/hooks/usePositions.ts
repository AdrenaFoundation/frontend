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
      const oldPositions = positions;

      const newPositions = await window.adrena.client.loadUserPositions(
        new PublicKey(wallet.walletAddress),
      );

      // Provide oldPositions to avoid issues with tokenPrices not being updated due to React
      calculatePnLandLiquidationPrice(newPositions, oldPositions);

      setPositions(newPositions);
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      throw e;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet]);

  const calculatePnLandLiquidationPrice = useCallback(
    (
      positions: PositionExtended[] | null,
      oldPositions: PositionExtended[] | null,
    ) => {
      if (!positions || !positions.length) {
        return;
      }

      positions.forEach((position) => {
        // Calculate PnL
        let pnl = window.adrena.client.calculatePositionPnL({
          position,
          tokenPrices,
        });

        if (pnl === null) {
          const oldPosition = oldPositions?.find(
            (x) => x.pubkey.toBase58() === position.pubkey.toBase58(),
          );

          if (
            !oldPosition ||
            typeof oldPosition.profitUsd !== 'number' ||
            typeof oldPosition.lossUsd !== 'number' ||
            typeof oldPosition.borrowFeeUsd !== 'number'
          )
            return;

          pnl = {
            profitUsd: oldPosition.profitUsd,
            lossUsd: oldPosition.lossUsd,
            borrowFeeUsd: oldPosition.borrowFeeUsd,
          };
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

        if (liquidationPrice === null) {
          const oldPosition = oldPositions?.find(
            (x) => x.pubkey.toBase58() === position.pubkey.toBase58(),
          );

          if (!oldPosition || typeof oldPosition.liquidationPrice !== 'number')
            return;

          position.liquidationPrice = oldPosition.liquidationPrice;
        }

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
    calculatePnLandLiquidationPrice(positions, positions);
  }, [calculatePnLandLiquidationPrice, positions]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
