import { useEffect, useState } from 'react';

import crossIcon from '@/../public/images/cross.svg';
import Button from '@/components/common/Button/Button';
import LoaderWrapper from '@/components/Loader/LoaderWrapper';
import { WALLPAPERS } from '@/constant';
import useFavorite from '@/hooks/useFavorite';
import usePositionsByAddress from '@/hooks/usePositionsByAddress';
import usePositionStats from '@/hooks/usePositionStats';
import useTraderInfo from '@/hooks/useTraderInfo';
import { UserProfileExtended } from '@/types';

import ActivityCalendar from '../monitoring/ActivityCalendar';
import PositionBlock from '../trading/Positions/PositionBlock';
import FavAchievements from './FavAchievements';
import OwnerBlock from './OwnerBlock';
import RankingStats from './RankingStats';
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
  // const { stakingAccounts } = useWalletStakingAccounts(walletAddress);
  const [selectedRange, setSelectedRange] = useState('All time');

  const { activityCalendarData, isInitialLoad, bubbleBy, setBubbleBy } =
    usePositionStats(true, walletAddress);
  const {
    traderInfo,
    expanseRanking,
    factionRanking,
    awakeningRanking,
    isInitialLoad: isTraderInfoInitialLoad,
  } = useTraderInfo({
    walletAddress,
  });
  const { favoriteAchievements, fetchFavoriteAchievements, isFavoriteLoading } =
    useFavorite();

  useEffect(() => {
    fetchFavoriteAchievements(walletAddress);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return (
    <div
      className="p-3 w-full  bg-cover bg-center bg-no-repeat "
      style={{
        backgroundImage: profile
          ? `url(${WALLPAPERS[profile.wallpaper]})`
          : `url(${WALLPAPERS[0]})`,
      }}
      key={profile.owner.toBase58()}
    >
      <Button
        variant="text"
        className="hidden sm:block absolute right-6 top-6 w-[20px] h-[20px] p-[5px] border border-txtfade cursor-pointer z-20"
        onClick={() => {
          close();
        }}
        leftIcon={crossIcon}
        size="sm"
      />
      <div className="relative border-b">
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
          walletAddress={walletAddress}
        />

        <div className="flex items-center justify-center md:absolute md:bottom-0 md:right-[2rem] lg:right-[6rem] bg-main md:bg-transparent">
          <FavAchievements
            favoriteAchievements={favoriteAchievements}
            isFavoriteLoading={isFavoriteLoading}
          />
        </div>
        <div className="absolute bottom-0 bg-gradient-to-t from-main to-transparent w-full h-[2em]" />
      </div>

      <div className="bg-main flex flex-col rounded-bl-xl rounded-br-xl border border-t-0">
        <LoaderWrapper
          isLoading={isTraderInfoInitialLoad}
          height="9.875rem"
          loaderClassName="m-3"
        >
          {traderInfo !== null ? (
            <TradingStats
              traderInfo={traderInfo}
              livePositionsNb={positions === null ? null : positions.length}
              className="gap-y-4 pt-4 pb-2"
            />
          ) : null}
        </LoaderWrapper>

        {traderInfo !== null ? (
          <div className="h-[1px] w-full bg-bcolor" />
        ) : null}

        <RankingStats
          expanseRanking={expanseRanking}
          factionRanking={factionRanking}
          awakeningRanking={awakeningRanking}
          className="gap-y-4 pt-2 pb-2"
          userProfile={profile}
          isLoading={isTraderInfoInitialLoad}
        />

        <div className="h-[1px] w-full bg-bcolor mt-4" />

        <ActivityCalendar
          data={activityCalendarData}
          selectedRange={selectedRange}
          setSelectedRange={setSelectedRange}
          bubbleBy={bubbleBy}
          setBubbleBy={setBubbleBy}
          wrapperClassName="bg-transparent border-transparent"
          walletAddress={walletAddress}
          isLoading={isInitialLoad}
          hasData={!!traderInfo}
        />

        {/* 
        <StakingStats
          stakingAccounts={stakingAccounts}
          className="gap-y-4 pb-2"
          walletAddress={walletAddress}
        /> */}

        <div className="h-[1px] w-full bg-bcolor" />

        <div className="flex flex-col gap-3 p-4">
          <div className="flex flex-col gap-3">
            <h4 className="capitalize font-semibold">Active Positions</h4>
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
                  No Active Positions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
