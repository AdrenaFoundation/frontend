import { WalletAdapterName } from "@/adapters/walletAdapters";
import { PublicKey } from "@solana/web3.js";
import { WalletAction } from "../actions/walletActions";

export type WalletState = {
  adapterName: WalletAdapterName;

  // Cannot use Pubkey here because Redux require serializeable values
  walletAddress: string;
} | null;

const initialState: WalletState = null;

export default function walletReducer(
  state = initialState,
  action: WalletAction
) {
  switch (action.type) {
    case "connect":
      return action.payload;
    case "disconnect":
      return initialState;
    default:
      return state;
  }
}
