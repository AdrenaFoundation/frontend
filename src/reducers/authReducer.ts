import { AuthActions } from '@/actions/authActions';

export type AuthenticationState = {
  isSignedInAnonymously: boolean;
  isAuthModalOpen: boolean;
  verifiedWalletAddresses: string[];
};

// freeze the initial state object to make sure it can be re-used through
// the app's lifecycle & is never mutated.
const initialState: AuthenticationState = Object.freeze({
  isSignedInAnonymously: false,
  isAuthModalOpen: false,
  verifiedWalletAddresses: [],
});

export default function authReducer(state = initialState, action: AuthActions) {
  switch (action.type) {
    case 'setIsAuthModalOpen':
      return { ...state, isAuthModalOpen: action.payload };
    case 'setVerfiedWalletAddresses':
      return { ...state, verifiedWalletAddresses: action.payload };
    case 'setIsSignedInAnonymously':
      return { ...state, isSignedInAnonymously: action.payload };
    default:
      return state;
  }
}
