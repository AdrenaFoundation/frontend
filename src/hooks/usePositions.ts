import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { TokenPricesState } from '@/reducers/tokenPricesReducer';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

const calculatePnLandLiquidationPrice = (
  position: PositionExtended,
  tokenPrices: TokenPricesState,
) => {
  // Calculate PnL
  const pnl = window.adrena.client.calculatePositionPnL({
    position,
    tokenPrices,
  });

  if (pnl === null) return null;

  const { profitUsd, lossUsd, borrowFeeUsd } = pnl;

  position.profitUsd = profitUsd;
  position.lossUsd = lossUsd;
  position.borrowFeeUsd = borrowFeeUsd;
  position.pnl = profitUsd + -lossUsd;
  position.pnlMinusFees = position.pnl + borrowFeeUsd + position.exitFeeUsd;
  position.currentLeverage =
    position.sizeUsd / (position.collateralUsd + position.pnl);

  // Calculate liquidation price
  const liquidationPrice = window.adrena.client.calculateLiquidationPrice({
    position,
  });

  if (liquidationPrice !== null) {
    position.liquidationPrice = liquidationPrice;
  }
};

let lastDealtTrickReload = 0;
let lastCall = 0;

export default function usePositions(): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
  addOptimisticPosition: (position: PositionExtended) => void;
  removeOptimisticPosition: (positionSide: 'long' | 'short', positionCustody: PublicKey) => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);
  const [optimisticPositions, setOptimisticPositions] = useState<PositionExtended[]>([]);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  const loadPositions = useCallback(async () => {
    if (!wallet || !tokenPrices) {
      setPositions(null);
      return;
    }

    const loadPosition =
      lastDealtTrickReload !== trickReload || lastCall < Date.now() - 10000;

    if (loadPosition) lastCall = Date.now();

    lastDealtTrickReload = trickReload;

    if (loadPosition) {
      try {
        const freshPositions =
          (loadPosition
            ? await window.adrena.client.loadUserPositions(
              new PublicKey(wallet.walletAddress),
            )
            : positions) ?? [];

        freshPositions.forEach((position) => {
          calculatePnLandLiquidationPrice(position, tokenPrices);
        });

        // Filter out optimistic positions that now exist in freshPositions
        setOptimisticPositions((prev) =>
          prev.filter((optimisticPosition) =>
            freshPositions.some((freshPosition) =>
              freshPosition.side === optimisticPosition.side &&
              freshPosition.custody.equals(optimisticPosition.custody)
            )
          )
        );

        setPositions([...freshPositions]);

      } catch (e) {
        console.log('Error loading positions', e, String(e));

        // Do nothing
      }

      return;
    }

    if (positions === null) {
      return;
    }

    // Recalculate Pnl and liquidation price
    positions.forEach((position) => {
      calculatePnLandLiquidationPrice(position, tokenPrices);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, tokenPrices]);


  const addOptimisticPosition = (position: PositionExtended) => {
    setOptimisticPositions((prev) => {
      const isDuplicate = prev.some(
        (p) => p.side === position.side && p.custody.equals(position.custody)
      );
      if (isDuplicate) {
        return prev;
      }
      calculatePnLandLiquidationPrice(position, tokenPrices);
      return [...prev, position];
    });;
  };

  const removeOptimisticPosition = (positionSide: 'long' | 'short', positionCustody: PublicKey) => {
    setPositions((prev = []) => prev ? prev.filter(p => !(p.side === positionSide && p.custody.equals(positionCustody))) : null);
  };

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

  return {
    positions: positions ? [...optimisticPositions, ...positions] : null,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
    addOptimisticPosition,
    removeOptimisticPosition,
  };
}
