import { AdrenaClient } from '@/AdrenaClient';
import { TokenName } from '@/types';

import { TokenPricesAction } from '../actions/tokenPricesActions';

export type TokenPricesState = Record<TokenName, number | null>;

const initialState: TokenPricesState = {
  [AdrenaClient.alpToken.name]: 1,
};

export default function tokenPricesReducer(
  state = initialState,
  action: TokenPricesAction,
) {
  switch (action.type) {
    case 'setTokenPrice':
      return {
        ...state,
        [action.payload.tokenName]: action.payload.price,
      };
    default:
      return state;
  }
}
