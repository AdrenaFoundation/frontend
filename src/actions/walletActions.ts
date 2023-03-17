import { getWalletAdapters, WalletAdapterName } from "@/adapters/walletAdapters";
import { useSelector } from "@/store/store";
import { Dispatch } from "@reduxjs/toolkit";

export type ConnectWalletAction = {
    type: 'connect';
    payload: WalletAdapterName;
}

export type DisconnectWalletAction = {
    type: 'disconnect';
}

export type WalletAction = ConnectWalletAction | DisconnectWalletAction;


export const connectWalletAction = (name: WalletAdapterName) => async (dispatch: Dispatch<ConnectWalletAction>) => {
    const adapter = getWalletAdapters()[name];

    adapter.on("connect", () => {
        dispatch({
            type: 'connect',
            payload: name,
        });

        console.log('Connected!');
    });

    try {
        await adapter.connect();
    } catch (err) {
        console.log(new Error(`unable to connect to wallet ${name}`), { err });
    }
};

export const disconnectWalletAction = (name: WalletAdapterName) => async (dispatch: Dispatch<DisconnectWalletAction>) => {
    const adapter = getWalletAdapters()[name];

    adapter.on("disconnect", () => {
        dispatch({
            type: 'disconnect',
        });

        console.log('Disconnected!');
    });

    try {
        await adapter.disconnect();
    } catch (err) {
        console.log(new Error(`unable to disconnect from wallet ${name}`), { err });
    }
};