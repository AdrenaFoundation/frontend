import { Dispatch } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';

import { walletAdapters } from '@/constant';
import { WalletAdapterName } from '@/types';
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
  (adapterName: WalletAdapterName) =>
  async (dispatch: Dispatch<ConnectWalletAction>) => {
    const adapter = walletAdapters[adapterName];

    const connectFn = (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });

      addNotification({ title: 'Wallet connected', duration: 'fast' });
    };

    adapter.once('connect', connectFn);

    try {
      await adapter.autoConnect();
      localStorage.setItem('isWalletConnected', 'true');
    } catch (err) {
      localStorage.setItem('isWalletConnected', 'false');
      console.log(
        new Error(`unable to auto-connect to wallet ${adapterName}`),
        {
          err,
        },
      );

      adapter.removeListener('connect', connectFn);
    }
  };

export const connectWalletAction =
  (adapterName: WalletAdapterName) =>
  async (dispatch: Dispatch<ConnectWalletAction>) => {
    const adapter = walletAdapters[adapterName];

    const connectFn = (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });

      addNotification({ title: 'Wallet connected', duration: 'fast' });
    };

    adapter.once('connect', connectFn);

    try {
      await adapter.connect();
      localStorage.setItem('isWalletConnected', 'true');
    } catch (err) {
      localStorage.setItem('isWalletConnected', 'false');
      console.log(new Error(`unable to connect to wallet ${adapterName}`), {
        err,
      });

      adapter.removeListener('connect', connectFn);
    }
  };

export const disconnectWalletAction =
  (adapterName: WalletAdapterName) =>
  async (dispatch: Dispatch<DisconnectWalletAction>) => {
    const adapter = walletAdapters[adapterName];

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
      localStorage.setItem('isWalletConnected', 'false');
    } catch (err) {
      localStorage.setItem('isWalletConnected', 'true');
      console.log(
        new Error(`unable to disconnect from wallet ${adapterName}`),
        {
          err,
        },
      );
    }
  };
