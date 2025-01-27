import { useState } from 'react';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { UserProfileExtended } from '@/types';

import PositionBlock from '../trading/Positions/PositionBlock';
import PositionsHistory from '../trading/Positions/PositionsHistory';
import OwnerBlock from './OwnerBlock';
import StakingStats from './StakingStats';
import TradingStats from './TradingStats';

export default function ViewProfileModal({
    profile,
    showFeesInPnl,
}: {
    profile: UserProfileExtended;
    showFeesInPnl: boolean;
}) {
    const walletAddress = profile.owner.toBase58();
    const positions = usePositionsByAddress({
        walletAddress,
    });
    const { stakingAccounts } = useWalletStakingAccounts(walletAddress);

    const [selectedTab, setSelectedTab] = useState('Active Positions');

    return (
        <div className="p-3 w-full">
            <OwnerBlock
                userProfile={profile}
                triggerUserProfileReload={() => {
                    //
                }}
                canUpdateNickname={false}
                className="flex w-full w-min-[30em] border "
                walletPubkey={profile.owner}
                redisProfile={null}
                setRedisProfile={() => { }}
                duplicatedRedis={false}
                readonly={true}
            />

            <div className="bg-main flex flex-col gap-2 rounded-bl-xl rounded-br-xl border border-t-transparent">
                <TradingStats
                    userProfile={profile}
                    livePositionsNb={positions === null ? null : positions.length}
                    className="gap-y-4 pt-4 pb-4"
                />
                <StakingStats
                    stakingAccounts={stakingAccounts}
                    className="gap-y-4 pb-4"
                />

                <div className="flex flex-col gap-3 p-4">
                    <TabSelect
                        tabs={[
                            { title: 'Active Positions' },
                            { title: 'Positions History' },
                        ]}
                        selected={selectedTab}
                        titleClassName="text-xs sm:text-base"
                        onClick={(title) => setSelectedTab(title)}
                    />
                    <div className="flex flex-col gap-3">
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
                </div>
            </div>
        </div>
    );
}
