import { TokenSymbol } from '@/types';

import { StreamingTokenPricesAction } from '../actions/streamingTokenPricesActions';

export type TokenPricesState = Record<TokenSymbol, number | null>;

const initialState: TokenPricesState = {};

export default function streamingTokenPricesReducer(
  state = initialState,
  action: StreamingTokenPricesAction,
) {
  switch (action.type) {
    case 'setStreamingTokenPrice': {
      // Return previous state, do not unnecessarily update state
      // if the new price is the same as the previous price.
      // An upgrade of the Redux toolchain would help removing this boilerplate.
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
