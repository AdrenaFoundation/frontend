import Image from 'next/image';
import React from 'react';

import jtoLogo from '@/../../public/images/jito-logo-2.png';
import { TRADING_COMPETITION_SEASONS } from '@/constant';
import { CompetitionHeader, SocialButtons } from '@/pages/ranked/Awakening';

import Quests from './Quests';

export default function Expanse() {
    const twitterText = `Join the Adrena Trading Competition! 🚀📈🏆 @adrenaprotocol`;

    return (
        <div className="max-w-[1400px] w-full mx-auto mt-5 px-4">
            <div className="flex flex-col xl:flex-row justify-between md:items-center gap-6 mb-12">
                <div className="flex flex-col items-center xl:items-start">
                    <CompetitionHeader
                        startDate={TRADING_COMPETITION_SEASONS['expanse'].startDate}
                        endDate={TRADING_COMPETITION_SEASONS['expanse'].endDate}
                        description={TRADING_COMPETITION_SEASONS['expanse'].description}
                    />
                    <SocialButtons twitterText={twitterText} docsLink="https://app.gitbook.com/o/DR8o6dMfEDmyhzH0OIxj/s/SrdLcmUOicAVBsHQeHAa/community/trading-competitions/season-1-expanse" />
                </div>

                <div>
                    <p className="font-boldy mb-3 mt-4 xl:mt-0 flex text-base justify-center xl:justify-start">Total Contest Rewards</p>
                    <div className="flex flex-row gap-2 items-center justify-center md:justify-start bg-[#0D1923] px-8 py-3 rounded-lg border border-white/5 mb-3">
                        <Image
                            src={window.adrena.client.adxToken.image}
                            alt="ADX logo"
                            className="w-4 h-4"
                        />
                        <p className="text-xl font-mono">
                            2m ADX <span>Rewards</span>
                        </p>
                    </div>

                    <div className="flex flex-row gap-1 items-center justify-center md:justify-start bg-[#0D1923] px-8 py-3 rounded-lg border border-white/5">
                        <Image src={jtoLogo} alt="JTO logo" className="w-5 h-5" />
                        <p className="text-xl font-mono">
                            50k JTO <span>Rewards</span>
                        </p>
                    </div>
                </div>
            </div>

            <Quests />
        </div>
    );
}
