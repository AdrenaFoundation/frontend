import { BN } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import UserRelatedAdrenaAccounts from '@/components/pages/my_dashboard/UserRelatedAdrenaAccounts';
import FinalizeLockedStakeRedeem from '@/components/pages/stake/FinalizeLockedStakeRedeem';
import UpgradeLockedStake from '@/components/pages/stake/UpgradeLockedStake';
import OwnerBlock from '@/components/pages/user_profile/OwnerBlock';
import PositionsStats from '@/components/pages/user_profile/PositionsStats';
import ProfileCreation from '@/components/pages/user_profile/ProfileCreation';
import TradingStats from '@/components/pages/user_profile/TradingStats';
import VestStats from '@/components/pages/user_profile/Veststats';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  LockedStakeExtended,
  PageProps,
  VestExtended,
} from '@/types';
import {
  addNotification,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
} from '@/utils';

export default function MyDashboard({
  connected,
  positions,
  userProfile,
  triggerUserProfileReload,
  triggerWalletTokenBalancesReload,
  readonly,
}: PageProps & {
  readonly?: boolean;
}) {
  const [nickname, setNickname] = useState<string | null>(null);
  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();
  const wallet = useSelector((s) => s.walletState.wallet);
  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const [finalizeLockedStakeRedeem, setFinalizeLockedStakeRedeem] =
    useState<boolean>(false);
  const [updateLockedStake, setUpdateLockedStake] = useState<boolean>(false);
  const [lockedStake, setLockedStake] = useState<LockedStakeExtended | null>(
    null,
  );
  const [lockedStakes, setLockedStakes] = useState<
    LockedStakeExtended[] | null
  >(null);
  const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
  const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
  const [lockedStakedALP, setLockedStakedALP] = useState<number | null>(null);
  const [userVest, setUserVest] = useState<VestExtended | null>(null);

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

  useEffect(() => {
    if (!stakingAccounts) {
      return setLockedStakes(null);
    }

    const adxLockedStakes: LockedStakeExtended[] =
      getAdxLockedStakes(stakingAccounts) ?? [];

    const alpLockedStakes: LockedStakeExtended[] =
      getAlpLockedStakes(stakingAccounts) ?? [];

    const liquidStakedADX =
      typeof stakingAccounts.ADX?.liquidStake.amount !== 'undefined'
        ? nativeToUi(
          stakingAccounts.ADX.liquidStake.amount,
          window.adrena.client.adxToken.decimals,
        )
        : null;

    const lockedStakedADX = adxLockedStakes.reduce((acc, stake) => {
      return (
        acc + nativeToUi(stake.amount, window.adrena.client.adxToken.decimals)
      );
    }, 0);

    const lockedStakedALP = alpLockedStakes.reduce((acc, stake) => {
      return (
        acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals)
      );
    }, 0);

    setLockedStakes([...adxLockedStakes, ...alpLockedStakes]);
    setLiquidStakedADX(liquidStakedADX);
    setLockedStakedADX(lockedStakedADX);
    setLockedStakedALP(lockedStakedALP);
  }, [stakingAccounts]);

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
      const vest = await window.adrena.client.loadUserVest();

      if (!vest) throw new Error('No vest');

      setUserVest(vest);
    } catch (error) {
      console.log('failed to load vesting', error);
    }
  };

  if (userProfile === null) {
    return <div className="flex flex-col max-w-[55em] gap-4 p-4 w-full h-full self-center">
      <div className="flex h-full bg-main w-full border items-center justify-center rounded-xl z-10">
        <WalletConnection connected={connected} />
      </div>
    </div>;
  }

  return (
    <>
      <div className="flex flex-col max-w-[55em] p-4 w-full min-h-full self-center">
        <div className='bg-main z-20 border w-full min-h-full gap-4 flex flex-col'>
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
              />

              <TradingStats userProfile={userProfile} className='p-2' />
            </>
          )}

          {userVest && (
            <VestStats
              vest={userVest}
              getUserVesting={getUserVesting}
              triggerWalletTokenBalancesReload={
                triggerWalletTokenBalancesReload
              }
            />
          )}

          <div className='hidden'>
            <div className='flex flex-col items-center gap-4 border-t pt-4'>
              <div className='text-xl font-boldy'>Positions</div>

              <PositionsStats
                connected={connected}
                positions={positions}
                triggerUserProfileReload={triggerUserProfileReload}
                className='w-[90%]'
              />
            </div>

            <div className='flex flex-col items-center gap-4 border-t pt-4'>
              <div className='text-xl font-boldy'>Staking</div>
              <div className="flex flex-col sm:flex-row gap-3">
                <NumberDisplay
                  title="Liquid Staked ADX"
                  nb={liquidStakedADX}
                  precision={2}
                  placeholder="0 ADX"
                  suffix="ADX"
                  className='border-none p-1'
                  titleClassName='text-xs sm:text-xs'
                />

                <NumberDisplay
                  title="Locked Staked ADX"
                  nb={lockedStakedADX}
                  precision={2}
                  placeholder="0 ADX"
                  suffix="ADX"
                  className='border-none p-1'
                  titleClassName='text-xs sm:text-xs'
                />

                <NumberDisplay
                  title="Locked Staked ALP"
                  nb={lockedStakedALP}
                  precision={2}
                  placeholder="0 ALP"
                  suffix="ALP"
                  className='border-none p-1'
                  titleClassName='text-xs sm:text-xs'
                />
              </div>
            </div>
          </div>

          <div className='h-[1px] w-full bg-bcolor' />

          <div className='flex flex-col items-center gap-4'>
            <div className='text-xl font-boldy'>OnChain Accounts</div>

            <UserRelatedAdrenaAccounts
              className='h-auto w-[90%] flex ml-auto mr-auto'
              userProfile={userProfile}
              userVest={userVest}
              positions={positions}
            />

          </div>
        </div>
      </div>
    </>
  );
}
