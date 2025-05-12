import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import useDynamicWallet from '@/hooks/useDynamicWallet';

interface DynamicWidgetButtonProps {
    className?: string;
}

/**
 * A customized Dynamic widget that displays a "Dynamic" option in the wallet picker
 */
const DynamicWidgetButton: React.FC<DynamicWidgetButtonProps> = ({ className }) => {
    const { connectWallet } = useDynamicWallet();

    return (
        <div className={twMerge("relative", className)}>
            <DynamicWidget
                innerButtonComponent={
                    <div
                        onClick={connectWallet}
                        className="w-full py-3 px-4 flex items-center justify-between bg-[#181a20] hover:bg-[#22252e] rounded-lg transition-all duration-200 cursor-pointer"
                        role="button"
                        tabIndex={0}
                    >
                        <span className="text-white font-medium">Dynamic</span>
                        <img
                            src="https://assets.dynamic.xyz/assets/logo/opengraph.png"
                            alt="Dynamic Logo"
                            className="h-8 w-8 rounded-full"
                        />
                    </div>
                }
                variant="modal"
            />
        </div>
    );
};

export default DynamicWidgetButton;
