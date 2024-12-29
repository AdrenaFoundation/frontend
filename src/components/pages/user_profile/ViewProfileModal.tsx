import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import { UserProfileExtended } from '@/types';

import { getLeverageColorClass } from '../monitoring/UserProfileBlock';
import PositionBlock from '../trading/Positions/PositionBlock';
import PositionsHistory from '../trading/Positions/PositionsHistory';
import OwnerBlock from './OwnerBlock';

export default function ViewProfileModal({
    profile,
    showFeesInPnl,
}: {
    profile: UserProfileExtended;
    showFeesInPnl: boolean;
}) {
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
        <div className="flex flex-col gap-5 pl-3 pr-3 pb-3 pt-[6em] w-full">
            <OwnerBlock
                userProfile={profile}
                triggerUserProfileReload={() => {
                    //
                }}
                canUpdateNickname={false}
                className="flex w-full w-min-[30em]"
                walletPubkey={profile.owner}
            />

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
                            title="Open Volume"
                            nb={profile.totalTradeVolumeUsd}
                            format="currency"
                            className='border-0 min-w-[9em] p-1'
                            headerClassName='pb-2'
                            titleClassName='text-[0.7em] sm:text-[0.7em]'
                            bodyClassName='text-base'
                            isDecimalDimmed={false}
                        />

                        <NumberDisplay
                            title="PnL"
                            nb={profile.totalPnlUsd}
                            format="currency"
                            className='border-0 min-w-[9em] p-1'
                            headerClassName='pb-2'
                            titleClassName='text-[0.7em] sm:text-[0.7em]'
                            bodyClassName={twMerge(
                                'text-base',
                                totalPnlColorClass,
                            )}
                            isDecimalDimmed={false}
                        />

                        <NumberDisplay
                            title="Total fees paid"
                            nb={profile.totalFeesPaidUsd}
                            format="currency"
                            className='border-0 min-w-[9em] p-1'
                            headerClassName='pb-2'
                            titleClassName='text-[0.7em] sm:text-[0.7em]'
                            bodyClassName="text-red text-base"
                            isDecimalDimmed={false}
                        />

                        <NumberDisplay
                            title="Opening Average Leverage"
                            nb={profile.openingAverageLeverage}
                            format="number"
                            suffix=" x"
                            isDecimalDimmed={false}
                            className='border-0 min-w-[9em] p-1'
                            headerClassName='pb-2'
                            titleClassName='text-[0.7em] sm:text-[0.7em]'
                            bodyClassName={twMerge('text-base', leverageColorClass)}
                        />

                        <NumberDisplay
                            title="Long/Short Ratio"
                            nb={
                                (profile.longStats.openedPositionCount /
                                    (profile.longStats.openedPositionCount +
                                        profile.shortStats.openedPositionCount)) * 100
                            }
                            format="percentage"
                            className='border-0 min-w-[9em] p-1'
                            headerClassName='pb-2'
                            titleClassName='text-[0.7em] sm:text-[0.7em]'
                            bodyClassName={twMerge('text-base', leverageColorClass)}
                            isDecimalDimmed={false}
                        />
                    </div>
                </>
            ) : null}

            {selectedTab === 'Active Positions' ? (
                <div className="flex flex-wrap justify-between gap-2">
                    {positions !== null && positions.length ? (
                        <div className="flex flex-col w-full gap-2">
                            {positions.map((position) => (
                                <PositionBlock
                                    key={position.pubkey.toBase58()}
                                    position={position}
                                    showFeesInPnl={showFeesInPnl}
                                    readOnly={true}
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
                    connected={true}
                    walletAddress={profile.owner.toBase58()}
                    showShareButton={false}
                    showFeesInPnl={showFeesInPnl}
                />
            ) : null}
        </div>
    );
}
