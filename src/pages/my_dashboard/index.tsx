import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import InputString from '@/components/common/inputString/InputString';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import PositionsStats from '@/components/pages/user_profile/PositionsStats';
import StakesStats from '@/components/pages/user_profile/StakesStats';
import SwapStats from '@/components/pages/user_profile/SwapStats';
import TradingStats from '@/components/pages/user_profile/TradingStats';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import { LockedStakeExtended, PageProps } from '@/types';
import {
  addFailedTxNotification,
  addNotification,
  addSuccessTxNotification,
  nativeToUi,
} from '@/utils';

export default function MyDashboard({
  positions,
  userProfile,
  triggerPositionsReload,
  triggerWalletTokenBalancesReload,
  triggerUserProfileReload,
}: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const [nickname, setNickname] = useState<string | null>(null);

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const [lockedStakes, setLockedStakes] = useState<
    LockedStakeExtended[] | null
  >(null);
  const [liquidStakedADX, setLiquidStakedADX] = useState<number | null>(null);
  const [lockedStakedADX, setLockedStakedADX] = useState<number | null>(null);
  const [lockedStakedALP, setLockedStakedALP] = useState<number | null>(null);

  const owner: PublicKey | null = wallet
    ? new PublicKey(wallet.walletAddress)
    : null;

  const handleLockedStakeRedeem = async (lockedStake: LockedStakeExtended) => {
    if (!owner) {
      addNotification({
        type: 'error',
        title: 'Please connect your wallet',
      });
      return;
    }

    const stakedTokenMint =
      lockedStake.tokenSymbol === 'ADX'
        ? window.adrena.client.adxToken.mint
        : window.adrena.client.alpToken.mint;

    try {
      const txHash = await window.adrena.client.removeLockedStake({
        owner,
        resolved: lockedStake.resolved,
        threadId: lockedStake.stakeResolutionThreadId,
        stakedTokenMint,
        lockedStakeIndex: new BN(lockedStake.index),
      });

      addSuccessTxNotification({
        title: 'Successfully Removed Locked Stake',
        txHash,
      });

      triggerWalletTokenBalancesReload();
      triggerWalletStakingAccountsReload();
    } catch (error) {
      return addFailedTxNotification({
        title: 'Error Removing Locked Stake',
        error,
      });
    }
  };

  useEffect(() => {
    if (!stakingAccounts) {
      return setLockedStakes(null);
    }

    const adxLockedStakes: LockedStakeExtended[] =
      (
        (stakingAccounts.ADX?.lockedStakes.sort(
          (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
        ) as LockedStakeExtended[]) ?? []
      ).map((stake, index) => ({
        ...stake,
        index,
        tokenSymbol: 'ADX',
      })) ?? [];

    const alpLockedStakes: LockedStakeExtended[] =
      (
        (stakingAccounts.ALP?.lockedStakes.sort(
          (a, b) => Number(a.stakeTime) - Number(b.stakeTime),
        ) as LockedStakeExtended[]) ?? []
      ).map((stake, index) => ({
        ...stake,
        index,
        tokenSymbol: 'ALP',
      })) ?? [];

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

    if (trimmedNickname.length < 3 || trimmedNickname.length > 24) {
      return addNotification({
        title: 'Cannot create profile',
        type: 'info',
        message: 'Nickname must be between 3 to 24 characters long',
      });
    }

    try {
      const txHash = await window.adrena.client.initUserProfile({
        nickname: trimmedNickname,
      });

      triggerUserProfileReload();

      return addSuccessTxNotification({
        title: 'Successfully Created Profile',
        txHash,
      });
    } catch (error) {
      console.log('error', error);
      return addFailedTxNotification({
        title: 'Error Creating Profile',
        error,
      });
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 w-full max-w-[50em] self-center">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-50">
        <RiveAnimation
          animation="btm-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute top-0 left-[-10vh] h-[100vh] w-[140vh] scale-x-[-1]"
        />

        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({
              fit: Fit.Fill,
              alignment: Alignment.TopLeft,
            })
          }
          className="absolute hidden md:block top-0 right-[-20vh] h-[90vh] w-[110vh] -z-10"
        />
      </div>

      {userProfile ? (
        <div className="flex flex-wrap gap-4">
          <TradingStats
            userProfile={userProfile}
            className="md:max-w-[23.5em]"
          ></TradingStats>
          <SwapStats
            userProfile={userProfile}
            className="md:max-w-[23.5em]"
          ></SwapStats>
        </div>
      ) : null}

      <PositionsStats
        positions={positions}
        triggerPositionsReload={triggerPositionsReload}
        title="My Opened Positions"
      ></PositionsStats>

      <StakesStats
        liquidStakedADX={liquidStakedADX}
        lockedStakedADX={lockedStakedADX}
        lockedStakedALP={lockedStakedALP}
        lockedStakes={lockedStakes}
        handleLockedStakeRedeem={handleLockedStakeRedeem}
      ></StakesStats>

      {/* TODO: Add My Vestings */}

      {userProfile === false ? (
        <StyledContainer
          title={
            <h2 className="text-center">
              Create a profile and get trading and swap stats.
            </h2>
          }
          className="items-center"
        >
          <div className="flex flex-col items-center justify-center">
            <div className="font-special text-xl mt-6 ">My Nickname</div>

            <InputString
              value={nickname ?? ''}
              onChange={setNickname}
              placeholder="The Great Trader"
              className="mt-4 text-center w-[20em] p-2 bg-third border rounded-xl"
              inputFontSize="1.1em"
              maxLength={24}
            />
          </div>

          <Button
            disabled={
              nickname ? !(nickname.length >= 3 && nickname.length <= 24) : true
            }
            className="mt-4 text-sm w-[30em]"
            size="lg"
            title="Create"
            onClick={() => initUserProfile()}
          />
        </StyledContainer>
      ) : null}
    </div>
  );
}
