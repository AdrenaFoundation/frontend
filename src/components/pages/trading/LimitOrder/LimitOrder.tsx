import React from 'react';
import { twMerge } from 'tailwind-merge';

import { useLimitOrderBook } from '@/hooks/useLimitOrderBook';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';

import LimitOrderBlocks from './LimitOrderBlocks';

interface LimitOrderProps {
    className?: string;
    selectedToken: Token | null;
}

// Token mapping for display purposes
const TOKEN_MAPPING: Record<string, string> = {
    'JITOSOL': 'SOL',
    'BTC': 'WBTC',
};

export default function LimitOrder({
    className,
    selectedToken,
}: LimitOrderProps) {
    const walletAddress = useSelector((s) => s.walletState.wallet);
    const { limitOrderBook, isLoading } = useLimitOrderBook({
        walletAddress: walletAddress?.walletAddress ?? null,
    });

    // Filter orders based on selected token, considering token mapping
    const filteredOrders = limitOrderBook?.limitOrders.filter(order => {
        if (!selectedToken) return true;

        const orderToken = window.adrena.client.tokens.find(t =>
            t.mint.equals(order.custody)
        );
        if (!orderToken) return false;

        const orderSymbol = getTokenSymbol(orderToken.symbol);
        const selectedSymbol = getTokenSymbol(selectedToken.symbol);

        // Check direct match
        if (orderSymbol === selectedSymbol) return true;

        // Check mapped tokens
        if (TOKEN_MAPPING[orderSymbol] === selectedSymbol) return true;
        if (TOKEN_MAPPING[selectedSymbol] === orderSymbol) return true;

        return false;
    }) ?? [];

    return (
        <div
            className={twMerge(
                'flex flex-col gap-3 h-full w-full items-center',
                className,
            )}
        >
            <LimitOrderBlocks
                connected={!!walletAddress}
                limitOrders={filteredOrders}
                isLoading={isLoading}
            />
        </div>
    );
}
