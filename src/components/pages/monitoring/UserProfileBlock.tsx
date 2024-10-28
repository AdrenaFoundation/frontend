import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

import OnchainAccountInfo from './OnchainAccountInfo';

interface UserProfileBlockProps {
    profile: UserProfileExtended & { rank: number };
    className?: string;
}

function getLeverageColorClass(leverage: number): string {
    if (leverage < 10) return 'text-white';
    if (leverage < 25) return 'text-green';
    if (leverage < 50) return 'text-orange';
    return 'text-red';
}

export default function UserProfileBlock({ profile, className }: UserProfileBlockProps) {
    const leverageColorClass = getLeverageColorClass(profile.openingAverageLeverage);

    const longShortRatio = profile.longStats.openedPositionCount / (profile.longStats.openedPositionCount + profile.shortStats.openedPositionCount) * 100;

    return (
        <div className={`w-full flex flex-col border rounded-lg bg-[#050D14] overflow-hidden mb-2 ${className}`}>
            <div className="flex flex-col md:flex-row justify-between items-center p-2 mx-2">

                <div className="h-full border-r border-gray-700 mx-2 hidden md:block"></div>

                <div className="flex flex-1 flex-col items-center md:items-start">
                    <div className="flex w-full font-mono text-xxs">
                        <span className="text-blue cursor-pointer hover:underline mr-1 text-lg">
                            {profile.nickname}
                        </span>
                    </div>
                    <OnchainAccountInfo
                        address={profile.pubkey}
                        shorten={true}
                        className="text-xxs"
                        iconClassName="w-2 h-2"
                    />
                </div>

                <div className="flex flex-1 flex-col items-center mt-2 md:mt-0">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Average Leverage
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={profile.openingAverageLeverage}
                            format="number"
                            className={`text-xs lowercase ${leverageColorClass}`}
                            suffix="x"
                            isDecimalDimmed={leverageColorClass === 'text-white'}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center mt-2 md:mt-0">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Total Fees Paid
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={profile.totalFeesPaidUsd}
                            format="currency"
                            className="text-gray-400 text-xs lowercase"
                            isDecimalDimmed={true}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center mt-2 md:mt-0">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Total Volume Traded
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={profile.totalTradeVolumeUsd}
                            format="currency"
                            className="text-gray-400 text-xs lowercase"
                            isDecimalDimmed={true}
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center mt-2 md:mt-0">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Long/Short Ratio
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={longShortRatio}
                            format="percentage"
                            className="text-gray-400 text-xs lowercase"
                            isDecimalDimmed={true}
                            suffix="%"
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col items-center mt-2 sm:mt-0">
                    <div className="flex w-full font-mono text-xxs text-txtfade justify-center items-center">
                        Total PnL
                    </div>
                    <div className="flex">
                        <FormatNumber
                            nb={profile.totalPnlUsd}
                            format="currency"
                            className={`text-gray-400 text-xs lowercase ${profile.totalPnlUsd > 0 ? 'text-green' : 'text-red'}`}
                            isDecimalDimmed={false}
                        />
                    </div>
                </div>

            </div>
        </div>
    );
}
