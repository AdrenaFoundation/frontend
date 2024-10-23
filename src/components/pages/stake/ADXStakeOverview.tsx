import React from 'react';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_LOCK_DURATION } from '@/pages/stake';
import { AdxLockPeriod, LockedStakeExtended } from '@/types';

export default function ADXStakeOverview({
  totalLiquidStaked,
  totalLockedStake,
  totalRedeemableLockedStake,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnRedeem,
  handleClickOnClaimRewards,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
  className,
}: {
  totalLiquidStaked: number | null;
  totalLockedStake: number | null;
  totalRedeemableLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnStakeMore: (initialLockPeriod: AdxLockPeriod) => void;
  handleClickOnRedeem: () => void;
  handleClickOnClaimRewards: () => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnUpdateLockedStake: (
    lockedStake: LockedStakeExtended,
  ) => Promise<void>;
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
        <h1>Liquid Staking</h1>

        <ul>
          <li className="mt-2">
            <span className="text-base text-txtfade">
              - Get 1:1 voting power to participate in the protocol&apos;s
              governance
            </span>
          </li>
          <li>
            <span className="text-base text-txtfade">
              - Unstake at any time, if not participating in an active vote
            </span>
          </li>
        </ul>

        {totalLiquidStaked !== 0 ? (
          <StyledSubSubContainer className="mt-4">
            <h5 className="flex items-center">Total stake</h5>

            <div>
              <FormatNumber
                nb={totalLiquidStaked}
                minimumFractionDigits={2}
              />
              <span className="ml-1">ADX</span>
            </div>
          </StyledSubSubContainer>
        ) : null}

        <div className="flex gap-x-4">
          <Button
            className="w-full mt-4 ml-auto"
            variant="primary"
            size="lg"
            title={totalLiquidStaked !== 0 ? 'Stake More' : 'Stake'}
            onClick={() => handleClickOnStakeMore(0)}
          />

          {totalLiquidStaked !== 0 ? (
            <Button
              className="w-full mt-4"
              variant="outline"
              size="lg"
              title="Redeem"
              onClick={() => handleClickOnRedeem()}
            />
          ) : null}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <h1>Locked Staking</h1>

        <div className="mt-4 flex flex-col">
          <span className="text-base text-txtfade">
            Align with the protocol long term success: the longer the period,
            the higher the rewards.
          </span>
          <span className="text-base text-txtfade">
            20% of protocol fees are distributed to ADX stakers.
          </span>

          <ul className="mt-2">
            <li>
              <span className="text-base text-txtfade">
                - Get amplified voting power to participate in the
                protocol&apos;s governance{' '}
              </span>
            </li>
            <li>
              <span className="text-base text-txtfade">
                - Earn USDC rewards (20% of protocol fees distributed to
                stakers)
              </span>
            </li>
            <li>
              <span className="text-base text-txtfade">
                - Earn extra ADX rewards
              </span>
            </li>
            <li>
              <span className="text-base text-txtfade">
                - Locked principal becomes available at the end of the period,
                with the possibility to unstake earlier for a fee
              </span>
            </li>
          </ul>
        </div>

        {totalLockedStake !== 0 ? (
          <StyledSubSubContainer className="mt-4">
            <h5 className="flex items-center">Locked</h5>

            <div>
              <FormatNumber
                nb={totalLockedStake}
                minimumFractionDigits={2}
              />
              <span className="ml-1">ADX</span>
            </div>
          </StyledSubSubContainer>
        ) : null}

        {totalLockedStake !== null && totalLockedStake > 0 ? (
          <>
            <div className="h-[1px] bg-bcolor w-full mt-4 mb-2" />

            <span className="font-bold opacity-50">
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
                    handleClickOnFinalizeLockedRedeem={
                      handleClickOnFinalizeLockedRedeem
                    }
                    handleClickOnUpdateLockedStake={
                      handleClickOnUpdateLockedStake
                    }
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
            title={totalLockedStake !== 0 ? 'Stake More' : 'Stake'}
            onClick={() =>
              handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_LOCK_DURATION)
            }
          />

          {(() => {
            if (totalRedeemableLockedStake !== 0 || totalLiquidStaked !== 0)
              return (
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  size="lg"
                  title="Claim Rewards *"
                  onClick={() => handleClickOnClaimRewards()}
                />
              );

            if (lockedStakes?.length && totalLiquidStaked === 0)
              return (
                <Button
                  className="w-full mt-4 opacity-70 text-opacity-70"
                  disabled={true}
                  variant="outline"
                  size="lg"
                  title="Claim Rewards *"
                />
              );
          })()}
        </div>
        {lockedStakes?.length ? (
          <span className="mt-4 text-sm opacity-50">
            * ADX and USDC rewards accrue automatically every ~6 hours and get
            <span className="underline"> auto-claimed</span> every ~8 days. You
            can manually claim rewards. The locked ADX tokens can be redeemed
            once the locking period is over. Rewards from liquid and locked
            stake are claimed together.
          </span>
        ) : null}
      </StyledSubContainer>
    </StyledContainer>
  );
}
