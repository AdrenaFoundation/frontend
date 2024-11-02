import type { TokenSymbol } from '@/types';

import {
  SET_STREAMING_TOKEN_PRICE_ACTION_TYPE,
  setStreamingTokenPrice,
} from '../actions/streamingTokenPrices';

export type TokenPricesState = Record<TokenSymbol, number | null>;

const initialState: TokenPricesState = {};

export default function streamingTokenPricesReducer(
  state = initialState,
  action: ReturnType<typeof setStreamingTokenPrice>,
) {
  switch (action.type) {
    case SET_STREAMING_TOKEN_PRICE_ACTION_TYPE: {
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
    default:
      return state;
  }
}
