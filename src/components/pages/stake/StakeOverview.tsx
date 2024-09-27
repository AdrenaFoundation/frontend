import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
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
import warningIcon from '../../../../public/images/Icons/warning.png';

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
  pendingUsdcRewards,
  pendingAdxRewards,
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
  pendingUsdcRewards: number;
  pendingAdxRewards: number;
  pendingGenesisAdxRewards: number;
  nextRoundTime: number;
}) {
  const isALP = token === 'ALP';
  const stakingAccount = useStakingAccount(
    isALP ? window.adrena.client.lpTokenMint : window.adrena.client.lmTokenMint,
  );

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
          <h3 className="text-lg font-semibold mb-2">Pending Rewards</h3>
          <div className="flex-grow">
            <div className="h-[80px] overflow-y-auto">
              {isALP ? (
                <>
                  <p className="text-sm text-txtfade mb-1">
                    ADX and USDC rewards automatically accrue at the end of
                    every staking round.
                  </p>
                  <p className="text-sm text-txtfade mb-1">
                    Locked ALP can be retrieved once the locking period is over,
                    or by doing an early exit.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm text-txtfade mb-1">
                    ADX rewards automatically accrue at the end of every staking
                    round.
                  </p>
                  <p className="text-sm text-txtfade mb-1">
                    Liquid staked ADX can be unstaked at any time. Locked ADX
                    can be retrieved once the locking period is over, or by
                    performing an early exit.
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col border p-3 bg-secondary rounded-xl shadow-lg h-[140px]">
            <div className="flex flex-col space-y-1 flex-grow">
              <div className="flex justify-between">
                <span className="text-txtfade">USDC:</span>
                <div className="flex items-center">
                  <FormatNumber nb={pendingUsdcRewards} suffix=" USDC" />
                  {isALP && lockedStakes?.some((stake) => stake.isGenesis) && (
                    <Tippy content="We found a bug with the Genesis Locked Stake that prevent users to claim. A fix is on the way in the backend. If you see this, that means you are concerned, and that all the rewards are SAFU, coming soon™️">
                      <Image
                        src={warningIcon}
                        width={14}
                        height={14}
                        alt="info icon"
                        className="ml-1 inline-block"
                      />
                    </Tippy>
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-txtfade">ADX:</span>
                <div className="flex items-center">
                  <FormatNumber nb={pendingAdxRewards} suffix=" ADX" />
                  {isALP && lockedStakes?.some((stake) => stake.isGenesis) && (
                    <Tippy content="We found a bug with the Genesis Locked Stake that prevent users to claim. A fix is on the way in the backend. If you see this, that means you are concerned, and that all the rewards are SAFU, coming soon™️">
                      <Image
                        src={warningIcon}
                        width={14}
                        height={14}
                        alt="info icon"
                        className="ml-1 inline-block"
                      />
                    </Tippy>
                  )}
                </div>
              </div>
              {pendingGenesisAdxRewards > 0 && (
                <div className="flex justify-between">
                  <span className="text-txtfade">ADX (genesis bonus):</span>
                  <FormatNumber nb={pendingGenesisAdxRewards} suffix=" ADX" />
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              title="Claim"
              className="px-5 self-end mt-4" // Increased top margin
              onClick={() => handleClickOnClaimRewards()}
              disabled={
                pendingUsdcRewards === 0 &&
                pendingAdxRewards === 0 &&
                pendingGenesisAdxRewards === 0
              }
            />
          </div>
          <div className="text-sm mt-2 flex items-center justify-between">
            <div>
              <span className="text-txtfade">Next round starts in: </span>
              {stakingAccount && (
                <RemainingTimeToDate
                  timestamp={
                    getNextStakingRoundStartTime(
                      stakingAccount.currentStakingRound.startTime,
                    ).getTime() / 1000
                  }
                  className="inline-flex items-center ml-1 w-[5.5em] text-nowrap"
                  tippyText=""
                />
              )}
              <Tippy
                content={
                  <p className="font-medium">
                    Each round duration is 6h. At the end of a round, rewards
                    become available.
                  </p>
                }
              >
                <Image
                  src={infoIcon}
                  width={14}
                  height={14}
                  alt="info icon"
                  className="ml-1 inline-block"
                />
              </Tippy>
              <Link
                href="/monitoring?tab=Staking"
                className="text-xs text-txtfade hover:underline ml-1 opacity-40"
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
