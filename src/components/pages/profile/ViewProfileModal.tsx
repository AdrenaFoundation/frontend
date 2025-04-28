import { useEffect, useState } from 'react';

import crossIcon from '@/../public/images/cross.svg';
import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import useFavorite from '@/hooks/useFavorite';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import useTraderInfo from '@/hooks/useTraderInfo';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { UserProfileExtended } from '@/types';

import PositionBlock from '../trading/Positions/PositionBlock';
import PositionsHistory from '../trading/Positions/PositionsHistory';
import FavAchievements from './FavAchievements';
import OwnerBlock from './OwnerBlock';
import RankingStats from './RankingStats';
import StakingStats from './StakingStats';
import TradingStats from './TradingStats';

export default function ViewProfileModal({
    profile,
    close,
}: {
    profile: UserProfileExtended;
    close: () => void;
}) {
    const walletAddress = profile.owner.toBase58();
    const positions = usePositionsByAddress({
        walletAddress,
    });
    const { stakingAccounts } = useWalletStakingAccounts(walletAddress);
    const { traderInfo, expanseRanking, awakeningRanking } = useTraderInfo({
        walletAddress,
    });
    const { favoriteAchievements, fetchFavoriteAchievements, isFavoriteLoading } = useFavorite();

    const [selectedTab, setSelectedTab] = useState('Active Positions');

    useEffect(() => {
        fetchFavoriteAchievements(walletAddress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [walletAddress]);

    return (
        <div className="p-3 w-full">
            <Button
                variant="text"
                className="hidden sm:block absolute right-6 top-6 w-[20px] h-[20px] p-[5px] border border-txtfade cursor-pointer z-20"
                onClick={() => {
                    close();
                }}
                leftIcon={crossIcon}
                size="sm"
            />

            <OwnerBlock
                userProfile={profile}
                triggerUserProfileReload={() => {
                    //
                }}
                canUpdateNickname={false}
                className="flex w-full w-min-[30em] border "
                walletPubkey={profile.owner}
                readonly={true}
                favoriteAchievements={null}
            />

            <div className="bg-main flex flex-col gap-2 rounded-bl-xl rounded-br-xl border border-t-transparent">
                <FavAchievements
                    userProfile={profile}
                    favoriteAchievements={favoriteAchievements}
                    isFavoriteLoading={isFavoriteLoading}
                />

                <TradingStats
                    traderInfo={traderInfo}
                    livePositionsNb={positions === null ? null : positions.length}
                    className="gap-y-4 pt-4 pb-2"
                />

                <StakingStats
                    stakingAccounts={stakingAccounts}
                    className="gap-y-4 pb-2"
                />

                <div className="h-[1px] w-full bg-bcolor" />

                <RankingStats
                    expanseRanking={expanseRanking}
                    awakeningRanking={awakeningRanking}
                    className="gap-y-4 pt-2 pb-2"
                    userProfile={profile}
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
                                                readOnly={true}
                                                setTokenB={() => { }}
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
                                className="pb-4"
                                connected={true}
                                walletAddress={profile.owner.toBase58()}
                                showShareButton={false}
                                exportButtonPosition="bottom"
                            />
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
