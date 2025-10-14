import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { useMaintenanceMessages } from '@/hooks/useMaintenanceMessages';
import { useSelector } from '@/store/store';

import crossIcon from '../../../../public/images/Icons/cross.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';

export default function ViewsWarning() {
    const router = useRouter();
    const { messages } = useMaintenanceMessages();
    const [closedIds, setClosedIds] = useState<number[]>([]);
    const [solWarningClosed, setSolWarningClosed] = useState(false);
    const { openSidebar } = useWalletSidebar();

    const wallet = useSelector((state) => state.walletState.wallet);
    const walletTokenBalances = useSelector((state) => state.walletTokenBalances);
    const connected = !!wallet;

    const solBalance = walletTokenBalances?.['SOL'] ? walletTokenBalances['SOL'] : 0;

    const currentPage = router.pathname.replace('/', '');
    const releventMessages = (messages || []).filter(
        (msg) => msg.pages.includes(currentPage) && !closedIds.includes(msg.id),
    );

    return (
        <div className="flex flex-col gap-0 w-full z-20">
            {releventMessages.map((msg) => (
                <div
                    key={msg.id}
                    className="flex flex-row items-center justify-center gap-3 p-1 w-full z-20 border-b border-b-white/20 "
                    style={{ background: msg.color || '#b45309' }}
                >
                    <div className="flex flex-row items-center gap-2">
                        <Image src={infoIcon} alt="Warning" width={14} height={14} />
                        <p className="text-sm font-semibold max-w-[300px] sm:max-w-max text-center">
                            {msg.message}
                        </p>
                    </div>
                    <Image
                        src={crossIcon}
                        className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300"
                        alt="close btn"
                        width={14}
                        height={14}
                        onClick={() => setClosedIds((ids) => [...ids, msg.id])}
                    />
                </div>
            ))}

            {!(solBalance > 0.001) &&
                !solWarningClosed &&
                walletTokenBalances &&
                connected ? (
                <div className="flex flex-row items-center justify-center gap-3 p-1 bg-amber-700 w-full z-20 border-b border-b-white/20 cursor-pointer hover:bg-amber-600 transition-colors"
                    onClick={openSidebar}
                >
                    <div className="flex flex-row items-center gap-2">
                        <Image src={infoIcon} alt="Warning" width={14} height={14} />
                        <span className="text-sm font-semibold text-center">
                            You need at least{' '}
                            <FormatNumber nb={0.001} precision={3} isDecimalDimmed={false} />{' '}
                            SOL to interact with the app, click to open the wallet UI
                        </span>
                    </div>
                    <Image
                        src={crossIcon}
                        className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity duration-300"
                        alt="close btn"
                        width={14}
                        height={14}
                        onClick={(e) => {
                            e.stopPropagation();
                            setSolWarningClosed(true);
                        }}
                    />
                </div>
            ) : null}
        </div>
    );
}
