import React from 'react';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/stake';
import { AdxLockPeriod, LockedStakeExtended } from '@/types';

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
  handleClickOnStakeMore: (initialLockPeriod: AdxLockPeriod) => void;
  handleClickOnRedeem: () => void;
  handleClickOnClaimRewards: () => void;
  className?: string;
}) {
  return (
    <StyledContainer
      className={className}
      title="ADX"
      subTitle="The Governance Token"
      icon={window.adrena.client.adxToken.image}
    >
      <StyledSubContainer>
        <h3>Liquid Staking</h3>

        <p className="mt-4 text-sm">
          Stake your ADX and get 1:1 voting power to participate in the
          governance and decide the future of the protocol. Get out at any time
          (if no active vote).
        </p>

        <StyledSubSubContainer className="mt-4">
          <h5 className="flex items-center">Balance</h5>

          <div>
            <span className="font-mono">{totalLiquidStaked ?? '-'}</span>
            <span className="ml-1">ADX</span>
          </div>
        </StyledSubSubContainer>

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
            className="w-full mt-4"
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
          <span className="text-sm">
            Stake and lock your ADX for a time to earn ADX and USDC rewards and
            get 1:X voting power. The longer the period, the bigger the rewards
            and voting power.
          </span>
          <span className="mt-2 text-sm">
            ADX and USDC rewards accrue automatically every ~6 hours and get
            auto-claimed every 18 days. You can manually claim rewards.
          </span>

          <span className="mt-2 text-sm">
            The locked ADX tokens can be redeemed once the locking period is
            over.
          </span>
        </p>

        <StyledSubSubContainer className="mt-4">
          <h5 className="flex items-center">Locked</h5>

          <div>
            <span className="font-mono">{totalLockedStake ?? '-'}</span>
            <span className="ml-1">ADX</span>
          </div>
        </StyledSubSubContainer>

        {totalLockedStake !== null && totalLockedStake > 0 ? (
          <>
            <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

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
