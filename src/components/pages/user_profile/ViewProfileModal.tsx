import { Pagination } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import arrowIcon from '@/../public/images/Icons/arrow-sm-45.svg';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getAbbrevWalletAddress, getAccountExplorer } from '@/utils';

import StatsDisplay from '../monitoring/Data/StatsDisplay';
import { getLeverageColorClass } from '../monitoring/UserProfileBlock';
import PositionBlockReadOnly from '../trading/Positions/PositionBlockReadOnly';
import PositionsHistory from '../trading/Positions/PositionsHistory';

export default function ViewProfileModal({
    profile,
    showFeesInPnl,
}: {
    profile: UserProfileExtended;
    showFeesInPnl: boolean;
}) {
    const wallet = useSelector((s) => s.walletState.wallet);

    const connected = !!wallet;

    const positions = usePositionsByAddress({
        walletAddress: profile.owner.toBase58(),
    });

    const [selectedTab, setSelectedTab] = useState('Overview');

    const leverageColorClass = getLeverageColorClass(
        profile.openingAverageLeverage,
    );

    const totalPnlColorClass =
        profile.totalPnlUsd < 0 ? 'text-red' : 'text-green';
    return (
        <div className="flex flex-col gap-5 p-3 sm:p-5 w-full">
            <div>
                <h2 className="capitalize font-boldy">{profile.nickname}</h2>
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

            <TabSelect
                tabs={[
                    { title: 'Overview' },
                    { title: 'Active Positions' },
                    { title: 'Positions History' },
                ]}
                selected={selectedTab}
                titleClassName="text-xs sm:text-sm"
                onClick={(title) => setSelectedTab(title)}
            />
            {selectedTab === 'Overview' ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <NumberDisplay
                            title="Total Open Volume"
                            nb={profile.totalTradeVolumeUsd}
                            format="currency"
                            className="bg-[#040D14] sm:min-w-[200px]"
                        />
                        <NumberDisplay
                            title="Total PnL"
                            nb={profile.totalPnlUsd}
                            format="currency"
                            className={'bg-[#040D14] sm:min-w-[200px]'}
                            bodyClassName={totalPnlColorClass}
                            isDecimalDimmed={false}
                        />
                        <NumberDisplay
                            title="Opening Average Leverage"
                            nb={profile.openingAverageLeverage}
                            format="number"
                            suffix=" x"
                            isDecimalDimmed={false}
                            className="bg-[#040D14] sm:min-w-[200px]"
                            bodyClassName={leverageColorClass}
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
                            isDecimalDimmed={false}
                        />
                        <NumberDisplay
                            title="Total fees paid"
                            nb={profile.totalFeesPaidUsd}
                            format="currency"
                            className="bg-[#040D14] sm:min-w-[200px]"
                            bodyClassName="text-red"
                            isDecimalDimmed={false}
                        />
                    </div>
                    <StatsDisplay
                        title="Long Positions"
                        stats={[
                            {
                                name: 'Total trades',
                                value: profile.longStats.openedPositionCount,
                                format: 'number',
                                precision: 0,
                            },
                            {
                                name: 'Liquidation Count',
                                value: profile.longStats.liquidatedPositionCount,
                                format: 'number',
                            },
                            {
                                name: 'Opening Average Leverage',
                                value: profile.longStats.openingAverageLeverage,
                                format: 'number',
                                suffix: ' x',
                                bodyClassName: getLeverageColorClass(
                                    profile.longStats.openingAverageLeverage,
                                ),
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Profits',
                                value: profile.longStats.profitsUsd,
                                format: 'currency',
                                bodyClassName: 'text-green',
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Fees Paid',
                                value: profile.longStats.feePaidUsd,
                                format: 'currency',
                                precision: 2,
                                bodyClassName: 'text-red',
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Losses',
                                value: profile.longStats.lossesUsd,
                                format: 'currency',
                                bodyClassName: 'text-red',
                                isDecimalDimmed: false,
                            },
                        ]}
                        isLive
                    />

                    <StatsDisplay
                        title="Short Positions"
                        stats={[
                            {
                                name: 'Total trades',
                                value: profile.shortStats.openedPositionCount,
                                format: 'number',
                                precision: 0,
                            },
                            {
                                name: 'Liquidation Count',
                                value: profile.shortStats.liquidatedPositionCount,
                                format: 'number',
                            },
                            {
                                name: 'Opening Average Leverage',
                                value: profile.shortStats.openingAverageLeverage,
                                format: 'number',
                                suffix: ' x',
                                bodyClassName: getLeverageColorClass(
                                    profile.shortStats.openingAverageLeverage,
                                ),
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Profits',
                                value: profile.shortStats.profitsUsd,
                                format: 'currency',
                                precision: profile.shortStats.profitsUsd > 1000 ? 0 : 2,
                                bodyClassName: 'text-green',
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Fees Paid',
                                value: profile.shortStats.feePaidUsd,
                                format: 'currency',
                                precision: profile.shortStats.feePaidUsd > 1000 ? 0 : 2,
                                bodyClassName: 'text-red',
                                isDecimalDimmed: false,
                            },
                            {
                                name: 'Total Losses',
                                value: profile.shortStats.lossesUsd,
                                format: 'currency',
                                precision: profile.shortStats.lossesUsd > 1000 ? 0 : 2,
                                bodyClassName: 'text-red',
                                isDecimalDimmed: false,
                            },
                        ]}
                        isLive
                    />
                </>
            ) : null}

            {selectedTab === 'Active Positions' ? (
                <div className="flex flex-wrap justify-between gap-2">
                    {positions !== null && positions.length ? (
                        <div className="flex flex-col w-full gap-2">
                            {positions.map((position) => (
                                <PositionBlockReadOnly
                                    key={position.pubkey.toBase58()}
                                    position={position}
                                    showFeesInPnl={showFeesInPnl}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center w-full py-4 opacity-50">
                            No matches 📭
                        </div>
                    )}
                </div>
            ) : null}

            {selectedTab === 'Positions History' ? (
                <PositionsHistory
                    connected={connected}
                    walletAddress={profile.owner.toBase58()}
                    showShareButton={false}
                    showFeesInPnl={showFeesInPnl}
                />
            ) : null}
        </div>
    );
}
