import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import LockedStakedElement from '@/components/pages/stake/LockedStakedElement';
import { DEFAULT_LOCKED_STAKE_DURATION } from '@/pages/stake';
import { AlpLockPeriod, LockedStakeExtended } from '@/types';

import adxLogo from '../../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../../public/images/adrena_logo_alp_white.svg';

export default function StakeOverview({
  token,
  totalLockedStake,
  totalLiquidStaked,
  handleClickOnRedeem,
  totalRedeemableLockedStake,
  lockedStakes,
  handleLockedStakeRedeem,
  handleClickOnStakeMore,
  handleClickOnClaimRewards,
  handleClickOnFinalizeLockedRedeem,
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
}) {
  const isALP = token === 'ALP';

  return (
    <div className="flex flex-col bg-main rounded-2xl border">
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

      <div className="flex flex-col justify-between h-full">
        <div>
          {!isALP && (
            <>
              <div className="h-[1px] bg-bcolor w-full my-5" />
              <div className="px-5">
                <p className="opacity-50">Liquid stake</p>

                <div className="flex flex-row justify-between items-center border p-3 bg-secondary rounded-xl mt-3 shadow-lg">
                  <FormatNumber
                    nb={totalLiquidStaked}
                    suffix=" ADX"
                    className="text-xl"
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    title="Redeem"
                    className="px-5"
                    onClick={handleClickOnRedeem}
                    disabled={!window.adrena.geoBlockingData.allowed}
                  />
                </div>
              </div>
            </>
          )}

          <div className="h-[1px] bg-bcolor w-full my-5" />

          <span className="font-bold opacity-50 px-5">
            My Locked Stakes{' '}
            {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
          </span>

          <div className="flex flex-row flex-wrap gap-4 mt-3 px-5">
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
              <div className="text-lg m-auto mt-4 mb-4 text-txtfade">
                No Active Locked Stakes
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex gap-x-4 p-5 mt-auto">
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

          <p className="opacity-25 text-center w-full p-5 pt-0">
            * ADX and USDC rewards accrue automatically every ~6 hours and get
            <span className="underlines"> auto-claimed</span> every 18 days. You
            can manually claim rewards. The locked ALP tokens can be redeemed
            once the locking period is over.
          </p>
        </div>
      </div>
    </div>
  );
}
