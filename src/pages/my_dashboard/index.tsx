import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FinalizeLockedStakeRedeem from '@/components/pages/stake/FinalizeLockedStakeRedeem';
import UpdateLockedStake from '@/components/pages/stake/UpdateLockedStake';
import OwnerBlock from '@/components/pages/user_profile/OwnerBlock';
import PositionsStats from '@/components/pages/user_profile/PositionsStats';
import ProfileCreation from '@/components/pages/user_profile/ProfileCreation';
import StakesStats from '@/components/pages/user_profile/StakesStats';
import SwapStats from '@/components/pages/user_profile/SwapStats';
import TradingStats from '@/components/pages/user_profile/TradingStats';
import VestStats from '@/components/pages/user_profile/Veststats';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  LockedStakeExtended,
  PageProps,
  Vest,
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
  triggerPositionsReload,
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
  const [userVest, setUserVest] = useState<Vest | null>(null);

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

  const handleLockedStakeRedeem = async (
    lockedStake: LockedStakeExtended,
    earlyExit = false,
  ) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    if (earlyExit && !finalizeLockedStakeRedeem) return;

    const notification = MultiStepNotification.newForRegularTransaction(
      'Remove Locked Stake',
    ).fire();

    const stakedTokenMint =
      lockedStake.tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      await window.adrena.client.removeLockedStake({
        owner,
        resolved: !!lockedStake.resolved,
        threadId: lockedStake.stakeResolutionThreadId,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStake.index),
        earlyExit,
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();

      if (earlyExit) {
        setLockedStake(null);
        setFinalizeLockedStakeRedeem(false);
      }
    } catch (error) {
      console.error('error', error);
    }
  };

  const handleUpdateLockedStake = async ({
    lockedStake,
    updatedDuration,
    additionalAmount,
  }: {
    lockedStake: LockedStakeExtended;
    updatedDuration?: AdxLockPeriod | AlpLockPeriod;
    additionalAmount?: number;
  }) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    const notification = MultiStepNotification.newForRegularTransaction(
      'Upgrade Locked Stake',
    ).fire();

    try {
      await window.adrena.client.upgradeLockedStake({
        lockedStake,
        updatedDuration,
        additionalAmount,
        notification,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
      setUpdateLockedStake(false);
    } catch (error) {
      console.error('error', error);
    }
  };

  const getUserVesting = async () => {
    try {
      const vest = (await window.adrena.client.loadUserVest()) as Vest;
      setUserVest(vest);
    } catch (error) {
      console.log('failed to load vesting', error);
    }
  };

  return (
    <>
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50">
        <RiveAnimation
          animation="blob-bg"
          layout={
            new Layout({
              fit: Fit.FitWidth,
              alignment: Alignment.TopLeft,
            })
          }
          className={'absolute top-0 md:top-[-50px] left-0 w-[700px] h-full'}
          imageClassName="absolute top-0 left-0 w-[700px]"
        />

        <RiveAnimation
          animation="fred-bg"
          layout={
            new Layout({
              fit: Fit.FitWidth,
              alignment: Alignment.TopRight,
            })
          }
          className={'absolute right-0 w-[1500px] h-full'}
          imageClassName="hidden"
        />
      </div>

      <div className="flex flex-col max-w-[55em] gap-4 p-4 w-full self-center">
        {userProfile !== null ? (
          <>
            <div className="flex flex-wrap w-full gap-4">
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
                  <div className="flex flex-1 flex-col md:flex-row gap-4">
                    <TradingStats userProfile={userProfile} className="flex" />
                    <SwapStats userProfile={userProfile} className="flex" />
                  </div>
                </>
              )}
            </div>

            {userVest && (
              <VestStats
                vest={userVest}
                getUserVesting={getUserVesting}
                triggerWalletTokenBalancesReload={
                  triggerWalletTokenBalancesReload
                }
              />
            )}

            <PositionsStats
              connected={connected}
              positions={positions}
              triggerPositionsReload={triggerPositionsReload}
              triggerUserProfileReload={triggerUserProfileReload}
              title="Opened Positions"
              userProfile={userProfile}
            />

            <StakesStats
              liquidStakedADX={liquidStakedADX}
              lockedStakedADX={lockedStakedADX}
              lockedStakedALP={lockedStakedALP}
              lockedStakes={lockedStakes}
              handleLockedStakeRedeem={handleLockedStakeRedeem}
              handleClickOnFinalizeLockedRedeem={(
                lockedStake: LockedStakeExtended,
              ) => {
                setLockedStake(lockedStake);
                setUpdateLockedStake(false);
                setFinalizeLockedStakeRedeem(true);
              }}
              handleClickOnUpdateLockedStake={(
                lockedStake: LockedStakeExtended,
              ) => {
                setLockedStake(lockedStake);
                setFinalizeLockedStakeRedeem(false);
                setUpdateLockedStake(true);
              }}
            />

            <AnimatePresence>
              {updateLockedStake && (
                <Modal
                  title="Upgrade Locked Stake"
                  close={() => {
                    setLockedStake(null);
                    setUpdateLockedStake(false);
                    setFinalizeLockedStakeRedeem(false);
                  }}
                  className="max-w-[28em]"
                >
                  {lockedStake ? (
                    <UpdateLockedStake
                      lockedStake={lockedStake}
                      handleUpdateLockedStake={handleUpdateLockedStake}
                    />
                  ) : null}
                </Modal>
              )}

              {finalizeLockedStakeRedeem && (
                <Modal
                  title="Early Exit"
                  close={() => {
                    setLockedStake(null);
                    setUpdateLockedStake(false);
                    setFinalizeLockedStakeRedeem(false);
                  }}
                  className="max-w-[25em]"
                >
                  {lockedStake ? (
                    <FinalizeLockedStakeRedeem
                      lockedStake={lockedStake}
                      stakeTokenMintDecimals={
                        lockedStake.tokenSymbol === 'ADX'
                          ? window.adrena.client.adxToken.decimals
                          : window.adrena.client.alpToken.decimals
                      }
                      handleLockedStakeRedeem={handleLockedStakeRedeem}
                    />
                  ) : null}
                </Modal>
              )}
            </AnimatePresence>
          </>
        ) : (
          <div className="flex h-[10em] bg-main w-full border items-center justify-center rounded-xl z-10">
            <WalletConnection connected={connected} />
          </div>
        )}
      </div>
    </>
  );
}
