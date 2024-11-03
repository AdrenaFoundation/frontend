import Image from 'next/image';
import React from 'react';

import { useSelector } from '@/store/store';

import crossIcon from '../../../../public/images/Icons/cross.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';

export default function ViewsWarning() {
    const isViewsWarningClosed = localStorage.getItem('viewsWarningClosed');

    const wallet = useSelector((state) => state.walletState.wallet);
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);
    const connected = !!wallet;

    const solBalance = walletTokenBalances?.['SOL'] ?? 0;

    if (solBalance > 0.01 || !connected || isViewsWarningClosed === 'true')
        return null;

    return (
        <div className="flex flex-row items-center justify-between p-3 bg-amber-600 w-full z-30">
            <div className="flex flex-row items-center gap-2">
                <Image src={infoIcon} alt="Warning" width={16} height={16} />

                <p className="font-mono font-bold max-w-[300px] sm:max-w-max">
                    You need at least 0.01 SOL to interact with the app
                </p>
            </div>

            <Image
                src={crossIcon}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300"
                alt="close btn"
                width={16}
                height={16}
                onClick={() => localStorage.setItem('viewsWarningClosed', 'true')}
            />
        </div>
    );
}
