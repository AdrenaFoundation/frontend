import { TokenPricesAction } from "../actions/tokenPricesActions";

export type TokenPricesState = Record<string, number | null>;

const initialState: TokenPricesState = {};

export default function tokenPricesReducer(
  state = initialState,
  action: TokenPricesAction
) {
  switch (action.type) {
    case "setTokenPrice":
      return {
        ...state,
        [action.payload.mint]: action.payload.price,
      };
    default:
      return state;
  }
}
