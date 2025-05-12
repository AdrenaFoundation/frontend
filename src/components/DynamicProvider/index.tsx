import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from '@dynamic-labs/solana';
import React, { ReactNode } from 'react';

interface DynamicProviderProps {
    children: ReactNode;
}

/**
 * DynamicProvider component wraps the application with Dynamic SDK's provider
 * to enable wallet connections and authentication using Dynamic.xyz
 *
 * Note: RPC URLs should be configured in the Dynamic Dashboard:
 * 1. Go to Chains & Networks page
 * 2. Click on Solana chain
 * 3. Expand the network
 * 4. Enter your Provider URL
 * 5. Test the URL
 */
export const DynamicProvider: React.FC<DynamicProviderProps> = ({ children }) => {
    return (
        <>
            <DynamicContextProvider
                settings={{
                    // https://app.dynamic.xyz to get an environment ID
                    environmentId: process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID!,
                    walletConnectors: [SolanaWalletConnectors],
                    overrides: {
                        multiWallet: true,
                    },
                    // Set social login and passkey options
                    mobileExperience: 'in-app-browser',
                    // These settings will help with the PasskeyWalletConnector issue
                    shadowDOMEnabled: false,
                    transactionConfirmation: {
                        required: false,
                    },
                }}
            >
                {children}
            </DynamicContextProvider>
        </>
    );
};

export default DynamicProvider;
