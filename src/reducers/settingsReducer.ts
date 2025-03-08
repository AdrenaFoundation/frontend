import { SettingsActions } from "@/actions/settingsActions";
import { PriorityFeeOption, SolanaExplorerOptions } from "@/types";
import { DEFAULT_MAX_PRIORITY_FEE, DEFAULT_PRIORITY_FEE_OPTION } from "@/utils";

export type SettingsState = {
  showFeesInPnl: boolean;
  showPopupOnPositionClose: boolean;
  preferredSolanaExplorer: SolanaExplorerOptions;
  priorityFeeOption: PriorityFeeOption;
  maxPriorityFee: number;
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: SettingsState = Object.freeze({
  showFeesInPnl: true,
  showPopupOnPositionClose: true,
  preferredSolanaExplorer: "Solana Explorer",
  priorityFeeOption: DEFAULT_PRIORITY_FEE_OPTION,
  maxPriorityFee: DEFAULT_MAX_PRIORITY_FEE,
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
