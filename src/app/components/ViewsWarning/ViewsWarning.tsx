import Image from 'next/image';
import React from 'react';

import { useSelector } from '@/store/store';

import infoIcon from '../../../../public/images/Icons/info.svg';

export default function ViewsWarning() {
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);

    const solBalance = walletTokenBalances?.['SOL'] ?? 0;

    if (solBalance > 0) return null;

    return (
        <div className='fixed flex items-center justify-center sm:justify-start w-full md:left-10 bottom-[50px] p-4 pb-0 z-30'>
            <div className="flex flex-row items-center gap-2 w-full max-w-[400px] p-3 bg-amber-600 rounded-xl shadow-xl">
                <Image src={infoIcon} alt="Warning" width={16} height={16} />

                <p className="font-mono font-bold">
                    Your SOL balance is low. Please top up your wallet to get the best experience.
                </p>
            </div>
        </div>
    );
}
