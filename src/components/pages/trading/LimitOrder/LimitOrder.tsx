import React from 'react';
import { twMerge } from 'tailwind-merge';

import { LimitOrderBookExtended } from '@/types';

import LimitOrderBlocks from './LimitOrderBlocks';

export default function LimitOrder({
    className,
    walletAddress,
    limitOrderBook,
    reload,
}: {
    className?: string;
    walletAddress: string | null;
    limitOrderBook: LimitOrderBookExtended | null;
    reload: () => void;
}) {
    return (
        <div
            className={twMerge(
                'flex flex-col gap-3 h-full w-full items-center',
                className,
            )}
        >
            <LimitOrderBlocks
                connected={!!walletAddress}
                limitOrders={limitOrderBook ? limitOrderBook?.limitOrders : []}
                // isLoading={isLoading}
                reload={reload}
            />
        </div>
    );
}
