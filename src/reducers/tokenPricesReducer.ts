import { TokenSymbol } from '@/types';

import { TokenPricesAction } from '../actions/tokenPricesActions';

export type TokenPricesState = Record<TokenSymbol, number | null>;

const initialState: TokenPricesState = {};

export default function tokenPricesReducer(
  state = initialState,
  action: TokenPricesAction,
) {
  switch (action.type) {
    case 'setTokenPrice':
      return {
        ...state,
        [action.payload.tokenSymbol]: action.payload.price,
      };
    default:
      return state;
  }
}
