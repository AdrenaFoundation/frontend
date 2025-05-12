import { Connection } from '@solana/web3.js';
import React, { useState } from 'react';

import { LinksType, UserProfileExtended, VestExtended, WalletAdapterExtended } from '@/types';

import DynamicWalletMenu from '../DynamicWallet/DynamicWalletMenu';
import Header from './Header';

/**
 * DynamicHeaderWrapper is a wrapper around the standard Header component
 * that replaces the WalletAdapter with the Dynamic wallet integration
 */
export const DynamicHeaderWrapper: React.FC<{
    userProfile: UserProfileExtended | null | false;
    PAGES: LinksType[];
    activeRpc: {
        name: string;
        connection: Connection;
    };
    rpcInfos: {
        name: string;
        latency: number | null;
    }[];
    customRpcLatency: number | null;
    autoRpcMode: boolean;
    customRpcUrl: string | null;
    favoriteRpc: string | null;
    userVest: VestExtended | null | false;
    userDelegatedVest: VestExtended | null | false;
    setAutoRpcMode: (autoRpcMode: boolean) => void;
    setCustomRpcUrl: (customRpcUrl: string | null) => void;
    setFavoriteRpc: (favoriteRpc: string) => void;
    adapters: WalletAdapterExtended[];
}> = (props) => {
    const [isPriorityFeeModalOpen, setIsPriorityFeeModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // HeaderWithDynamicWallet component
    const HeaderWithDynamicWallet = React.useCallback(() => {
        // Check if we're in a header container
        const headerEl = document.querySelector('div.flex.flex-row.items-center.gap-2');

        if (headerEl) {
            // The wallet adapter is the last element in the right section of the header
            const walletAdapterContainer = headerEl.lastElementChild;

            if (walletAdapterContainer) {
                // Replace the wallet adapter with our dynamic wallet
                return (
                    <DynamicWalletMenu
                        userProfile={props.userProfile}
                        setIsPriorityFeeModalOpen={setIsPriorityFeeModalOpen}
                        setIsSettingsModalOpen={setIsSettingsModalOpen}
                    />
                );
            }
        }

        return null;
    }, [props.userProfile]);

    return (
        <>
            <Header {...props} />
            <HeaderWithDynamicWallet />
        </>
    );
};

export default DynamicHeaderWrapper;
