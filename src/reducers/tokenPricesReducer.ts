import type { TokenSymbol } from '@/types';

import {
  SET_TOKEN_PRICE_ACTION_TYPE,
  setTokenPrice,
} from '../actions/tokenPrices';

export type TokenPricesState = Record<TokenSymbol, number | null>;

const initialState: TokenPricesState = {};

export default function tokenPricesReducer(
  state = initialState,
  action: ReturnType<typeof setTokenPrice>,
) {
  switch (action.type) {
    case SET_TOKEN_PRICE_ACTION_TYPE: {
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
