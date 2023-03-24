import { Dispatch } from "@reduxjs/toolkit";
import { PublicKey } from "@solana/web3.js";
import { Wallet } from "@project-serum/anchor";
import { WalletAdapterName } from "@/types";
import { walletAdapters } from "@/constant";

export type ConnectWalletAction = {
  type: "connect";
  payload: {
    adapterName: WalletAdapterName;
    walletAddress: string;
  };
};

export type DisconnectWalletAction = {
  type: "disconnect";
};

export type WalletAction = ConnectWalletAction | DisconnectWalletAction;

export const connectWalletAction =
  (adapterName: WalletAdapterName) =>
  async (dispatch: Dispatch<ConnectWalletAction>) => {
    const adapter = walletAdapters[adapterName];

    adapter.on("connect", (walletPubkey: PublicKey) => {
      dispatch({
        type: "connect",
        payload: {
          adapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });

      console.log("Connected!");
    });

    try {
      await adapter.connect();
    } catch (err) {
      console.log(new Error(`unable to connect to wallet ${adapterName}`), {
        err,
      });
    }
  };

export const disconnectWalletAction =
  (adapterName: WalletAdapterName) =>
  async (dispatch: Dispatch<DisconnectWalletAction>) => {
    const adapter = walletAdapters[adapterName];

    adapter.on("disconnect", () => {
      dispatch({
        type: "disconnect",
      });

      console.log("Disconnected!");
    });

    try {
      await adapter.disconnect();
    } catch (err) {
      console.log(
        new Error(`unable to disconnect from wallet ${adapterName}`),
        {
          err,
        }
      );
    }
  };
