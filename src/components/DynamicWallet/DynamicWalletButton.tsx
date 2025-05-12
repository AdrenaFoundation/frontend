import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import useDynamicWallet from '@/hooks/useDynamicWallet';

import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';

interface DynamicWalletButtonProps {
    className?: string;
    isIconOnly?: boolean;
}

/**
 * DynamicWalletButton renders a button for connecting/disconnecting wallets
 * using Dynamic's wallet widget for authentication flow
 */
export const DynamicWalletButton: React.FC<DynamicWalletButtonProps> = ({
    className,
    isIconOnly = false,
}) => {
    const { primaryWallet, connectWallet } = useDynamicWallet();
    const connected = !!primaryWallet;

    return (
        <div className="relative">
            <DynamicWidget
                variant="modal"
            />

            {/* Use our custom button styling for consistency with existing UI */}
            {!connected && (
                <Button
                    className={twMerge(
                        className,
                        'gap-1 pl-2 pr-3 text-xs w-[15em] border border-white/20',
                        isIconOnly && 'p-0 h-8 w-8',
                    )}
                    title={!isIconOnly ? 'Connect wallet' : null}
                    leftIcon={walletIcon}
                    alt="wallet icon"
                    leftIconClassName="w-4 h-4"
                    variant="lightbg"
                    onClick={connectWallet}
                />
            )}

        </div>
    );
};

export default DynamicWalletButton;
