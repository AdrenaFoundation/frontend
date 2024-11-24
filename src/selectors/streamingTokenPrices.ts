import { createSelector } from '@reduxjs/toolkit';

import type { TokenPricesState } from '@/reducers/streamingTokenPricesReducer';
import type { RootState } from '@/store/store';
import type { TokenSymbol } from '@/types';

/**
 * /!\ Use with caution!
 * This state is updated extremely often, any react component or hook
 * consumer will also be rendered extremely often.
 * Prefer subscribing to specific token prices using `selectStreamingTokenPrice`.
 */
export const selectStreamingTokenPrices = (state: RootState) =>
  state.streamingTokenPrices ?? null;

/**
 * /!\ Use with caution!
 * This state is updated extremely often, any react component or hook
 * consumer will also be rendered extremely often.
 */
export const selectStreamingTokenPrice = (
  state: RootState,
  token: TokenSymbol,
) => state.streamingTokenPrices?.[token] ?? null;

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
    selectStreamingTokenPrices,
    (s: RootState, tokenSymbolsStr: string) => tokenSymbolsStr || null,
  ],
  (streamingTokenPrices, tokenSymbolsStr) => {
    return streamingTokenPrices !== null &&
      tokenSymbolsStr !== null &&
      tokenSymbolsStr !== ''
      ? tokenSymbolsStr.split(',').reduce((acc, tokenSymbol) => {
          acc[tokenSymbol] = streamingTokenPrices[tokenSymbol];
          return acc;
        }, {} as Partial<TokenPricesState>)
      : null;
  },
);
