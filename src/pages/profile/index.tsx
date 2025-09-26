import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import LoaderWrapper from '@/components/Loader/LoaderWrapper';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import FavAchievements from '@/components/pages/profile/FavAchievements';
import OwnerBlock from '@/components/pages/profile/OwnerBlock';
import ProfileCreation from '@/components/pages/profile/ProfileCreation';
import RankingStats from '@/components/pages/profile/RankingStats';
import StakingStats from '@/components/pages/profile/StakingStats';
import TradingStats from '@/components/pages/profile/TradingStats';
import UserRelatedAdrenaAccounts from '@/components/pages/profile/UserRelatedAdrenaAccounts';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { WALLPAPERS } from '@/constant';
import useFavorite from '@/hooks/useFavorite';
import usePositions from '@/hooks/usePositions';
import usePositionStats from '@/hooks/usePositionStats';
import useTraderInfo from '@/hooks/useTraderInfo';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { selectWalletAddress } from '@/selectors/wallet';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';

export default function Profile({
  connected,
  userProfile,
  triggerUserProfileReload,
  readonly,
  wallet,
  userVest,
}: PageProps & {
  readonly?: boolean;
}) {
  const [nickname, setNickname] = useState<string | null>(null);
  const walletAddress = useSelector(selectWalletAddress);
  const { stakingAccounts } = useWalletStakingAccounts(walletAddress);
  const positions = usePositions(walletAddress);
  const {
    traderInfo,
    expanseRanking,
    factionRanking,
    awakeningRanking,
    isInitialLoad: isTraderInfoInitialLoad,
  } = useTraderInfo({
    walletAddress,
  });

  const [isUpdatingMetadata, setIsUpdatingMetadata] = useState<boolean>(false);
  const [activeUpdateTab, setActiveUpdateTab] = useState<
    'profilePicture' | 'wallpaper' | 'title' | 'achievements'
  >('profilePicture');

  const {
    favoriteAchievements,
    fetchFavoriteAchievements,
    updateFavoriteAchievements,
    createFavoriteAchievements,
    isFavoriteLoading,
  } = useFavorite();

  const [selectedRange, setSelectedRange] = useState('All time');

  const { activityCalendarData, bubbleBy, setBubbleBy, isInitialLoad } =
    usePositionStats(true);

  // When the profile page loads, update the profile so it's up to date with latests
  // user actions
  useEffect(() => {
    triggerUserProfileReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (walletAddress) {
      fetchFavoriteAchievements(walletAddress);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const initUserProfile = async () => {
    const trimmedNickname = (nickname ?? '').trim();

    const notification =
      MultiStepNotification.newForRegularTransaction(
        'Initialize Profile',
      ).fire();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
      return notification.currentStepErrored(
        'Nickname must be between 3 to 24 characters long',
      );
    }

    try {
      if (!wallet)
        return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.initUserProfile({
        nickname: trimmedNickname,
        notification,
        profilePicture: 0,
        wallpaper: 0,
        title: 0,
        referrerProfile: null,
      });

      triggerUserProfileReload();
    } catch (error) {
      console.log('error', error);
    }
  };

  if (userProfile === null) {
    return (
      <div className="flex flex-col max-w-[65em] gap-4 p-4 w-full h-full self-center">
        <div className="flex h-full bg-main w-full border items-center justify-center rounded-md z-10">
          <WalletConnection connected={connected} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-100 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: userProfile
            ? `url(${WALLPAPERS[userProfile.wallpaper]})`
            : `url(${WALLPAPERS[0]})`,
        }}
      />

      <div className="flex flex-col pl-4 pr-4 pb-4 w-full min-h-full self-center pt-3">
        <div
          className={twMerge(
            'z-20 w-full flex flex-col rounded-md backdrop-blur-md border-2 border-white/10 shadow-lg',
            userProfile === false ? 'overflow-hidden' : 'min-h-full',
          )}
        >
          {userProfile === false ? (
            <div className="flex w-full justify-center items-center bg-main">
              <ProfileCreation
                initUserProfile={initUserProfile}
                nickname={nickname}
                setNickname={setNickname}
              />
            </div>
          ) : (
            <>
              <div className="relative">
                <OwnerBlock
                  userProfile={userProfile}
                  triggerUserProfileReload={triggerUserProfileReload}
                  canUpdateNickname={!readonly}
                  className="flex w-full w-min-[30em]"
                  walletPubkey={wallet?.publicKey}
                  favoriteAchievements={favoriteAchievements}
                  updateFavoriteAchievements={updateFavoriteAchievements}
                  createFavoriteAchievements={createFavoriteAchievements}
                  isUpdatingMetadata={isUpdatingMetadata}
                  setIsUpdatingMetadata={setIsUpdatingMetadata}
                  activeUpdateTab={activeUpdateTab}
                  setActiveUpdateTab={setActiveUpdateTab}
                />
                <div className="flex items-center justify-center md:absolute md:bottom-0 md:right-[2rem] lg:right-[6rem] bg-main md:bg-transparent">
                  <FavAchievements
                    favoriteAchievements={favoriteAchievements}
                    isFavoriteLoading={isFavoriteLoading}
                  />
                </div>
                <div className="absolute bottom-0 bg-gradient-to-t from-main to-transparent w-full h-[2em]" />
              </div>
              <div className="bg-main flex flex-col rounded-bl-xl rounded-br-xl border-t">
                <LoaderWrapper
                  isLoading={isTraderInfoInitialLoad}
                  height="9.875rem"
                  loaderClassName="m-3"
                >
                  {traderInfo !== null ? (
                    <TradingStats
                      traderInfo={traderInfo}
                      livePositionsNb={
                        positions === null ? null : positions.length
                      }
                      data={activityCalendarData}
                    />
                  ) : null}
                </LoaderWrapper>

                <div className="h-[1px] w-full bg-bcolor mb-2" />

                <RankingStats
                  expanseRanking={expanseRanking}
                  factionRanking={factionRanking}
                  awakeningRanking={awakeningRanking}
                  userProfile={userProfile}
                  className="gap-y-4 pt-2 pb-2"
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

                {stakingAccounts ? (
                  <StakingStats
                    stakingAccounts={stakingAccounts}
                    walletAddress={walletAddress}
                  />
                ) : null}

                <div className="h-[1px] w-full bg-bcolor" />
                <UserRelatedAdrenaAccounts
                  className="h-auto w-full flex mt-auto pb-4"
                  userProfile={userProfile}
                  userVest={userVest ? userVest : null}
                  positions={positions}
                  stakingAccounts={stakingAccounts}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
