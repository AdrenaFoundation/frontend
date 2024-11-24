import { BN } from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import type { AccountInfo, PublicKey } from '@solana/web3.js';

import { SOL_DECIMALS } from '@/constant';
import type { TokenPricesState } from '@/reducers/streamingTokenPricesReducer';
import { selectPossibleUserPositions } from '@/selectors/positions';
import { selectStreamingTokenPrices } from '@/selectors/streamingTokenPrices';
import { selectTokenPrices } from '@/selectors/tokenPrices';
import { selectWalletPublicKey } from '@/selectors/wallet';
import type { Dispatch, RootState } from '@/store/store';
import type { PositionExtended, TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

import { setWalletTokenBalances } from './walletBalances';

export const fetchWalletTokenBalances =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
    const connection = window.adrena.mainConnection;
    const walletPublicKey = selectWalletPublicKey(getState());

    if (!walletPublicKey || !connection) {
      dispatch(setWalletTokenBalances(null));
      return;
    }

    const tokens = [
      ...window.adrena.client.tokens,
      window.adrena.client.alpToken,
      window.adrena.client.adxToken,
      { mint: NATIVE_MINT, symbol: 'SOL' },
    ];

    const balances = await Promise.all(
      tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(walletPublicKey, mint);

        // in case of SOL, consider both SOL in the wallet + WSOL in ATA
        if (mint.equals(NATIVE_MINT)) {
          try {
            const [wsolBalance, solBalance] = await Promise.all([
              // Ignore ATA error if any, consider there are 0 WSOL
              connection.getTokenAccountBalance(ata).catch(() => null),
              connection.getBalance(walletPublicKey),
            ]);

            return (
              wsolBalance?.value.uiAmount ??
              0 + nativeToUi(new BN(solBalance), SOL_DECIMALS)
            );
          } catch {
            // Error loading info
            return null;
          }
        }

        try {
          const balance = await connection.getTokenAccountBalance(ata);
          return balance.value.uiAmount;
        } catch {
          // Cannot find ATA
          return null;
        }
      }),
    );

    dispatch(
      setWalletTokenBalances(
        balances.reduce((acc, balance, index) => {
          acc[tokens[index].symbol] = balance;

          return acc;
        }, {} as Record<TokenSymbol, number | null>),
      ),
    );
  };

export const calculatePnLandLiquidationPrice = (
  position: PositionExtended,
  tokenPrices: TokenPricesState,
) => {
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

export const fetchUserPositions =
  () => async (dispatch: Dispatch, getState: () => RootState) => {
    const connection = window.adrena.client.connection;
    const walletPublicKey = selectWalletPublicKey(getState());
    const possibleUserPositions = selectPossibleUserPositions(getState());

    if (
      !connection ||
      !walletPublicKey ||
      !Array.isArray(possibleUserPositions)
    ) {
      return null;
    }

    try {
      const positions = await window.adrena.client.loadUserPositions(
        walletPublicKey,
        possibleUserPositions,
      );

      let tokenPrices = selectStreamingTokenPrices(getState());
      // Fallback if Pyth price streaming is not active, ie: profile/dashboard page.
      if (!tokenPrices) {
        tokenPrices = selectTokenPrices(getState());
      }
      for (const position of positions) {
        calculatePnLandLiquidationPrice(position, tokenPrices);
      }

      return positions;
    } catch (err) {
      console.error('Unexpected error fetching user positions', err);

      return null;
    }
  };

let subscribed = false;
export const subscribeToUserPositions =
  ({
    onPositionUpdated,
    onPositionDeleted,
  }: {
    onPositionUpdated: (position: PositionExtended) => unknown;
    onPositionDeleted: (userPosition: PublicKey) => unknown;
  }) =>
  (dispatch: Dispatch, getState: () => RootState) => {
    const connection = window.adrena.client.connection;
    const walletPublicKey = selectWalletPublicKey(getState());
    const possibleUserPositions = selectPossibleUserPositions(getState());

    if (
      !connection ||
      !walletPublicKey ||
      !Array.isArray(possibleUserPositions)
    ) {
      return;
    }

    // Ensuring we only subscribe once to user position changes.
    if (subscribed) {
      return;
    }

    const subscriptions = new Map<number, PublicKey>();
    const removeSubscription = (subscriptionId: number) => {
      connection.removeAccountChangeListener(subscriptionId);
      subscriptions.delete(subscriptionId);
    };
    const unsubscribe = () => {
      subscribed = false;
      for (const [subscriptionId] of subscriptions) {
        removeSubscription(subscriptionId);
      }
    };

    for (const possibleUserPosition of possibleUserPositions) {
      const subscriptionId = connection.onAccountChange(
        possibleUserPosition,
        (accountInfo: AccountInfo<Buffer>) => {
          const userPosition = possibleUserPosition;

          // Position got deleted
          if (!accountInfo.data.length) {
            removeSubscription(subscriptionId);
            onPositionDeleted(userPosition);
            return;
          }

          try {
            const positionData = window.adrena.client
              .getReadonlyAdrenaProgram()
              .coder.accounts.decode('position', accountInfo.data);
            const extendedPosition = window.adrena.client.extendPosition(
              positionData,
              userPosition,
            );

            if (!extendedPosition) {
              throw new Error('Unexpected null extended user position');
            }

            onPositionUpdated(extendedPosition);
          } catch (err) {
            console.error(
              'Unexpected error decoding / extending user position, removing subscription',
              err,
            );
            removeSubscription(subscriptionId);
          }
        },
      );
      subscriptions.set(subscriptionId, possibleUserPosition);
    }

    return unsubscribe;
  };

export const fetchAndSubscribeToFullUserPositions =
  (
    onPositionUpdated: (position: PositionExtended) => unknown,
    onPositionDeleted: (userPosition: PublicKey) => unknown,
  ) =>
  (dispatch: Dispatch, getState: () => RootState) => {
    // Fetch the initial user positions
    // keep the promise to be returned synchronously, do not await it.
    const positionsPromise = dispatch(fetchUserPositions());

    const unsubscribe = dispatch(
      subscribeToUserPositions({
        onPositionUpdated: function augmentPositionWithPnL(position) {
          let tokenPrices = selectStreamingTokenPrices(getState());
          // Fallback if Pyth price streaming is not active, ie: profile/dashboard page.
          if (!tokenPrices) {
            tokenPrices = selectTokenPrices(getState());
          }
          // PositionExtended objects are augmented in place.
          calculatePnLandLiquidationPrice(position, tokenPrices);
          onPositionUpdated(position);
        },
        onPositionDeleted,
      }),
    );

    // We must return the unsubscribe function synchronously
    // so effect-based react component / hook consumer can clean-up.
    return [positionsPromise, unsubscribe] as const;
  };
