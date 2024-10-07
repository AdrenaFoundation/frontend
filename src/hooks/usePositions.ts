import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { PRICE_DECIMALS, USD_DECIMALS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, ProfitAndLoss } from '@/types';
import { nativeToUi } from '@/utils';

// TODO: Reload periodically?
export default function usePositions(): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const loadPositions = useCallback(async () => {
    if (!wallet) {
      setPositions(null);
      return;
    }

    try {
      setPositions(
        await window.adrena.client.loadUserPositions(
          new PublicKey(wallet.walletAddress),
        ),
      );
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      throw e;
    }
  }, [wallet]);

  const loadPnlAndLiquidation = useCallback(async () => {
    if (!positions || !positions.length) return null;

    // Get liquidation price + pnl
    const [liquidationPrices, pnls] = await Promise.all([
      Promise.allSettled(
        positions.map((position) =>
          window.adrena.client.getPositionLiquidationPrice({
            position: position,
            addCollateral: new BN(0),
            removeCollateral: new BN(0),
          }),
        ),
      ),
      Promise.allSettled(
        positions.map((position) => window.adrena.client.getPnL({ position })),
      ),
    ]);

    // Insert them in positions extended
    setPositions(
      positions.map((positionExtended, index) => {
        const profitsAndLosses = (() => {
          if (pnls[index].status === 'rejected') return null;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const promisePnl = pnls[index] as any;
          const profitAndLossNative = promisePnl.value as ProfitAndLoss | null;

          if (!profitAndLossNative) return null;

          return {
            profitUsd: nativeToUi(profitAndLossNative.profitUsd, USD_DECIMALS),
            lossUsd: nativeToUi(profitAndLossNative.lossUsd, USD_DECIMALS) * -1,
            borrowFeeUsd: nativeToUi(
              profitAndLossNative.borrowFeeUsd,
              USD_DECIMALS,
            ),
          };
        })();

        // pnl from lossUsd and profitsUsd are calculated
        const pnl = (() => {
          if (!profitsAndLosses) return null;

          if (profitsAndLosses.lossUsd !== 0) return profitsAndLosses.lossUsd;

          return profitsAndLosses.profitUsd;
        })();

        const priceChangeUsd = (() => {
          if (!profitsAndLosses) return null;

          return profitsAndLosses.lossUsd !== 0
            ? profitsAndLosses.lossUsd
            : profitsAndLosses.profitUsd;
        })();

        const leverage =
          positionExtended.sizeUsd /
          (positionExtended.collateralUsd + (pnl ?? 0));

        return {
          ...positionExtended,
          leverage,
          pnl,
          priceChangeUsd,
          profitUsd: profitsAndLosses ? profitsAndLosses.profitUsd : null,
          lossUsd: profitsAndLosses ? profitsAndLosses.lossUsd : null,
          borrowFeeUsd: profitsAndLosses ? profitsAndLosses.borrowFeeUsd : null,
          liquidationPrice: ((): number | null => {
            if (liquidationPrices[index].status === 'rejected') return null;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const promiseLiquidationPrice = liquidationPrices[index] as any;
            const liquidationPrice = promiseLiquidationPrice.value as BN | null;

            if (liquidationPrice === null) return null;

            return nativeToUi(liquidationPrice, PRICE_DECIMALS);
          })(),
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positions]);

  // const loadLiquidationPrices = useCallback(async () => {}, []);

  useEffect(() => {
    loadPositions();

    const interval = setInterval(async () => {
      await loadPositions();

      // Trigger Pnl and liquidation
      loadPnlAndLiquidation();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPositions, trickReload, window.adrena.client.connection]);

  useEffect(() => {
    loadPnlAndLiquidation();

    const interval = setInterval(() => {
      loadPnlAndLiquidation();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.connection]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
