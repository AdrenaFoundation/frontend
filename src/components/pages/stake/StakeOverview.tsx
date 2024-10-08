import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import useStakingAccount from '@/hooks/useStakingAccount';
import {
  DEFAULT_LOCKED_STAKE_LOCK_DURATION,
  LIQUID_STAKE_LOCK_DURATION,
} from '@/pages/stake';
import { AlpLockPeriod, LockedStakeExtended } from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import adxTokenLogo from '../../../../public/images/adx.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';
import usdcTokenLogo from '../../../../public/images/usdc.svg';

interface SortConfig {
  size: 'asc' | 'desc';
  duration: 'asc' | 'desc';
  lastClicked: 'size' | 'duration';
}

export default function StakeOverview({
  token,
  totalLockedStake,
  totalLiquidStaked,
  handleClickOnRedeem,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
  handleClickOnFinalizeLockedRedeem,
  userPendingUsdcRewards,
  userPendingAdxRewards,
  pendingGenesisAdxRewards,
  handleClickOnUpdateLockedStake,
}: {
  token: 'ADX' | 'ALP';
  totalLockedStake: number | null;
  totalLiquidStaked?: number | null;
  handleClickOnRedeem?: () => void;
  totalRedeemableLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnStakeMore: (initialLockPeriod: AlpLockPeriod) => void;
  handleClickOnClaimRewards: () => Promise<void>;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  userPendingUsdcRewards: number;
  userPendingAdxRewards: number;
  roundPendingUsdcRewards: number;
  roundPendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  nextRoundTime: number;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
}) {
  const isALP = token === 'ALP';
  const storageKey = isALP ? 'alpStakeSortConfig' : 'adxStakeSortConfig';
  const { stakingAccount, triggerReload } = useStakingAccount(
    isALP ? window.adrena.client.lpTokenMint : window.adrena.client.lmTokenMint,
  );
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(() => {
    const savedConfig = localStorage.getItem(storageKey);
    return savedConfig
      ? JSON.parse(savedConfig)
      : {
        size: 'desc',
        duration: 'asc',
        lastClicked: 'size',
      };
  });

  const [roundPassed, setRoundPassed] = useState<boolean>(false);

  useEffect(() => {
    if (!stakingAccount) {
      return;
    }

    const interval = setInterval(() => {
      const nextRound = getNextStakingRoundStartTime(
        stakingAccount.currentStakingRound.startTime,
      ).getTime();

      if ((nextRound - Date.now()) < 0) {
        setRoundPassed(true);
      } else if (roundPassed) {
        setRoundPassed(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [roundPassed, stakingAccount]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(sortConfig));
  }, [sortConfig, storageKey]);

  const handleClaim = async () => {
    setIsClaimingRewards(true);

    try {
      await handleClickOnClaimRewards();
    } finally {
      setIsClaimingRewards(false);
    }
  };

  const handleSort = (key: 'size' | 'duration') => {
    setSortConfig((prev) => ({
      ...prev,
      [key]: prev[key] === 'desc' ? 'asc' : 'desc',
      lastClicked: key,
    }));
  };

  const getEndDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  };

  const triggerResolveStakingRound = async () => {
    const notification = MultiStepNotification.newForRegularTransaction(
      `Resolve ${isALP ? 'ALP' : 'ADX'} Staking Round`,
    ).fire();

    try {
      await window.adrena.client.resolveStakingRound({
        stakedTokenMint: isALP
          ? window.adrena.client.lpTokenMint
          : window.adrena.client.lmTokenMint,
        notification,
      });

      setTimeout(() => {
        triggerReload();
      }, 0);
    } catch (error) {
      console.error('error', error);
    }
  };

  return (
    <div className="flex flex-col bg-main rounded-2xl border h-full">
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row items-center h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-lg shadow-lg">
          <div
            className={twMerge(
              'flex items-center w-full sm:w-auto sm:min-w-[200px] rounded-t-lg sm:rounded-r-none sm:rounded-l-lg p-3 sm:h-full flex-none sm:border-r',
              isALP ? 'bg-[#130AAA]' : 'bg-[#991B1B]',
            )}
          >
            <div className="flex flex-row items-center gap-6">
              <div>
                <p className="opacity-50 text-base">Total staked</p>
                <FormatNumber
                  nb={
                    isALP
                      ? totalLockedStake
                      : Number(totalLockedStake) + Number(totalLiquidStaked)
                  }
                  suffix={` ${token}`}
                  className="text-2xl"
                />
              </div>

              <Image
                src={isALP ? alpLogo : adxLogo}
                width={50}
                height={50}
                className="opacity-10"
                alt={`${token} logo`}
              />
            </div>
          </div>

          <p className="m-auto opacity-75 text-base p-3">
            {isALP
              ? 'Provide liquidities long term: the longer the period, the higher the rewards. 70% of protocol fees are distributed to ALP holder and stakers.'
              : 'Align with the protocol long term success: the longer the period, the higher the rewards. 20% of protocol fees are distributed to ADX stakers.'}
          </p>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {/* Pending rewards block */}
        <div className="h-[1px] bg-bcolor w-full my-3" />
        <div className="px-5">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold">Pending Rewards</h3>
            <Tippy
              content={
                <div className="p-2">
                  {isALP ? (
                    <>
                      <p className="text-sm mb-1">
                        ADX and USDC rewards automatically accrue at the end of
                        every staking round.
                      </p>
                      <p className="text-sm">
                        Locked ALP can be retrieved once the locking period is
                        over, or by doing an early exit.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm mb-1">
                        ADX rewards automatically accrue at the end of every
                        staking round.
                      </p>
                      <p className="text-sm">
                        Liquid staked ADX can be unstaked at any time. Locked
                        ADX can be retrieved once the locking period is over, or
                        by performing an early exit.
                      </p>
                    </>
                  )}
                </div>
              }
            >
              <Image
                src={infoIcon}
                width={16}
                height={16}
                alt="info icon"
                className="inline-block ml-2 cursor-pointer"
              />
            </Tippy>
            <Button
              variant="primary"
              size="sm"
              title={isClaimingRewards ? 'Claiming...' : 'Claim'}
              className="px-5 ml-auto w-[9em]"
              onClick={handleClaim}
              disabled={
                userPendingUsdcRewards +
                userPendingAdxRewards +
                pendingGenesisAdxRewards <=
                0
              }
            />
          </div>

          <div className="flex flex-col border bg-secondary rounded-xl shadow-lg overflow-hidden">
            {/* Pending rewards block */}
            <div className="flex-grow"></div>
            <div className="flex flex-col border p-3 bg-secondary rounded-xl shadow-lg h-[90px]">
              <div className="flex flex-col space-y-1 flex-grow">
                <div className="flex justify-between">
                  <span className="text-txtfade">
                    Your share of {isALP ? '70%' : '20%'} platform&apos;s
                    revenue:
                  </span>
                  <div className="flex items-center">
                    <FormatNumber nb={userPendingUsdcRewards} />
                    <Image
                      src={usdcTokenLogo}
                      width={16}
                      height={16}
                      className="ml-1 opacity-50"
                      alt="usdc token logo"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-txtfade">
                    LM rewards
                    <span className="text-txtfade ">
                      {' '}
                      (see
                      <Link
                        href={
                          isALP
                            ? 'https://docs.adrena.xyz/tokenomics/alp/staked-alp-rewards-emissions-schedule'
                            : 'https://docs.adrena.xyz/tokenomics/adx/staked-adx-rewards-emissions-schedule'
                        }
                        className="underline ml-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        schedule
                      </Link>
                      )
                    </span>
                  </span>
                  <div className="flex items-center">
                    <FormatNumber nb={userPendingAdxRewards} />
                    <Image
                      src={adxTokenLogo}
                      width={16}
                      height={16}
                      className="ml-1 opacity-50"
                      alt="adx token logo"
                    />
                  </div>
                </div>
                {pendingGenesisAdxRewards > 0 && (
                  <div className="flex justify-between">
                    <span className="text-txtfade">
                      Genesis campaign LM rewards bonus
                      <Tippy
                        content={
                          <p>
                            These rewards accrue over time for the first 180
                            days of the protocol. The amount is proportional to
                            your participation in the Genesis Liquidity
                            campaign. <br />
                            <br /> Thank you for being an early supporter of the
                            protocol! 🎊 🎁
                          </p>
                        }
                        placement="auto"
                      >
                        <Image
                          src={infoIcon}
                          width={14}
                          height={14}
                          alt="info icon"
                          className="inline-block ml-1 mr-1 cursor-pointer"
                        />
                      </Tippy>
                      :
                    </span>
                    <div className="flex items-center">
                      <FormatNumber
                        nb={pendingGenesisAdxRewards}
                        className="text-green"
                        prefix="+"
                        isDecimalDimmed={false}
                      />
                      <Image
                        src={adxTokenLogo}
                        width={16}
                        height={16}
                        className="ml-1 opacity-50"
                        alt="adx token logo"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom line */}
          <div className="flex flex-col mt-2 gap-2 text-sm pl-2 pr-6">
            <div className="flex items-center justify-between">
              <span className="text-txtfade">
                <Tippy
                  content={
                    <p className="font-medium">
                      Each round duration is ~6h (+/- some jitter due to Sablier
                      on chain decentralized execution).
                      <br />
                      At the end of a round, the accrued rewards become
                      claimable, and a new round starts.
                      <br />
                      The ADX and ALP rounds are not necessarily in sync.
                    </p>
                  }
                >
                  <Image
                    src={infoIcon}
                    width={14}
                    height={14}
                    alt="info icon"
                    className="inline-block mr-1"
                  />
                </Tippy>
                New rewards unlocking in:
              </span>

              <div className="flex items-center">
                {stakingAccount && (
                  <div className="flex items-center justify-center w-[7em]">
                    <RemainingTimeToDate
                      timestamp={
                        getNextStakingRoundStartTime(
                          stakingAccount.currentStakingRound.startTime,
                        ).getTime() / 1000
                      }
                      className="inline-flex items-center text-nowrap"
                      tippyText=""
                    />
                  </div>
                )}

                <div className="justify-end ml-2 hidden sm:flex">
                  <Link
                    href="https://docs.adrena.xyz/about-adrena/staking"
                    className="text-xs text-txtfade underline opacity-40 hover:opacity-100 transition-opacity"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    learn more &gt;
                  </Link>
                </div>
              </div>
            </div>

            {roundPassed ? (
              <Button
                variant="outline"
                className="text-xs"
                title="Trigger Resolve Staking Round"
                onClick={() => triggerResolveStakingRound()}
              />
            ) : null}
          </div>
        </div>

        {/* Locked stakes section */}
        <div className="h-[1px] bg-bcolor w-full my-5" />
        <div className="px-5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              My Locked Stakes{' '}
              {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
            </h3>

            <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
              <div className="flex items-center text-xs bg-secondary rounded-full p-[2px] border border-bcolor">
                <button
                  className="px-2 py-1 rounded-full transition-colors flex items-center"
                  onClick={() => handleSort('size')}
                >
                  Amount
                  <span className="ml-1 text-txtfade text-[10px]">
                    {sortConfig.size === 'asc' ? '↑' : '↓'}
                  </span>
                </button>
                <div className="w-px h-4 bg-bcolor mx-[1px]"></div>
                <button
                  className="px-2 py-1 rounded-full transition-colors flex items-center"
                  onClick={() => handleSort('duration')}
                >
                  Unlock Date
                  <span className="ml-1 text-txtfade text-[10px]">
                    {sortConfig.duration === 'asc' ? '↑' : '↓'}
                  </span>
                </button>
              </div>

              <Button
                variant="primary"
                size="sm"
                title="Add Stake"
                className="px-5 w-[9em]"
                onClick={() =>
                  handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_LOCK_DURATION)
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {lockedStakes && lockedStakes.length > 0 ? (
              lockedStakes
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
                    token={
                      isALP
                        ? window.adrena.client.alpToken
                        : window.adrena.client.adxToken
                    }
                    handleRedeem={handleLockedStakeRedeem}
                    handleClickOnFinalizeLockedRedeem={
                      handleClickOnFinalizeLockedRedeem
                    }
                    handleClickOnUpdateLockedStake={
                      handleClickOnUpdateLockedStake
                    }
                  />
                ))
            ) : (
              <div className="text-lg mt-4 mb-4 text-txtfade text-left pl-4">
                No Active Locked Stakes
              </div>
            )}
          </div>
        </div>

        {/* Liquid stake section */}
        <div className="mt-auto">
          {!isALP && (
            <>
              <div className="h-[1px] bg-bcolor w-full my-5" />
              <div className="px-5">
                <h3 className="text-lg font-semibold mb-2">Liquid stake</h3>
                <div className="flex flex-col sm:flex-row justify-between items-center border p-3 bg-secondary rounded-xl mt-3 shadow-lg">
                  <div className="flex items-center">
                    <Image
                      src={adxTokenLogo}
                      width={16}
                      height={16}
                      className="opacity-50"
                      alt="adx token logo"
                    />
                    <FormatNumber
                      nb={totalLiquidStaked}
                      className="ml-2 text-xl"
                    />
                  </div>

                  <div className="flex gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Unstake"
                      className={twMerge(
                        'px-5',
                        (!totalLiquidStaked || totalLiquidStaked <= 0) &&
                        'opacity-50 cursor-not-allowed',
                      )}
                      onClick={handleClickOnRedeem}
                      disabled={!totalLiquidStaked || totalLiquidStaked <= 0}
                    />

                    <Button
                      variant="primary"
                      size="sm"
                      title={
                        totalLiquidStaked && totalLiquidStaked > 0
                          ? 'Add Stake'
                          : 'Stake'
                      }
                      className="px-5"
                      onClick={() =>
                        handleClickOnStakeMore(LIQUID_STAKE_LOCK_DURATION)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* New separator below liquid stake section */}
          <div className="h-[1px] bg-bcolor w-full my-5" />
        </div>
      </div>
    </div>
  );
}
