import Image from 'next/image';
import React, { useState } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';

import crossIcon from '../../../../public/images/Icons/cross.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';

export default function ViewsWarning({ message }: { message?: React.ReactNode }) {
    const [isClosed, setIsClosed] = useState(false);

    const wallet = useSelector((state) => state.walletState.wallet);
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);
    const connected = !!wallet;

    if (isClosed) return null;

    if (!message) {
        // Ensure walletTokenBalances is loaded and wallet is connected
        if (!walletTokenBalances || !connected) return null;

        const solBalance = walletTokenBalances['SOL'] ?? 0;

        if (solBalance > 0.001) return null;
    }

    return (
        <div className="flex flex-row items-center justify-center gap-3 p-1 bg-amber-700 w-full z-20">
            <div className="flex flex-row items-center gap-2">
                <Image src={infoIcon} alt="Warning" width={14} height={14} />

                {!message ? <p className="text-sm font-boldy max-w-[300px] sm:max-w-max text-center">
                    You need at least <FormatNumber
                        nb={0.001}
                        precision={3}
                        isDecimalDimmed={false}
                    /> SOL to interact with the app
                </p> :
                    message
                }
            </div>

            <Image
                src={crossIcon}
                className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300"
                alt="close btn"
                width={14}
                height={14}
                onClick={() => {
                    setIsClosed(true);
                }}
            />
        </div>
    );
}
