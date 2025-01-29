import Image from 'next/image';
import React, { useMemo, useState } from 'react';

import jtoLogo from '@/../../public/images/jito-logo-2.png';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';

import Quests from '../../../components/pages/ranked/Quests';
import Leaderboards from '../../../components/pages/ranked/Leaderboards';

export default function Expanse() {
    const [activeTab, setActiveTab] = useState<'Leaderboard' | 'Mechanics'>('Leaderboard');

    const tokenPrices = useSelector((s) => s.tokenPrices);

    const totalPrize = useMemo(() => {
        return 5000000 * (tokenPrices['ADX'] ?? 0) + 50000 * (tokenPrices['JTO'] ?? 0);
    }, [tokenPrices]);

    return (
        <div className="max-w-[1400px] w-full mx-auto px-4 relative flex flex-col">
            <div
                className='uppercase self-center mb-8 sm:mb-0 font-thin sm:absolute sm:-top-[6em] sm:right-2 text-sm underline opacity-40 hover:opacity-100 transition-opacity cursor-pointer p-1'
                onClick={() => setActiveTab(activeTab === 'Leaderboard' ? 'Mechanics' : 'Leaderboard')}
            >
                {activeTab === 'Leaderboard' ? 'SEE MECHANICS' : 'SEE LEADERBOARD'}
            </div>

            <div className='flex flex-col items-center justify-center'>
                <div className='text-xs font-thin text-txtfade'>PRIZE POOL</div>

                <div className='w-[20em] flex items-center justify-center rounded-lg flex-col'>
                    {!tokenPrices["ADX"] || !tokenPrices["JTO"] ? '-' :
                        <FormatNumber
                            format='currency'
                            nb={totalPrize}
                            className="text-5xl font-boldy"
                            isDecimalDimmed={false}
                        />}

                    <div className='flex gap-1 mt-2 bg-[#0D1923] border border-white/5 rounded-lg pt-2 pb-2 pl-4 pr-4'>
                        <div className="flex flex-row gap-1 items-center justify-center">
                            <Image
                                src={window.adrena.client.adxToken.image}
                                alt="ADX logo"
                                className="w-4 h-4"
                            />

                            <p className="text-md font-boldy text-txtfade">
                                5,000,000 ADX
                            </p>
                        </div>

                        <div className='flex text-txtfade'>/</div>

                        <div className="flex flex-row gap-1 items-center justify-center">
                            <Image src={jtoLogo} alt="JTO logo" className="w-5 h-5" />

                            <p className="text-md font-boldy text-txtfade">
                                50,000 JTO
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='h-[1px] w-full bg-white/10 mb-8 mt-12' />

            {activeTab === 'Leaderboard' ? <>
                <div className="flex mb-8 mt-8 gap-8">
                    <div className='w-full uppercase text-center text-[1.5em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]'>
                        Trade and dominate weekly
                    </div>

                    <div className='w-full uppercase text-center text-[1.5em] font-archivo animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem] bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]'>
                        be the champion and claim your prize
                    </div>
                </div>

                <Leaderboards />
            </> : <Quests />}
        </div>
    );
}
