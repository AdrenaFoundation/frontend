import React from 'react';
import { twMerge } from 'tailwind-merge';

import { useLimitOrderBook } from '@/hooks/useLimitOrderBook';
import { useSelector } from '@/store/store';

import LimitOrderBlocks from './LimitOrderBlocks';

export default function LimitOrder({
    className,
}: {
    className?: string;
}) {
    const walletAddress = useSelector((s) => s.walletState.wallet);
    const { limitOrderBook, isLoading } = useLimitOrderBook({
        walletAddress: walletAddress?.walletAddress ?? null,
    });

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
                isLoading={isLoading}
            />
        </div>
    );
}
