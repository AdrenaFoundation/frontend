import { BN } from '@coral-xyz/anchor';
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { PublicKey } from '@solana/web3.js';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';

import Modal from '@/components/common/Modal/Modal';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import Loader from '@/components/Loader/Loader';
import ADXStakeToken from '@/components/pages/stake/ADXStakeToken';
import ALPStakeToken from '@/components/pages/stake/ALPStakeToken';
import FinalizeLockedStakeRedeem from '@/components/pages/stake/FinalizeLockedStakeRedeem';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import StakeLanding from '@/components/pages/stake/StakeLanding';
import StakeOverview from '@/components/pages/stake/StakeOverview';
import StakeRedeem from '@/components/pages/stake/StakeRedeem';
import UpgradeLockedStake from '@/components/pages/stake/UpgradeLockedStake';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useGovernanceShadowTokenSupply from '@/hooks/useGovernanceShadowTokenSupply';
import useStakingAccount from '@/hooks/useStakingAccount';
import useStakingAccountCurrentRoundRewards from '@/hooks/useStakingAccountCurrentRoundRewards';
import { useStakingClaimableRewards } from '@/hooks/useStakingClaimableRewards';
import useWalletStakingAccounts from '@/hooks/useWalletStakingAccounts';
import { useSelector } from '@/store/store';
import {
  AdxLockPeriod,
  AlpLockPeriod,
  LockedStakeExtended,
  PageProps,
} from '@/types';
import {
  addNotification,
  formatNumber,
  formatPercentage,
  getAdxLockedStakes,
  getAlpLockedStakes,
  nativeToUi,
} from '@/utils';
import { getNextStakingRoundStartTime } from '@/utils';

import babyMonster from '../../../public/images/baby_monster.png';
import arrowDown from '../../../public/images/arrow-down.png';
import oldMonster from '../../../public/images/old_monster.png';
import teenMonster from '../../../public/images/teen_monster.png';

interface SortConfig {
  size: 'asc' | 'desc';
  duration: 'asc' | 'desc';
  lastClicked: 'size' | 'duration';
}

type CalculatedInfo = {
  totalVotingPower: number;
  votingPowerPercentage: number | null;
  totalAdxStaked: number;
  totalAlpStaked: number;
}

export default function Stake({
  connected,
  triggerWalletTokenBalancesReload,
}: PageProps) {
  const wallet = useSelector((s) => s.walletState.wallet);
  const walletTokenBalances = useSelector((s) => s.walletTokenBalances);

  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const alpPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;

  const { stakingAccounts, triggerWalletStakingAccountsReload } =
    useWalletStakingAccounts();

  const shadowTokenSupply = useGovernanceShadowTokenSupply();

  const adxLockedStakes: LockedStakeExtended[] | null =
    getAdxLockedStakes(stakingAccounts);

  const alpLockedStakes: LockedStakeExtended[] | null =
    getAlpLockedStakes(stakingAccounts);

  const [calculatedInfo, setCalculatedInfo] = useState<CalculatedInfo | null>(null);

  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const savedConfig = localStorage.getItem('StakeSortConfig');
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
        size: 'desc',
        duration: 'asc',
        lastClicked: 'size',
      };
  });

  useEffect(() => {
    if (!stakingAccounts || !stakingAccounts.ADX || !stakingAccounts.ALP) {
      setCalculatedInfo(null);
      return;
    }

    const totalAdxStaked = stakingAccounts.ADX.lockedStakes.reduce((acc, stake) => {
      return acc + nativeToUi(stake.amount, window.adrena.client.adxToken.decimals);
    }, 0) + nativeToUi(stakingAccounts.ADX.liquidStake.amount, window.adrena.client.adxToken.decimals);

    const totalAlpStaked = stakingAccounts.ALP.lockedStakes.reduce((acc, stake) => {
      return acc + nativeToUi(stake.amount, window.adrena.client.alpToken.decimals);
    }, 0);

    const totalVotingPower = nativeToUi(stakingAccounts.ADX.liquidStake.amount, window.adrena.client.adxToken.decimals) + stakingAccounts.ADX.lockedStakes.reduce((acc, stake) => {
      return acc + (stake.voteMultiplier * nativeToUi(stake.amount, window.adrena.client.adxToken.decimals) / 10000);
    }, 0);

    setCalculatedInfo({
      totalVotingPower,
      votingPowerPercentage: shadowTokenSupply !== null ? (totalVotingPower / shadowTokenSupply) * 100 : null,
      totalAdxStaked,
      totalAlpStaked,
    });
  }, [stakingAccounts, shadowTokenSupply]);

  const getEndDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  return <div className='flex flex-col w-full gap-4 mt-4'>
    <div className='flex w-full'>
      {/* Past Rewards */}

      <div className='w-1/3 items-center flex flex-col gap-4 relative grow'>
        <h1 className='h-20'>Past</h1>

        <Image
          className="cursor-pointer opacity-10 absolute -top-5 left-20"
          src={babyMonster}
          alt="baby monster"
          width={200}
          height={200}
        />

        <div className='flex border border-[#bbbcbc] bg-secondary flex-col rounded opacity-100 z-10 w-[20em] grow items-center justify-center'>
          <div className='flex flex-col items-center p-2'>
            <h3>Collected Rewards</h3>

            <div className='flex'>
              <div className='font-mono'>5405</div>
              <div className='ml-1 font-boldy'>USDC</div>
            </div>

            <div className='flex'>
              <div className='font-mono'>515005</div>
              <div className='ml-1 font-boldy'>ADX</div>
            </div>
          </div>

          <div className='flex flex-col items-center'>
            <h3>Claim History</h3>

            <div className='flex flex-col items-center justify-center'>
              <div>One</div>
              <div>Two</div>
              <div>Three</div>
              <div>Four</div>
              <div>Five</div>
              <div>Six</div>
            </div>
          </div>
        </div>
      </div>

      {/* Staked now */}
      <div className='w-1/3 items-center flex flex-col gap-4 relative grow'>
        <h1 className='h-20'>Present</h1>

        <Image
          className="cursor-pointer opacity-10 absolute -top-5 left-10"
          src={teenMonster}
          alt="teen monster"
          width={200}
          height={200}
        />

        <div className='flex border border-[#bbbcbc] bg-secondary flex-col rounded opacity-100 w-[20em] grow z-10 items-center justify-center'>
          <div className='flex flex-col items-center p-2'>
            <h3>Total Staked</h3>

            <div className='flex'>
              <div className='font-mono'>{calculatedInfo ? formatNumber(
                calculatedInfo.totalAdxStaked,
                window.adrena.client.adxToken.displayAmountDecimalsPrecision,
                window.adrena.client.adxToken.displayAmountDecimalsPrecision,
              ) : '-'}</div>
              <div className='ml-1 font-boldy'>ADX</div>
            </div>

            <div className='flex'>
              <div className='font-mono'>{calculatedInfo ? formatNumber(
                calculatedInfo.totalAlpStaked,
                window.adrena.client.alpToken.displayAmountDecimalsPrecision,
                window.adrena.client.alpToken.displayAmountDecimalsPrecision,
              ) : '-'}</div>
              <div className='ml-1 font-boldy'>ALP</div>
            </div>
          </div>

          <div className='flex relative'>
            <Image
              className="cursor-pointer opacity-100"
              src={arrowDown}
              alt="arrow down"
              width={20}
              height={100}
            />

            <div className='absolute -right-10 -top-0'>Gives</div>
          </div>

          <div className='flex flex-col items-center p-2'>
            <h3>Voting Power</h3>

            <div className='flex items-center justify-center'>
              <div>{calculatedInfo ? formatNumber(
                calculatedInfo.totalVotingPower,
                window.adrena.client.adxToken.displayAmountDecimalsPrecision,
                window.adrena.client.adxToken.displayAmountDecimalsPrecision,
              ) : '-'}</div>

              {calculatedInfo && calculatedInfo.votingPowerPercentage ?
                <div className='ml-1 text-txtfade font-mono text-xs'>({calculatedInfo.votingPowerPercentage < 1000 ? formatPercentage(calculatedInfo.votingPowerPercentage, 8) :
                  formatPercentage(calculatedInfo.votingPowerPercentage, 4)})</div> : null}
            </div>
          </div>

          <div className='flex flex-col items-center p-2'>
            <h3>Staking Weight</h3>

            <div className='flex'>
              <div className='font-mono'>515005</div>
              <div className='ml-1 font-boldy'>ADX</div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Rewards */}
      <div className='w-1/3 items-center flex flex-col gap-4 relative grow'>
        <h1 className='h-20'>Projected Future</h1>

        <Image
          className="cursor-pointer opacity-10 absolute -top-10 left-0"
          src={oldMonster}
          alt="old monster"
          width={250}
          height={250}
        />

        <div className='flex border border-[#bbbcbc] bg-secondary flex-col rounded opacity-100 w-[20em] grow z-10'>
        </div>
      </div>
    </div>

    <div className='h-[1px] w-full bg-bcolor' />

    <div className='flex flex-col w-full items-center gap-4'>
      <h1>My Stakes</h1>

      <div className='flex flex-wrap gap-4'>
        {adxLockedStakes && alpLockedStakes && (adxLockedStakes.length + alpLockedStakes.length) > 0 ? (
          [...adxLockedStakes, ...alpLockedStakes]
            .sort((a: LockedStakeExtended, b: LockedStakeExtended) => {
              const sizeModifier = sortConfig.size === 'asc' ? 1 : -1;
              const durationModifier =
                sortConfig.duration === 'asc' ? 1 : -1;
              const sizeDiff =
                (Number(a.amount) - Number(b.amount)) * sizeModifier;
              const durationDiff =
                (getEndDate(Number(a.endTime)).getTime() -
                  getEndDate(Number(b.endTime)).getTime()) *
                durationModifier;

              if (sortConfig.lastClicked === 'size') {
                return sizeDiff || durationDiff;
              }

              return durationDiff || sizeDiff;
            })
            .map((lockedStake, i) => (
              <LockedStakedElement
                lockedStake={lockedStake}
                key={i}
                token={lockedStake.tokenSymbol === 'ADX' ? window.adrena.client.adxToken : window.adrena.client.alpToken}
                handleRedeem={() => {
                  //
                }}
                handleClickOnFinalizeLockedRedeem={() => {
                  //
                }}
                handleClickOnUpdateLockedStake={() => {
                  //
                }}
              />
            ))
        ) : (
          <div className="text-lg mt-4 mb-4 text-txtfade text-left pl-4">
            No Active Locked Stakes
          </div>
        )}
      </div>
    </div>
  </div>
}
