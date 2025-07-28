import { SettingsActions } from '@/actions/settingsActions';
import { PriorityFeeOption, SolanaExplorerOptions } from '@/types';
import { DEFAULT_SETTINGS } from '@/utils';

export type SettingsState = {
  disableChat: boolean;
  showFeesInPnl: boolean;
  showPopupOnPositionClose: boolean;
  preferredSolanaExplorer: SolanaExplorerOptions;
  priorityFeeOption: PriorityFeeOption;
  maxPriorityFee: number;
  openPositionCollateralSymbol: string;
  closePositionCollateralSymbol: string;
  depositCollateralSymbol: string;
  withdrawCollateralSymbol: string;
  disableFriendReq: boolean;
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: SettingsState = Object.freeze(DEFAULT_SETTINGS);

export default function settingsRatesReducer(
  state = initialState,
  action: SettingsActions,
) {
  switch (action.type) {
    case 'setSettings':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
