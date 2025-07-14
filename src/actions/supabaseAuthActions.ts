import { Dispatch } from '@reduxjs/toolkit';

import { AuthenticationState } from '@/reducers/supabaseAuthReducer';
import supabaseAnonClient from '@/supabaseAnonClient';

export type setIsAuthModalOpenAction = {
  type: 'setIsAuthModalOpen';
  payload: AuthenticationState['isAuthModalOpen'];
};

export type setVerifiedWalletAddressesAction = {
  type: 'setVerifiedWalletAddresses';
  payload: AuthenticationState['verifiedWalletAddresses'];
};

export type setIsSignedInAnonymouslyAction = {
  type: 'setIsSignedInAnonymously';
  payload: AuthenticationState['isSignedInAnonymously'];
};

export type AuthActions =
  | setIsAuthModalOpenAction
  | setVerifiedWalletAddressesAction
  | setIsSignedInAnonymouslyAction;

export const setVerifiedWalletAddresses =
  () => async (dispatch: Dispatch<setVerifiedWalletAddressesAction>) => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabaseAnonClient.auth.getUser();

      if (authError || !user) {
        console.error('Error fetching user:', authError);
        return dispatch({
          type: 'setVerifiedWalletAddresses',
          payload: [],
        });
      }

      dispatch({
        type: 'setVerifiedWalletAddresses',
        payload: user.app_metadata.verified_wallet_addresses || [],
      });
    } catch (error) {
      console.error('Error setting verified wallet addresses:', error);
      dispatch({
        type: 'setVerifiedWalletAddresses',
        payload: [],
      });
    }
  };

export const refreshVerifiedWalletAddresses =
  () => async (dispatch: Dispatch<setVerifiedWalletAddressesAction>) => {
    try {
      await supabaseAnonClient.auth.refreshSession();

      const {
        data: { user },
        error: authError,
      } = await supabaseAnonClient.auth.getUser();

      if (authError || !user) {
        console.error('Error fetching user:', authError);
        return dispatch({
          type: 'setVerifiedWalletAddresses',
          payload: [],
        });
      }

      dispatch({
        type: 'setVerifiedWalletAddresses',
        payload: user.app_metadata.verified_wallet_addresses,
      });
    } catch (error) {
      console.error('Error refreshing verified wallet addresses:', error);
      dispatch({
        type: 'setVerifiedWalletAddresses',
        payload: [],
      });
    }
  };

export const checkAndSignInAnonymously =
  () => async (dispatch: Dispatch<setIsSignedInAnonymouslyAction>) => {
    try {
      const {
        data: { session },
      } = await supabaseAnonClient.auth.getSession();

      if (session) {
        return dispatch({
          type: 'setIsSignedInAnonymously',
          payload: true,
        });
      }

      const { error } = await supabaseAnonClient.auth.signInAnonymously();
      if (error) {
        console.error('Error signing in anonymously:', error);
        return dispatch({
          type: 'setIsSignedInAnonymously',
          payload: false,
        });
      } else {
        return dispatch({
          type: 'setIsSignedInAnonymously',
          payload: true,
        });
      }
    } catch (error) {
      console.error('Error checking or signing in anonymously:', error);
      return dispatch({
        type: 'setIsSignedInAnonymously',
        payload: false,
      });
    }
  };

export const setIsAuthModalOpen =
  (isAuthModalOpen: boolean) =>
  async (dispatch: Dispatch<setIsAuthModalOpenAction>) => {
    dispatch({
      type: 'setIsAuthModalOpen',
      payload: isAuthModalOpen,
    });
  };
