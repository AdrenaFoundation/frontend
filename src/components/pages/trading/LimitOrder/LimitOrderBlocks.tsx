import { memo } from 'react';
import { twMerge } from 'tailwind-merge';

import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { LimitOrder } from '@/types';

import LimitOrderBlock from './LimitOrderBlock';
import Loader from '@/components/Loader/Loader';

export function LimitOrderBlocks({
    connected,
    className,
    limitOrders,
    isLoading,
}: {
    connected: boolean;
    className?: string;
    limitOrders: LimitOrder[];
    isLoading: boolean;
}) {
    if (isLoading) {
        return (
            <div className="flex overflow-hidden w-full mt-4 h-[15em] items-center justify-center">
                <Loader className='ml-auto mr-auto' />
            </div>
        );
    }

    if (!connected) {
        return (
            <div className="flex overflow-hidden bg-main/90 w-full border rounded-lg mt-4 h-[15em] items-center justify-center">
                <WalletConnection connected={connected} />
            </div>
        );
    }

    if (!limitOrders.length) {
        return (
            <div className="flex overflow-hidden bg-main/90 grow border rounded-lg h-[15em] items-center justify-center">
                <div className="text-sm opacity-50 font-normal mt-5 font-boldy">
                    No limit orders
                </div>
            </div>
        );
    }

    return (
        <div
            className={twMerge(
                'flex flex-col bg-first w-full h-full gap-3',
                className,
            )}
        >
            {limitOrders.map((order) => (
                <LimitOrderBlock
                    key={order.id}
                    order={order}
                    onCancel={() => {
                        // Will implement cancel handler later
                    }}
                />
            ))}
        </div>
    );
}

export default memo(LimitOrderBlocks);
