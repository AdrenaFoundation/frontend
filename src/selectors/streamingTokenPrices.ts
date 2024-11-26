import { createSelector } from '@reduxjs/toolkit';

import {
  initialState as streamingTokenPricesInitialState,
  type TokenPricesState,
} from '@/reducers/streamingTokenPricesReducer';
import type { RootState } from '@/store/store';
import type { TokenSymbol } from '@/types';

import { selectTokenPrices } from './tokenPrices';

/**
 * /!\ Use with caution!
 * This state is updated extremely often, any react component or hook
 * consumer will also be rendered extremely often.
 * Prefer subscribing to specific token prices using `selectStreamingTokenPrice`.
 */
export const selectStreamingTokenPrices = (state: RootState) =>
  state.streamingTokenPrices;

/**
 * Select streaming token prices, with a fallback on "regular" token prices.
 * To be used when we ideally want to rely on the streaming prices,
 * but streaming is not active.
 */
export const selectStreamingTokenPricesFallback = createSelector(
  [selectStreamingTokenPrices, selectTokenPrices],
  (streamingTokenPrices, tokenPrices) =>
    streamingTokenPrices === streamingTokenPricesInitialState
      ? tokenPrices
      : streamingTokenPrices,
);

/**
 * /!\ Use with caution!
 * This state is updated extremely often, any react component or hook
 * consumer will also be rendered extremely often.
 */
export const selectStreamingTokenPriceFallback = (
  state: RootState,
  token: TokenSymbol,
) => selectStreamingTokenPricesFallback(state)?.[token] ?? null;

/**
 * /!\ Use with caution!
 * This state is updated extremely often, any react component or hook
 * consumer will also be rendered extremely often.
 * Prefer subscribing to specific token prices using `selectStreamingTokenPrice`.
 * @param state
 * @param positionsTokenSymbolsStr a comma separated string list of token symbols to retrive prices for (ie: 'SOL,USDC')
 * @returns Partial<TokenPricesState> | null
 */
export const selectStreamingTokenPricesForTokensStr = createSelector(
  [
    selectStreamingTokenPricesFallback,
    (s: RootState, tokenSymbolsStr: string) => tokenSymbolsStr || null,
  ],
  (streamingTokenPrices, tokenSymbolsStr) => {
    return streamingTokenPrices &&
      tokenSymbolsStr !== null &&
      tokenSymbolsStr !== ''
      ? tokenSymbolsStr.split(',').reduce((acc, tokenSymbol) => {
          acc[tokenSymbol] = streamingTokenPrices[tokenSymbol];
          return acc;
        }, {} as Partial<TokenPricesState>)
      : null;
  },
);
