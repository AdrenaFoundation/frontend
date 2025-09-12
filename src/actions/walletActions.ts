import { Dispatch } from '@reduxjs/toolkit';
import { Adapter, WalletConnectionError } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';

import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { addNotification } from '@/utils';

export type ConnectWalletAction = {
  type: 'connect';
  payload: {
    adapterName: WalletAdapterName;
    walletAddress: string;
  };
};

export type DisconnectWalletAction = {
  type: 'disconnect';
};

export type OpenCloseConnectionModalAction = {
  type: 'openCloseConnectionModal';
  // true = open
  payload: boolean;
};

export type WalletAction =
  | ConnectWalletAction
  | DisconnectWalletAction
  | OpenCloseConnectionModalAction;

export const openCloseConnectionModalAction =
  (open: boolean) =>
  async (dispatch: Dispatch<OpenCloseConnectionModalAction>) => {
    dispatch({
      type: 'openCloseConnectionModal',
      payload: open,
    });
  };

export const autoConnectWalletAction =
  (adapter: Adapter) => async (dispatch: Dispatch<ConnectWalletAction>) => {
    const connectFn = (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName: adapter.name as WalletAdapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });

      addNotification({
        title: 'Wallet auto-connected',
        duration: 'fast',
      });
    };

    adapter.once('connect', connectFn);

    try {
      await adapter.autoConnect();
      localStorage.setItem('autoConnectAuthorized', 'true');

      adapter.removeListener('connect', connectFn);

      localStorage.setItem('lastConnectedWallet', adapter.name);
    } catch (err) {
      localStorage.setItem('autoConnectAuthorized', 'false');

      console.log(
        new Error(`unable to auto-connect to wallet ${adapter.name}`),
        {
          err,
        },
      );

      adapter.removeListener('connect', connectFn);
    }
  };

export const connectWalletAction =
  (adapter: Adapter) => async (dispatch: Dispatch<ConnectWalletAction>) => {
    const connectFn = (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName: adapter.name as WalletAdapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });

      addNotification({
        title: 'Wallet connected',
        duration: 'fast',
      });
    };

    adapter.once('connect', connectFn);

    try {
      await adapter.connect();

      if (adapter.connected && adapter.publicKey) {
        setTimeout(() => {
          if (adapter.connected && adapter.publicKey) {
            connectFn(adapter.publicKey);
          }
        }, 100);
      }

      localStorage.setItem('autoConnectAuthorized', 'true');
      localStorage.setItem('lastConnectedWallet', adapter.name);
    } catch (err: unknown) {
      localStorage.setItem('autoConnectAuthorized', 'false');

      console.log(new Error(`unable to connect to wallet ${adapter.name}`), {
        err,
      });

      addNotification({
        type: 'error',
        title: `${adapter.name} connection error`,
        message:
          err instanceof WalletConnectionError ? err.message : 'Unknown error',
        duration: 'long',
      });

      adapter.removeListener('connect', connectFn);
    }
  };

export const disconnectWalletAction =
  (adapter: Adapter) => async (dispatch: Dispatch<DisconnectWalletAction>) => {
    adapter.once('disconnect', () => {
      dispatch({
        type: 'disconnect',
      });

      addNotification({
        title: 'Wallet disconnected',
        duration: 'fast',
      });
    });

    try {
      await adapter.disconnect();
      localStorage.setItem('autoConnectAuthorized', 'false');
    } catch (err) {
      localStorage.setItem('autoConnectAuthorized', 'true');
      console.log(
        new Error(`unable to disconnect from wallet ${adapter.name}`),
        {
          err,
        },
      );
    }
  };
