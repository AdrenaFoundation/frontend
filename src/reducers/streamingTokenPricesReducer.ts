import { TokenSymbol } from '@/types';

import { StreamingTokenPricesAction } from '../actions/streamingTokenPricesActions';

export type TokenPricesState = Record<TokenSymbol, number | null>;

const initialState: TokenPricesState = {};

export default function streamingTokenPricesReducer(
  state = initialState,
  action: StreamingTokenPricesAction,
) {
  switch (action.type) {
    case 'setStreamingTokenPrice':
      return {
        ...state,
        [action.payload.tokenSymbol]: action.payload.price,
      };
    default:
      return state;
  }
}
