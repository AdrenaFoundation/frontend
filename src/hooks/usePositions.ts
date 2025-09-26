import { useCallback, useEffect, useState } from 'react';

import {
  calculatePnLandLiquidationPrice,
  fetchAndSubscribeToFullUserPositions,
} from '@/actions/thunks';
import type { TokenPricesState } from '@/reducers/streamingTokenPricesReducer';
import { selectStreamingTokenPricesForTokensStr } from '@/selectors/streamingTokenPrices';
import { type RootState, useDispatch, useSelector } from '@/store/store';
import type { PositionExtended } from '@/types';
import { getTokenSymbol } from '@/utils';

export default function usePositions(walletAddress: string | null) {
  const dispatch = useDispatch();
  const [positions, setPositions] = useState<Array<PositionExtended> | null>(
    null,
  );

  // Extract the tokens relevant to the user's positions
  // so we can subscribe to the price updates of just those.
  // Output a string like "BTC,USDC" to obtain a stable value of primitive type
  // easier to memoize.
  const positionsTokenSymbolsStr =
    positions && positions.length > 0
      ? Array.from(
          new Set(
            positions.flatMap((position) => [
              getTokenSymbol(position.token.symbol),
              position.collateralToken.symbol,
            ]),
          ),
        )
          .sort()
          .join(',')
      : null;

  const positionsTokenPricesSelector = useCallback(
    (s: RootState) =>
      positionsTokenSymbolsStr &&
      selectStreamingTokenPricesForTokensStr(s, positionsTokenSymbolsStr),
    [positionsTokenSymbolsStr],
  );

  // Subscribe to the price updates of only the tokens relevant to the user's positions.
  const positionsTokenPrices = useSelector(positionsTokenPricesSelector);

  useEffect(() => {
    // Clear positions immediately when wallet disconnects
    if (!walletAddress) {
      console.log('🔌 Clearing positions due to wallet disconnect');
      setPositions(null);
      return;
    }

    const [positionsPromise, unsubscribe] = dispatch(
      fetchAndSubscribeToFullUserPositions(
        function onPositionUpdated(position) {
          setPositions((prevPositions) => {
            // A position was updated though we haven't yet fetched / stored
            // any position in the state, it should not happen, let's just ignore.
            if (prevPositions === null) return null;

            // Update the positions state, with the updated position
            // **at the same index** as previously.

            const newPositions = [...prevPositions];
            const positionIdx = prevPositions.findIndex((prevPosition) =>
              prevPosition.pubkey.equals(position.pubkey),
            );

            if (positionIdx > -1) {
              newPositions[positionIdx] = position;
            } else {
              // New positions go first
              newPositions.unshift(position);
            }

            return newPositions;
          });
        },
        function onPositionDeleted(userPosition) {
          setPositions((prevPositions) => {
            // A position was deleted though we haven't yet fetched / stored
            // any position in the state, it should not happen, let's just ignore.
            if (prevPositions === null) return null;

            // Update the positions state, filter-out the deleted position.
            return prevPositions.filter(
              (prevPosition) => !prevPosition.pubkey.equals(userPosition),
            );
          });
        },
      ),
    );

    positionsPromise.then(setPositions);

    // The unsubscribe function is possibly undefined:
    // if no subscriptions were made.
    return () => unsubscribe?.();

    // We must only run this effect once for a given component tree.
    // To reflect that, we could turn this hook into a Context Provider.
    // But the optimal solution would be to store the positions in the Redux state.
  }, [dispatch, walletAddress]);

  useEffect(() => {
    if (!positionsTokenPrices) return;

    setPositions((prevPositions) => {
      // One of the tokens' price of a position was updated though
      // we haven't yet stored any position, it should not happen, let's just ignore.
      if (prevPositions === null) return null;

      // Update each positions' PnL & liquidation price based on new prices.
      return prevPositions.map((position) => {
        // PositionExtended objects are augmented in place.
        calculatePnLandLiquidationPrice(
          position,
          positionsTokenPrices as TokenPricesState,
        );

        // Trick immutability principles & update the state with a shallow-copy
        // of the position to make the update visible to the outside.
        return { ...position };
      });
    });
  }, [positionsTokenPrices]);

  return positions;
}
