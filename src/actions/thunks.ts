import { BN } from '@coral-xyz/anchor';
import { AccountLayout, NATIVE_MINT } from '@solana/spl-token';
import type { AccountInfo, PublicKey } from '@solana/web3.js';

import { ALTERNATIVE_SWAP_TOKENS, SOL_DECIMALS } from '@/constant';
import type { TokenPricesState } from '@/reducers/streamingTokenPricesReducer';
import { selectPossibleUserPositions } from '@/selectors/positions';
import { selectStreamingTokenPricesFallback } from '@/selectors/streamingTokenPrices';
import { selectWalletPublicKey } from '@/selectors/wallet';
import type { Dispatch, RootState } from '@/store/store';
import type { PositionExtended, TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

import { setWalletTokenBalances } from './walletBalances';

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

  const liquidationPrice = window.adrena.client.calculateLiquidationPrice({
    position,
  });

  const breakEvenPrice = window.adrena.client.calculateBreakEvenPrice({
    side: position.side,
    price: position.price,
    exitFeeUsd: position.exitFeeUsd,
    interestUsd: position.unrealizedInterestUsd + position.borrowFeeUsd,
    sizeUsd: position.sizeUsd,
  });

  if (liquidationPrice !== null) {
    position.liquidationPrice = liquidationPrice;
  }

  if (breakEvenPrice !== null) {
    position.breakEvenPrice = breakEvenPrice;
  }
};

export const fetchUserPositions =
  () =>
  async (
    dispatch: Dispatch,
    getState: () => RootState,
  ): Promise<Array<PositionExtended> | null> => {
    const connection = window.adrena.client.readonlyConnection;
    const walletPublicKey = selectWalletPublicKey(getState());
    const possibleUserPositions = selectPossibleUserPositions(getState());

    if (!connection || !walletPublicKey || !possibleUserPositions) {
      return null;
    }

    try {
      const positions = await window.adrena.client.loadUserPositions(
        walletPublicKey,
        possibleUserPositions,
      );

      const tokenPrices = selectStreamingTokenPricesFallback(getState());
      for (const position of positions) {
        try {
          calculatePnLandLiquidationPrice(position, tokenPrices);
        } catch (err) {
          console.error(
            'Unexpected error calculating PnL / liquidation price',
            err,
          );
        }
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
    const connection = window.adrena.client.readonlyConnection;
    const walletPublicKey = selectWalletPublicKey(getState());
    const possibleUserPositions = selectPossibleUserPositions(getState());

    if (!connection || !walletPublicKey || !possibleUserPositions) {
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
              'Unexpected error decoding / extending user position',
              err,
            );
          }
        },
      );
      subscriptions.set(subscriptionId, possibleUserPosition);
      subscribed = true;
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
          const tokenPrices = selectStreamingTokenPricesFallback(getState());
          try {
            // PositionExtended objects are augmented in place.
            calculatePnLandLiquidationPrice(position, tokenPrices);
          } catch (err) {
            console.error(
              'Unexpected error calculating PnL / liquidation price',
              err,
            );
          }
          onPositionUpdated(position);
        },
        onPositionDeleted,
      }),
    );

    // We must return the unsubscribe function synchronously
    // so effect-based react component / hook consumer can clean-up.
    return [positionsPromise, unsubscribe] as const;
  };

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
      { mint: NATIVE_MINT, symbol: 'SOL', decimals: SOL_DECIMALS },
      ...ALTERNATIVE_SWAP_TOKENS,
    ];

    const atas = tokens.map(({ mint }) =>
      findATAAddressSync(walletPublicKey, mint),
    );

    const accounts = await connection.getMultipleAccountsInfo(atas);

    const balances = await Promise.all(
      tokens.map(async ({ mint }, i) => {
        const accountInfo = accounts[i];

        // Handle special case for SOL and WSOL
        const extra = mint.equals(NATIVE_MINT)
          ? nativeToUi(
              new BN(
                await connection.getBalance(walletPublicKey).catch(() => 0),
              ),
              SOL_DECIMALS,
            )
          : null;

        const amount = accountInfo
          ? nativeToUi(
              new BN(
                AccountLayout.decode(
                  Uint8Array.from(accountInfo.data),
                ).amount.toString(),
              ),
              tokens[i].decimals,
            )
          : null;

        if (amount !== null || extra !== null) {
          return (amount ?? 0) + (extra ?? 0);
        }

        return null;
      }),
    );

    dispatch(
      setWalletTokenBalances(
        balances.reduce(
          (acc, balance, index) => {
            acc[tokens[index].symbol] = balance;

            return acc;
          },
          {} as Record<TokenSymbol, number | null>,
        ),
      ),
    );
  };
