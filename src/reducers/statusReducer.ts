import { StatusActions } from '@/actions/statusActions';

export type StatusState = {
  tokenPricesWebSocket: boolean;
  notificationsWebSocket: boolean;
  chatWebSocket: boolean;
  dataApiClient: boolean;
  tokenPricesWebSocketLoading: boolean;
  notificationsWebSocketLoading: boolean;
  chatWebSocketLoading: boolean;
  dataApiClientLoading: boolean;
};

// Default status - all services start as disconnected
const DEFAULT_STATUS: StatusState = {
  tokenPricesWebSocket: false,
  notificationsWebSocket: false,
  chatWebSocket: false,
  dataApiClient: false,
  tokenPricesWebSocketLoading: true,
  notificationsWebSocketLoading: true,
  chatWebSocketLoading: true,
  dataApiClientLoading: true,
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: StatusState = Object.freeze(DEFAULT_STATUS);

export default function statusReducer(
  state = initialState,
  action: StatusActions,
) {
  switch (action.type) {
    case 'setConnectionStatus':
      return {
        ...state,
        [action.payload.service]: action.payload.status,
      };
    case 'setConnectionLoadingStatus':
      return {
        ...state,
        [action.payload.service]: action.payload.isLoading,
      };
    case 'setMultipleConnectionStatus':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
