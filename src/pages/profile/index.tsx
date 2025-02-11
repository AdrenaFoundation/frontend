import { kv } from '@vercel/kv';
import { useEffect, useState } from 'react';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Loader from '@/components/Loader/Loader';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import OwnerBlock from '@/components/pages/profile/OwnerBlock';
import ProfileCreation from '@/components/pages/profile/ProfileCreation';
import StakingStats from '@/components/pages/profile/StakingStats';
import TradingStats from '@/components/pages/profile/TradingStats';
import UserRelatedAdrenaAccounts from '@/components/pages/profile/UserRelatedAdrenaAccounts';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { WALLPAPER } from '@/constant';
import usePositions from '@/hooks/usePositions';
import usePositionStats from '@/hooks/usePositionStats';
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
  showFeesInPnl,
}: PageProps & {
  readonly?: boolean;
}) {
  const [nickname, setNickname] = useState<string | null>(null);
  const walletAddress = useSelector(selectWalletAddress);
  const { stakingAccounts } = useWalletStakingAccounts(walletAddress);
  const [redisProfile, setRedisProfile] = useState<Record<string, string> | null>(null);
  const positions = usePositions(walletAddress);

  const [duplicatedRedis, setDuplicatedRedis] = useState<boolean>(false);
  const {
    activityCalendarData,
    bubbleBy,
    setBubbleBy,
    loading,
    setStartDate,
    setEndDate,
  } = usePositionStats(true);

  // When the profile page loads, update the profile so it's up to date with latests
  // user actions
  useEffect(() => {
    triggerUserProfileReload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchRedisProfile = async () => {
      if (userProfile === null || userProfile === false || userProfile.nickname === '') return;

      try {
        if (redisProfile !== null &&
          redisProfile.nickname === userProfile.nickname &&
          redisProfile.owner === userProfile.owner.toBase58()) return;

        const newRedisProfile = {
          nickname: userProfile.nickname,
          owner: await kv.get(userProfile.nickname),
        };

        if (typeof newRedisProfile.owner === 'undefined' || newRedisProfile.owner === null || newRedisProfile.owner === '') {
          await kv.set(newRedisProfile.nickname, userProfile.owner.toBase58());
          setRedisProfile({
            nickname: newRedisProfile.nickname,
            owner: userProfile.owner.toBase58(),
          });
          return;
        }

        if (newRedisProfile.owner !== userProfile.owner.toBase58()) {
          setRedisProfile({
            nickname: newRedisProfile.nickname,
            owner: userProfile.owner.toBase58(),
          });
          setDuplicatedRedis(true);
          return;
        }

        if (setDuplicatedRedis) setDuplicatedRedis(false);
        setRedisProfile(newRedisProfile as Record<string, string>);
      } catch (error) {
        console.log('error fetching redis profile', error);
      }
    };

    fetchRedisProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile ? userProfile.nickname : '']);

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
      if (!wallet) return notification.currentStepErrored('Wallet not connected');

      await window.adrena.client.initUserProfile({
        nickname: trimmedNickname,
        notification,
        profilePicture: 0,
        wallpaper: 0,
        title: 0,
      });

      triggerUserProfileReload();
    } catch (error) {
      console.log('error', error);
    }
  };

  if (userProfile === null) {
    return (
      <div className="flex flex-col max-w-[65em] gap-4 p-4 w-full h-full self-center">
        <div className="flex h-full bg-main w-full border items-center justify-center rounded-xl z-10">
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
          backgroundImage: userProfile ? `url(${WALLPAPER[userProfile.wallpaper]})` : "url('/images/wallpaper-1.jpg')",
        }}
      />

      <div className="flex flex-col max-w-[65em] pl-4 pr-4 pb-4 w-full min-h-full self-center pt-[6em]">
        <div className="z-20 w-full min-h-full flex flex-col rounded-xl">
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
              <OwnerBlock
                userProfile={userProfile}
                triggerUserProfileReload={triggerUserProfileReload}
                canUpdateNickname={!readonly}
                className="flex w-full w-min-[30em]"
                walletPubkey={wallet?.publicKey}
                redisProfile={redisProfile ?? {}}
                setRedisProfile={setRedisProfile}
                duplicatedRedis={duplicatedRedis}
              />

              <div className='bg-main flex flex-col gap-2 pt-2 rounded-bl-xl rounded-br-xl'>
                <TradingStats
                  userProfile={userProfile}
                  livePositionsNb={positions === null ? null : positions.length}
                  className="gap-y-4 pt-4 pb-4"
                  showFeesInPnl={showFeesInPnl}
                />

                <StakingStats
                  stakingAccounts={stakingAccounts}
                  className="gap-y-4 pb-4"
                />

                <div className="h-[1px] w-full bg-bcolor" />

                {!loading && connected ? (
                  <ActivityCalendar
                    data={activityCalendarData}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    bubbleBy={bubbleBy}
                    setBubbleBy={setBubbleBy}
                    wrapperClassName="bg-transparent border-transparent"
                    isUserActivity
                  />
                ) : (
                  <Loader />
                )}

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
