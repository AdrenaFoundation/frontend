import { useEffect, useState } from 'react';

import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Loader from '@/components/Loader/Loader';
import ActivityCalendar from '@/components/pages/monitoring/ActivityCalendar';
import UserRelatedAdrenaAccounts from '@/components/pages/my_dashboard/UserRelatedAdrenaAccounts';
import OwnerBlock from '@/components/pages/user_profile/OwnerBlock';
import ProfileCreation from '@/components/pages/user_profile/ProfileCreation';
import StakingStats from '@/components/pages/user_profile/StakingStats';
import TradingStats from '@/components/pages/user_profile/TradingStats';
import VestStats from '@/components/pages/user_profile/Veststats';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import usePositions from '@/hooks/usePositions';
import usePositionStats from '@/hooks/usePositionStats';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { selectWalletAddress } from '@/selectors/wallet';
import { useSelector } from '@/store/store';
import { PageProps, VestExtended } from '@/types';
import { PublicKey } from '@solana/web3.js';

export default function MyDashboard({
  connected,
  userProfile,
  triggerUserProfileReload,
  readonly,
  wallet,
}: PageProps & {
  readonly?: boolean;
}) {
  const [nickname, setNickname] = useState<string | null>(null);
  const { stakingAccounts } = useWalletStakingAccounts();
  const walletAddress = useSelector(selectWalletAddress);

  const positions = usePositions(walletAddress);

  const [userVest, setUserVest] = useState<VestExtended | null>(null);

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
    getUserVesting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

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
      await window.adrena.client.initUserProfile({
        nickname: trimmedNickname,
        notification,
      });

      triggerUserProfileReload();
    } catch (error) {
      console.log('error', error);
    }
  };

  const getUserVesting = async () => {
    try {
      if (!walletAddress) throw new Error('no wallet');

      const vest = await window.adrena.client.loadUserVest(new PublicKey(walletAddress));

      if (!vest) throw new Error('No vest');

      setUserVest(vest);
    } catch (error) {
      console.log('failed to load vesting', error);
    }
  };

  if (userProfile === null) {
    return (
      <div className="flex flex-col max-w-[55em] gap-4 p-4 w-full h-full self-center">
        <div className="flex h-full bg-main w-full border items-center justify-center rounded-xl z-10">
          <WalletConnection connected={connected} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col max-w-[55em] pl-4 pr-4 pb-4 w-full min-h-full self-center pt-[6em]">
        <div className="bg-main z-20 border w-full min-h-full gap-4 flex flex-col rounded-xl">
          {userProfile === false ? (
            <div className="flex w-full justify-center items-center">
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
              />

              <TradingStats
                userProfile={userProfile}
                livePositionsNb={positions === null ? null : positions.length}
                className="gap-y-4"
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

              <StakingStats
                stakingAccounts={stakingAccounts}
                className="gap-y-4"
              />

              {userVest && (
                <>
                  <div className="h-[1px] w-full bg-bcolor" />

                  <VestStats vest={userVest} getUserVesting={getUserVesting} />
                </>
              )}

              <div className="h-[1px] w-full bg-bcolor" />

              <UserRelatedAdrenaAccounts
                className="h-auto w-full flex mt-auto"
                userProfile={userProfile}
                userVest={userVest}
                positions={positions}
              />
            </>
          )}
        </div>
      </div>
    </>
  );
}
