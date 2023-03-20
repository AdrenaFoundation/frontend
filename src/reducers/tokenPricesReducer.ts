import { Token } from "@/types";
import { TokenPricesAction } from "../actions/tokenPricesActions";

export type TokenPricesState = Record<Token, number | null>;

const initialState: TokenPricesState = {
  ETH: null,
  BTC: null,
  SOL: null,
  USDC: null,
};

export default function tokenPricesReducer(
  state = initialState,
  action: TokenPricesAction
) {
  switch (action.type) {
    case "setTokenPrice":
      return {
        ...state,
        [action.payload.token]: action.payload.price,
      };
    default:
      return state;
  }
}
