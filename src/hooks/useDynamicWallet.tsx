import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useEffect } from 'react';

import { useDispatch } from '@/store/store';

/**
 * Custom hook to access Dynamic wallet functionality and integrate
 * with our existing Redux-based wallet state management
 */
export const useDynamicWallet = () => {
    const dispatch = useDispatch();
    const {
        primaryWallet,
        user,
        handleLogOut,
        setShowAuthFlow,
        showAuthFlow
    } = useDynamicContext();

    // Update Redux state when Dynamic wallet state changes
    useEffect(() => {
        if (primaryWallet) {
            // Update the Redux store with connected wallet information
            dispatch({
                type: 'connect',
                payload: {
                    adapterName: primaryWallet.connector?.name || 'Dynamic',
                    walletAddress: primaryWallet.address,
                },
            });
        } else if (!primaryWallet) {
            // Reset wallet state in Redux when disconnected
            dispatch({
                type: 'disconnect',
            });
        }
    }, [primaryWallet, dispatch]);

    // Handle connecting wallet
    const connectWallet = () => {
        setShowAuthFlow(true);
    };

    // Handle disconnecting wallet
    const disconnectWallet = async () => {
        await handleLogOut();
    };

    return {
        primaryWallet,
        user,
        connectWallet,
        disconnectWallet,
        showAuthFlow,
        setShowAuthFlow
    };
};

export default useDynamicWallet;
