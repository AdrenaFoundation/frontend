import Image from 'next/image';
import React from 'react';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/stake';
import { LockedStakeExtended, LockPeriod } from '@/types';

export default function ADXStakeOverview({
  totalLiquidStaked,
  totalLockedStake,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnRedeem,
  handleClickOnClaimRewards,
  className,
}: {
  totalLiquidStaked: number | null;
  totalLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnStakeMore: (initialLockPeriod: LockPeriod) => void;
  handleClickOnRedeem: () => void;
  handleClickOnClaimRewards: () => void;
  className?: string;
}) {
  return (
    <StyledContainer
      className={className}
      title={
        <div className="flex items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            width={32}
            height={32}
            alt="ADX icon"
          />

          <div className="flex flex-col justify-start ml-2">
            <h1>ADX</h1>
            <span className="opacity-50">The Governance Token</span>
          </div>
        </div>
      }
    >
      <StyledSubContainer>
        <h3>Liquid Staking</h3>

        <p className="mt-4 text-txtfade text-xs">
          Stake your ADX and get 1:1 voting power to participate in the
          governance and decide the future of the protocol. Get out at any time
          (if no active vote).
        </p>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex w-full justify-between bg-third rounded-lg pt-2 pb-2 pl-4 pr-4 border border-gray-200">
          <span className="flex items-center">Balance</span>

          <div>
            <span className="font-mono">{totalLiquidStaked ?? '-'}</span>
            <span className="ml-1">ADX</span>
          </div>
        </div>

        <div className="flex gap-x-4">
          <Button
            className="w-full mt-4"
            variant="primary"
            size="lg"
            title="Stake More"
            disabled={!window.adrena.geoBlockingData.allowed}
            onClick={() => handleClickOnStakeMore(0)}
          />

          <Button
            className="w-full mt-2"
            disabled={
              !window.adrena.geoBlockingData.allowed || totalLiquidStaked === 0
            }
            variant="outline"
            size="lg"
            title="Redeem"
            onClick={() => handleClickOnRedeem()}
          />
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <h3>Duration-Locked Staking</h3>

        <p className="mt-4 flex flex-col ">
          <span className="text-txtfade text-xs">
            Stake and lock your ADX for a time to earn ADX and USDC rewards and
            get 1:X voting power. The longer the period, the bigger the rewards
            and voting power.
          </span>
          <span className="mt-2 text-txtfade text-xs">
            ADX and USDC rewards accrue automatically every ~6 hours and get
            auto-claimed every 18 days. You can manually claim rewards.
          </span>

          <span className="mt-2 text-txtfade text-xs">
            The locked ADX tokens can be redeemed once the locking period is
            over.
          </span>
        </p>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex w-full justify-between bg-third rounded-lg pt-2 pb-2 pl-4 pr-4 border border-gray-200">
          <span className="flex items-center">Locked</span>

          <div>
            <span className="font-mono">{totalLockedStake ?? '-'}</span>
            <span className="ml-1">ADX</span>
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
                    token={window.adrena.client.adxToken}
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
            disabled={!window.adrena.geoBlockingData.allowed}
            onClick={() =>
              handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_DURATION)
            }
          />

          <Button
            className="w-full mt-4"
            disabled={
              !window.adrena.geoBlockingData.allowed || totalLockedStake === 0
            }
            variant="outline"
            size="lg"
            title="Claim Rewards"
            onClick={() => handleClickOnClaimRewards()}
          />
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
