import { WalletAdapterName } from "@/adapters/walletAdapters";
import { WalletAction } from "../actions/walletActions";

export type WalletState = WalletAdapterName | null;

const initialState: WalletState = null;

export default function walletReducer(state = initialState, action: WalletAction) {
    switch (action.type) {
        case 'connect':
            return action.payload;
        case 'disconnect':
            return initialState;
        default:
            return state;
    };
}