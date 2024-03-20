import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import LockedStakedElement from '@/components/pages/earn/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/earn';
import { LockedStakeExtended, LockPeriod } from '@/types';

export default function ALPStakeOverview({
  totalLockedStake,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
}: {
  totalLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnStakeMore: (initialLockPeriod: LockPeriod) => void;
  handleClickOnClaimRewards: () => void;
}) {
  return (
    <div className="flex w-full h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center">
        <Image
          src={window.adrena.client.alpToken.image}
          width={32}
          height={32}
          alt="ALP icon"
        />

        <div className="flex flex-col justify-start ml-2">
          <h2 className="">ALP</h2>
          <span className="opacity-50">The Pool Token</span>
        </div>
      </div>

      <div className="border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <h3>Duration-Locked Staking</h3>

        <p className="mt-4 flex flex-col ">
          <span className="text-txtfade text-xs">
            Stake and lock your ALP for a time to earn ADX and USDC rewards. The
            longer the period, the bigger the rewards.
          </span>
          <span className="mt-2 text-txtfade text-xs">
            ADX and USDC rewards accrue automatically every ~6 hours and get
            auto-claimed every 18 days. You can manually claim rewards.
          </span>

          <span className="mt-2 text-txtfade text-xs">
            The locked ALP tokens can be redeemed once the locking period is
            over.
          </span>
        </p>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex w-full justify-between bg-dark rounded-2xl pt-2 pb-2 pl-4 pr-4 border border-gray-200">
          <span>Locked</span>

          <div>
            <span className="font-mono">{totalLockedStake ?? '-'}</span>
            <span className="ml-1">ALP</span>
          </div>
        </div>

        {totalLockedStake !== null && totalLockedStake > 0 ? (
          <>
            <div className="h-[1px] bg-gray-200 w-full mt-4 mb-2" />

            <span className="font-bold">
              My{lockedStakes?.length ? ` ${lockedStakes.length}` : ''} Locked
              Stakes
            </span>

            <div className="flex flex-col mt-2 gap-y-2">
              {lockedStakes ? (
                lockedStakes.map((lockedStake, i) => (
                  <LockedStakedElement
                    lockedStake={lockedStake}
                    key={i}
                    token={window.adrena.client.alpToken}
                    handleRedeem={handleLockedStakeRedeem}
                  />
                ))
              ) : (
                <div className="text-sm m-auto mt-4 mb-4 text-txtfade">
                  No Active Locked Stakes
                </div>
              )}
            </div>
          </>
        ) : null}

        <div className="flex gap-x-4">
          <Button
            className="w-full mt-4"
            variant="primary"
            size="lg"
            title="Stake More"
            onClick={() =>
              handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_DURATION)
            }
          />

          <Button
            className="w-full mt-4"
            disabled={totalLockedStake === 0}
            variant="outline"
            size="lg"
            title="Claim Rewards"
            onClick={() => handleClickOnClaimRewards()}
          />
        </div>
      </div>
    </div>
  );
}
