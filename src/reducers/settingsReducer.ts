import { SettingsActions } from "@/actions/settingsActions";
import { SolanaExplorerOptions } from "@/types";

export type SettingsState = {
  showFeesInPnl: boolean;
  showPopupOnPositionClose: boolean;
  preferredSolanaExplorer: SolanaExplorerOptions;
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: SettingsState = Object.freeze({
  showFeesInPnl: true,
  showPopupOnPositionClose: true,
  preferredSolanaExplorer: "Solana Explorer",
});

export default function settingsRatesReducer(
  state = initialState,
  action: SettingsActions,
) {
  switch (action.type) {
    case "setSettings":
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
