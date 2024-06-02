import React from 'react';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/stake';
import { AlpLockPeriod, LockedStakeExtended } from '@/types';

export default function ALPStakeOverview({
  totalLockedStake,
  totalRedeemableLockedStake,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
  handleClickOnFinalizeLockedRedeem,
  className,
}: {
  totalLockedStake: number | null;
  totalRedeemableLockedStake: number | null;
  lockedStakes: LockedStakeExtended[] | null;
  handleLockedStakeRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnStakeMore: (initialLockPeriod: AlpLockPeriod) => void;
  handleClickOnClaimRewards: () => void;
  handleClickOnFinalizeLockedRedeem: (lockedStake: LockedStakeExtended) => void;
  className?: string;
}) {
  return (
    <StyledContainer
      className={className}
      title="ALP"
      subTitle="Shares of a Adrena Liquidity Pool"
      icon={window.adrena.client.alpToken.image}
    >
      <StyledSubContainer>
        <h1>Locked Staking</h1>

        <div className="mt-4 flex flex-col">
          <span className="text-lg">
            Provide liquidities long term: the longer the period, the higher the
            rewards.
          </span>
          <span className="text-lg">
            70% of protocol fees are distributed to ALP holder and stakers.
          </span>

          <ul>
            <li className="mt-4 text-lg">- Earn USDC rewards</li>
            <li className="mt-4 text-lg">
              - Locked principal becomes available at the end of the period,
              with the possibility to unstake earlier for a fee
            </li>
          </ul>
        </div>

        {totalLockedStake !== 0 ? (
          <StyledSubSubContainer className="mt-4">
            <h5 className="flex items-center">Locked</h5>

            <div>
              <FormatNumber nb={totalLockedStake} />
              <span className="ml-1">ALP</span>
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
                    token={window.adrena.client.alpToken}
                    handleRedeem={handleLockedStakeRedeem}
                    handleClickOnFinalizeLockedRedeem={
                      handleClickOnFinalizeLockedRedeem
                    }
                  />
                ))
              ) : (
                <div className="text-lg m-auto mt-4 mb-4 text-txtfade">
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
            disabled={!window.adrena.geoBlockingData.allowed}
            onClick={() =>
              handleClickOnStakeMore(DEFAULT_LOCKED_STAKE_DURATION)
            }
          />

          {(() => {
            if (totalRedeemableLockedStake !== 0)
              return (
                <Button
                  className="w-full mt-4"
                  disabled={!window.adrena.geoBlockingData.allowed}
                  variant="outline"
                  size="lg"
                  title="Claim Rewards *"
                  onClick={() => handleClickOnClaimRewards()}
                />
              );

            if (lockedStakes?.length)
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
            <span className="underline"> auto-claimed</span> every 18 days. You
            can manually claim rewards. The locked ALP tokens can be redeemed
            once the locking period is over.
          </span>
        ) : null}
      </StyledSubContainer>
    </StyledContainer>
  );
}
