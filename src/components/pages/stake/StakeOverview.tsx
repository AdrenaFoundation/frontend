import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import RemainingTimeToDate from '@/components/pages/monitoring/RemainingTimeToDate';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import useStakingAccount from '@/hooks/useStakingAccount';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/stake';
import { AlpLockPeriod, LockedStakeExtended } from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';
import infoIcon from '../../../../public/images/Icons/info.svg';

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
  roundPendingUsdcRewards,
  roundPendingAdxRewards,
  pendingGenesisAdxRewards,
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
  handleClickOnClaimRewards: () => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  userPendingUsdcRewards: number;
  userPendingAdxRewards: number;
  roundPendingUsdcRewards: number;
  roundPendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  nextRoundTime: number;
}) {
  const isALP = token === 'ALP';
  const stakingAccount = useStakingAccount(
    isALP ? window.adrena.client.lpTokenMint : window.adrena.client.lmTokenMint,
  );
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);

  const handleClaim = async () => {
    setIsClaimingRewards(true);
    try {
      await handleClickOnClaimRewards();
    } finally {
      setIsClaimingRewards(false);
    }
  };

  return (
    <div className="flex flex-col bg-main rounded-2xl border h-full">
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row items-center h-full w-full bg-gradient-to-br from-[#07111A] to-[#0B1722] border rounded-lg shadow-lg">
          <div
            className={twMerge(
              'flex items-center w-full sm:w-auto sm:min-w-[200px] rounded-t-lg sm:rounded-r-none sm:rounded-l-lg p-3 sm:h-full flex-none border-r',
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
              variant="outline"
              size="sm"
              title={isClaimingRewards ? 'Claiming...' : 'Claim'}
              className="px-5 ml-auto"
              onClick={handleClaim}
              disabled={
                userPendingUsdcRewards === 0 &&
                userPendingAdxRewards === 0 &&
                pendingGenesisAdxRewards === 0
              }
            />
          </div>

          <div className="flex flex-col border bg-secondary rounded-xl shadow-lg">
            <div className="flex justify-between items-center relative w-full overflow-hidden pt-4 pb-4 pl-8 pr-8">
              <Image
                src={window.adrena.client.getUsdcToken().image}
                alt="USDC"
                width={100}
                height={100}
                className="absolute opacity-20 -left-10"
              />

              <div className="flex items-center justify-center">
                <FormatNumber nb={userPendingUsdcRewards} />
                <div className="ml-1 text-sm mt-[2px]">USDC</div>
              </div>

              <div className="flex items-center justify-center">
                <FormatNumber nb={userPendingAdxRewards} />
                <div className="ml-1 text-sm mt-[2px]">ADX</div>
              </div>

              <Image
                src={window.adrena.client.adxToken.image}
                alt="ADX"
                width={100}
                height={100}
                className="absolute opacity-20 -right-10"
              />

              {/* {pendingGenesisAdxRewards !== 0 && (
                      <>
                        <span className="text-xs text-blue">
                          (Genesis Bonus)
                        </span>
                        <FormatNumber
                          nb={pendingGenesisAdxRewards}
                          className="text-blue ml-1"
                        />
                        <span className="text-txtfade ml-1">+</span>
                      </>
                    )} */}
            </div>
          </div>

          {/* New side-by-side layout */}
          <div className="flex flex-col mt-2 gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="txt-xxs text-txtfade">
                <Tippy
                  content={
                    <p className="font-medium">
                      USDC rewards originates from platform revenues (70% ALP /
                      20% ADX).
                      <br />
                      <br />
                      ADX rewards originates from the ADX inflation (see doc for
                      scheduled inflation).
                      <br />
                      They are estimated based on the 6h round duration, but
                      since this can vary this number is an estimate.
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
                Next round&apos;s rewards:
              </span>
              <div className="flex items-center gap-2">
                <FormatNumber nb={roundPendingAdxRewards} />
                <Image
                  src={window.adrena.client.adxToken.image}
                  alt="ADX"
                  width={16}
                  height={16}
                />
                <span className="text-txtfade">|</span>
                <FormatNumber nb={roundPendingUsdcRewards} />
                <Image
                  src={window.adrena.client.getUsdcToken().image}
                  alt="USDC"
                  width={16}
                  height={16}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-txtfade">
                <Tippy
                  content={
                    <p className="font-medium">
                      Each round duration is ~6h (+/- some jitter due to Sablier
                      on chain decentralized execution).
                      <br />
                      <br />
                      At the end of a round, the accrued rewards become
                      claimable, and a new round starts.
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
                Distribution in:
              </span>
              <div className="flex items-center">
                {stakingAccount && (
                  <RemainingTimeToDate
                    timestamp={
                      getNextStakingRoundStartTime(
                        stakingAccount.currentStakingRound.startTime,
                      ).getTime() / 1000
                    }
                    className="inline-flex items-center text-nowrap"
                    tippyText=""
                  />
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <Link
                href="/monitoring?tab=Staking"
                className="text-xs text-txtfade hover:underline opacity-40"
              >
                learn more &gt;
              </Link>
            </div>
          </div>
        </div>

        {/* Locked stakes section */}
        <div className="h-[1px] bg-bcolor w-full my-5" />
        <div className="px-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">
              My Locked Stakes{' '}
              {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
            </h3>
            <Button
              className="px-8"
              variant="primary"
              size="sm"
              title={totalLockedStake !== 0 ? 'Add Stake' : 'Start Staking'}
              onClick={() =>
                handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_DURATION)
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {lockedStakes && lockedStakes.length > 0 ? (
              lockedStakes.map((lockedStake, i) => (
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
                <div className="flex flex-row justify-between items-center border p-3 bg-secondary rounded-xl mt-3 shadow-lg">
                  <FormatNumber
                    nb={totalLiquidStaked}
                    suffix=" ADX"
                    className="text-xl"
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      title="Unstake"
                      className="px-5"
                      onClick={handleClickOnRedeem}
                    />
                    <Button
                      variant="primary"
                      size="sm"
                      title={
                        totalLiquidStaked && totalLiquidStaked > 0
                          ? 'Add Stake'
                          : 'Start Staking'
                      }
                      className="px-5"
                      onClick={() =>
                        handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_DURATION)
                      }
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* New separator below liquid stake section */}
          <div className="h-[1px] bg-bcolor w-full my-5" />

          {/* Info text remains at the bottom */}
          <p className="opacity-25 text-center w-full p-5 pt-0">
            The duration of a staking round is 6 hours. You can manually claim
            rewards, else if you do not they will be automatically claimed every
            ~8 days as the on chain space is limited (technical constraint, but
            also feature).
          </p>
        </div>
      </div>
    </div>
  );
}
