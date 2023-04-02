import { Dispatch } from '@reduxjs/toolkit';
import { PublicKey } from '@solana/web3.js';

import { walletAdapters } from '@/constant';
import { WalletAdapterName } from '@/types';

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

export type WalletAction = ConnectWalletAction | DisconnectWalletAction;

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

      console.log('Connected!');
    };

    adapter.on('connect', connectFn);

    try {
      await adapter.autoConnect();
    } catch (err) {
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

      console.log('Connected!');
    };

    adapter.on('connect', connectFn);

    try {
      await adapter.connect();
    } catch (err) {
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

    adapter.on('disconnect', () => {
      dispatch({
        type: 'disconnect',
      });

      console.log('Disconnected!');
    });

    try {
      await adapter.disconnect();
    } catch (err) {
      console.log(
        new Error(`unable to disconnect from wallet ${adapterName}`),
        {
          err,
        },
      );
    }
  };
