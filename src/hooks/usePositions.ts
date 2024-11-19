import { AccountInfo, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { TokenPricesState } from '@/reducers/tokenPricesReducer';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

export const calculatePnLandLiquidationPrice = (
  position: PositionExtended,
  tokenPrices: TokenPricesState,
) => {
  // Calculate PnL
  const pnl = window.adrena.client.calculatePositionPnL({
    position,
    tokenPrices,
  });

  if (pnl === null) {
    return null;
  }

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

export default function usePositions(): PositionExtended[] | null {
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);
  const tokenPrices = useSelector((s) => s.tokenPrices);

  // Do initial load of positions then start streaming
  const initialSetup = useCallback(async () => {
    const connection = window.adrena.client.connection;

    if (!wallet || !connection) return;

    // Load positions
    try {
      const freshPositions = await window.adrena.client.loadUserPositions(
        new PublicKey(wallet.walletAddress),
      );

      console.log('Loaded positions', freshPositions);

      setPositions(freshPositions);
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      return;
    }

    // Subscribe to all possible position addresses for the user
    window.adrena.client
      .getPossiblePositionAddresses(new PublicKey(wallet.walletAddress))
      .map((address) =>
        connection.onAccountChange(
          address,
          (accountInfo: AccountInfo<Buffer>) => {
            console.log(
              'Position account changed',
              address.toBase58(),
              accountInfo,
            );

            // Position got deleted
            if (accountInfo.data.length === 0) {
              setPositions(
                (prevPositions) =>
                  prevPositions?.filter(
                    (p) => p.pubkey.toBase58() !== address.toBase58(),
                  ) ?? [],
              );
              return;
            }

            const position = window.adrena.client.extendPosition(
              window.adrena.client
                .getReadonlyAdrenaProgram()
                .coder.accounts.decode('position', accountInfo.data),
              address,
            );

            // Error loading position
            if (!position) {
              console.error('Error loading position', address.toBase58());
              return;
            }

            calculatePnLandLiquidationPrice(position, tokenPrices);

            setPositions((prevPositions) => [
              ...(prevPositions?.filter(
                (p) => p.pubkey.toBase58() !== address.toBase58(),
              ) ?? []),
              position,
            ]);
          },
        ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, !!window.adrena.client.connection]);

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
