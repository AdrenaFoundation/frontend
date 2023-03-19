import { Token } from "@/types";
import { TokenPricesAction } from "../actions/tokenPricesAction";

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
      return action.payload;
    default:
      return state;
  }
}
