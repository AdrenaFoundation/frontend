import Image from 'next/image';
import React from 'react';

import { useSelector } from '@/store/store';

import infoIcon from '../../../../public/images/Icons/info.svg';

export default function ViewsWarning() {
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);

    // Ensure walletTokenBalances is loaded and wallet is connected
    if (!walletTokenBalances || !connected || isClosed) return null;

    const solBalance = walletTokenBalances['SOL'] ?? 0;

    if (solBalance > 0.001) return null;

    return (
        <div className="flex flex-row items-center justify-center gap-3 p-1 bg-amber-700 w-full z-20">
            <div className="flex flex-row items-center gap-2">
                <Image src={infoIcon} alt="Warning" width={14} height={14} />

                <p className="font-mono font-bold">
                    Your SOL balance is low. Please top up your wallet to get the best experience.
                </p>
            </div>
        </div>
    );
}
