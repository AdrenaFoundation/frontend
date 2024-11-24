import type { AnyAction } from '@reduxjs/toolkit';

import type { TokenSymbol } from '@/types';

import {
  SET_STREAMING_TOKEN_PRICE_ACTION_TYPE,
  setStreamingTokenPrice,
  STOP_STREAMING_TOKEN_PRICES_ACTION_TYPE,
  stopStreamingTokenPrices,
} from '../actions/streamingTokenPrices';

export type TokenPricesState = Record<TokenSymbol, number | null>;

export const initialState: TokenPricesState = Object.freeze({});

const actionTypeGuard = <A extends AnyAction>(
  x: AnyAction,
  type:
    | typeof SET_STREAMING_TOKEN_PRICE_ACTION_TYPE
    | typeof STOP_STREAMING_TOKEN_PRICES_ACTION_TYPE,
): x is A => type in x;

export default function streamingTokenPricesReducer(
  state = initialState,
  action: AnyAction,
) {
  switch (true) {
    case actionTypeGuard<ReturnType<typeof setStreamingTokenPrice>>(
      action,
      SET_STREAMING_TOKEN_PRICE_ACTION_TYPE,
    ): {
      // Return previous state, do not unnecessarily update state
      // if the new price is the same as the previous price.
      // An upgrade of @reduxjs/tooking would help removing this boilerplate.
      if (state[action.payload.tokenSymbol] === action.payload.price) {
        return state;
      }

      return {
        ...state,
        [action.payload.tokenSymbol]: action.payload.price,
      };
    }

    case actionTypeGuard<ReturnType<typeof stopStreamingTokenPrices>>(
      action,
      STOP_STREAMING_TOKEN_PRICES_ACTION_TYPE,
    ): {
      return initialState;
    }

    default:
      return state;
  }
}
