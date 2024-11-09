import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import firstImage from '@/../public/images/first-place.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import { getAbbrevWalletAddress } from '@/utils';

export default function WeeklyReward({
    rewards,
}: {
    rewards: Record<string, { trader: string | null; result: number | null }>;
}) {
    const AWARDS = [
        {
            title: 'Biggest Liquidation',
            trader: rewards['biggest liquidation'].trader,
            result: rewards['biggest liquidation'].result,
        },
        {
            title: 'Top Pnl Position',
            trader: rewards['top pnl position'].trader,
            result: rewards['top pnl position'].result,
        },
        {
            title: 'Top Degen',
            trader: rewards['top degen'].trader,
            result: rewards['top degen'].result,
        },
        {
            title: 'Partner Sponsored Trade',
            trader: rewards['partner sponsored trade'].trader,
            result: rewards['partner sponsored trade'].result,
        },
    ] as const;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {AWARDS.map((award) => (
                <div
                    className="flex flex-col gap-2 items-center justify-center bg-[#111922] border border-[##1F252F] rounded-lg shadow-xl p-3 flex-1"
                    key={award.title}
                >
                    <Image
                        src={firstImage}
                        alt="first place logo"
                        width={40}
                        height={40}
                    />
                    <div className="flex flex-col items-center">
                        <p className="text-base sm:text-lg text-center font-boldy mb-0.5">
                            {award.title}
                        </p>
                        {award.result ? (
                            <FormatNumber
                                nb={award.result}
                                format={
                                    award.title === 'Top Pnl Position' ? 'percentage' : 'currency'
                                }
                                className={
                                    award.result >= 0
                                        ? 'text-green font-bold'
                                        : 'text-red font-bold'
                                }
                                isDecimalDimmed={false}
                            />
                        ) : (
                            '-'
                        )}
                    </div>
                    <p className="opacity-75">
                        {rewards['biggest liquidation'].trader
                            ? getAbbrevWalletAddress(rewards['biggest liquidation'].trader)
                            : 'Unknown'}
                    </p>

                    <div className="flex flex-row gap-2 items-center justify-center bg-[#1B212A] border rounded-lg p-2 px-3 sm:px-8">
                        <Image
                            src={window.adrena.client.adxToken.image}
                            alt="adx logo"
                            className="w-3 h-3 sm:w-5 sm:h-5"
                        />
                        <FormatNumber
                            nb={10000}
                            className="text-sm sm:text-2xl font-boldy"
                            suffixClassName="text-sm sm:text-2xl font-boldy"
                            suffix=" ADX"
                        />
                    </div>
                    <p className="opacity-50">Prize</p>
                </div>
            ))}
        </div>
    );
}
