import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import arrowIcon from '@/../public/images/Icons/arrow-sm-45.svg';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress, getAccountExplorer } from '@/utils';

import StatsDisplay from '../monitoring/Data/StatsDisplay';

export default function ViewProfileModal({
    profile,
}: {
    profile: UserProfileExtended;
}) {
    if (!profile) return null;

    return (
        <div className="flex flex-col gap-5 p-3 sm:p-5 w-full">
            <div>
                <h3 className="capitalize font-boldy">{profile.nickname}</h3>
                <Link
                    href={getAccountExplorer(profile.pubkey)}
                    target="_blank"
                    className="flex flex-row gap-1 items-center opacity-50 hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                >
                    <p className="font-mono">
                        {getAbbrevWalletAddress(profile.pubkey.toBase58())}
                    </p>

                    <Image src={arrowIcon} alt="arrow" width={5} height={5} />
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <NumberDisplay
                    title="Total Trade Volume"
                    nb={profile.totalTradeVolumeUsd}
                    format="currency"
                    className="bg-[#040D14] sm:min-w-[200px]"
                />
                <NumberDisplay
                    title="Total Trade Volume"
                    nb={profile.totalTradeVolumeUsd}
                    format="currency"
                    className="bg-[#040D14] sm:min-w-[200px]"
                />
                <NumberDisplay
                    title="total fees paid"
                    nb={profile.totalFeesPaidUsd}
                    format="currency"
                    className="bg-[#040D14] sm:min-w-[200px]"
                />
                <NumberDisplay
                    title="Total PnL"
                    nb={profile.totalPnlUsd}
                    format="currency"
                    className={'bg-[#040D14] sm:min-w-[200px]'}
                />
                <NumberDisplay
                    title="Opening Average Leverage"
                    nb={profile.openingAverageLeverage}
                    format="number"
                    suffix=" x"
                    isDecimalDimmed={false}
                    className="bg-[#040D14] sm:min-w-[200px]"
                />
                <NumberDisplay
                    title="Long/Short Ratio"
                    nb={
                        (profile.longStats.openedPositionCount /
                            (profile.longStats.openedPositionCount +
                                profile.shortStats.openedPositionCount)) *
                        100
                    }
                    format="percentage"
                    className="bg-[#040D14] sm:min-w-[200px]"
                />
            </div>
            <StatsDisplay
                title="Long Positions"
                stats={[
                    {
                        name: 'Opened  Count',
                        value: profile.longStats.openedPositionCount,
                        format: 'number',
                        precision: 0,
                    },
                    {
                        name: 'Total Fees Paid',
                        value: profile.longStats.feePaidUsd,
                        format: 'currency',
                        precision: 2,
                    },
                    {
                        name: 'Total Profits',
                        value: profile.longStats.profitsUsd,
                        format: 'currency',
                    },
                    {
                        name: 'Total Losses',
                        value: profile.longStats.lossesUsd,
                        format: 'currency',
                    },
                    {
                        name: 'Opening Average Leverage',
                        value: profile.longStats.openingAverageLeverage,
                        format: 'number',
                        suffix: ' x',
                    },
                    {
                        name: 'liquidated Count',
                        value: profile.longStats.liquidatedPositionCount,
                        format: 'number',
                    },
                ]}
                isLive
            />

            <StatsDisplay
                title="Short Positions"
                stats={[
                    {
                        name: 'Opened  Count',
                        value: profile.shortStats.openedPositionCount,
                        format: 'number',
                        precision: 0,
                    },
                    {
                        name: 'Total Fees Paid',
                        value: profile.shortStats.feePaidUsd,
                        format: 'currency',
                        precision: 2,
                    },
                    {
                        name: 'Total Profits',
                        value: profile.shortStats.profitsUsd,
                        format: 'currency',
                    },
                    {
                        name: 'Total Losses',
                        value: profile.shortStats.lossesUsd,
                        format: 'currency',
                    },
                    {
                        name: 'Opening Average Leverage',
                        value: profile.shortStats.openingAverageLeverage,
                        format: 'number',
                        suffix: ' x',
                    },
                    {
                        name: 'liquidated Count',
                        value: profile.shortStats.liquidatedPositionCount,
                        format: 'number',
                    },
                ]}
                isLive
            />
        </div>
    );
}
