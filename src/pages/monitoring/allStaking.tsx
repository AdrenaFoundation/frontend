import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Modal from '@/components/common/Modal/Modal';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import AllStakingChartADX from '@/components/pages/global/AllStakingChart/AllStakingChartADX';
import UnlockStakingChart from '@/components/pages/global/AllStakingChart/UnlockStakingChart';
import { AprLmChart } from '@/components/pages/global/Apr/AprLmChart';
import StakingChart from '@/components/pages/global/Staking/StakingChart';
import StakingLeaderboard from '@/components/pages/monitoring/StakingLeaderboard';
import ViewProfileModal from '@/components/pages/profile/ViewProfileModal';
import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import { useAllUserProfilesMetadata } from '@/hooks/useAllUserProfilesMetadata';
import { useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getNonUserProfile } from '@/utils';

export default function AllStaking({
  view,
}: {
  isSmallScreen: boolean;
  view: string;
}) {
  const adxPrice: number | null =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const [displayStakedAdxAs, setDisplayStakedAdxAs] = useState<
    'usd' | 'amount'
  >('amount');

  const { allStakingStats } = useAllStakingStats();

  const totalSupplyADX = useADXTotalSupply();

  const circulatingSupplyADXNative = useADXCirculatingSupply({
    totalSupplyADX,
  });

  const { circulatingSupplyADX, totalStakedADX, percentStakedADX } =
    useMemo(() => {
      if (!circulatingSupplyADXNative || !adxPrice || !allStakingStats) {
        return {
          circulatingSupplyADX: null,
          totalSupplyADX: null,
          percentStakedAdx: null,
        };
      }

      if (displayStakedAdxAs === 'amount') {
        return {
          circulatingSupplyADX: circulatingSupplyADXNative,
          totalStakedADX:
            allStakingStats.byDurationByAmount.ADX.totalLocked +
            allStakingStats.byDurationByAmount.ADX.liquid,
          percentStakedADX:
            ((allStakingStats.byDurationByAmount.ADX.totalLocked +
              allStakingStats.byDurationByAmount.ADX.liquid) *
              100) /
            circulatingSupplyADXNative,
        };
      }

      const totalStakedADX =
        allStakingStats.byDurationByAmount.ADX.totalLocked +
        allStakingStats.byDurationByAmount.ADX.liquid;

      return {
        circulatingSupplyADX: circulatingSupplyADXNative * adxPrice,
        totalStakedADX:
          displayStakedAdxAs === 'usd'
            ? totalStakedADX * adxPrice
            : totalStakedADX,
        percentStakedADX:
          ((allStakingStats.byDurationByAmount.ADX.totalLocked +
            allStakingStats.byDurationByAmount.ADX.liquid) *
            100) /
          circulatingSupplyADXNative,
      };
    }, [
      circulatingSupplyADXNative,
      adxPrice,
      allStakingStats,
      displayStakedAdxAs,
    ]);

  useEffect(() => {
    if (view !== 'allStaking') return;
  }, [view]);

  const wallet = useSelector((s) => s.walletState.wallet);

  // Lift user profiles to page level - shared by leaderboard
  const { allUserProfilesMetadata } = useAllUserProfilesMetadata();

  const [activeProfile, setActiveProfile] =
    useState<UserProfileExtended | null>(null);

  return (
    <>
      <div className="flex flex-col gap-2 items-center justify-center">
        {/* Two-column layout: Stats on left, Leaderboard on right */}
        <div className="flex flex-col xl:flex-row gap-2 w-full items-stretch">
          {/* Left side - Stats */}
          <div className="flex flex-col gap-2 w-full xl:w-2/3">
            {/* Top container - smaller, fixed height */}
            <StyledContainer className="p-4">
              <div className="grid xl:grid-cols-2 gap-[2em] xl:h-[18em]">
                <div className="w-full flex h-[18em]">
                  <AprLmChart />
                </div>

                <div className="flex flex-col items-center justify-center gap-1 w-full">
                  <h2 className="flex">LOCKED STAKE REPARTITION</h2>

                  <div className="w-full flex h-[15em] -ml-[0.75rem]">
                    <StakingChart />
                  </div>
                </div>
              </div>
            </StyledContainer>

            {/* Bottom container */}
            <StyledContainer
              className="p-4 flex-1"
              bodyClassName="items-center justify-center flex relative h-full"
            >
              <div
                className="flex flex-col items-center justify-center gap-1 cursor-pointer"
                onClick={() =>
                  setDisplayStakedAdxAs(
                    displayStakedAdxAs === 'usd' ? 'amount' : 'usd',
                  )
                }
              >
                <h2 className="flex">STAKED ADX</h2>

                {allStakingStats && circulatingSupplyADX ? (
                  <Tippy
                    content={
                      <div className="text-sm flex">
                        Total staked ADX / Circulating supply ADX
                      </div>
                    }
                    placement="auto"
                  >
                    <div className="flex items-center gap-2">
                      <FormatNumber
                        nb={totalStakedADX}
                        prefix={displayStakedAdxAs === 'usd' ? '$' : ''}
                        isAbbreviate={true}
                        isAbbreviateIcon={false}
                        className="text-txtfade text-base"
                        isDecimalDimmed={false}
                      />

                      <span className="text-txtfade text-base font-mono">
                        {'/'}
                      </span>

                      <FormatNumber
                        nb={circulatingSupplyADX}
                        prefix={displayStakedAdxAs === 'usd' ? '$' : ''}
                        isAbbreviate={true}
                        isAbbreviateIcon={false}
                        className="text-txtfade text-base"
                        isDecimalDimmed={false}
                      />

                      <div className="flex">
                        <span className="text-txtfade text-base font-mono">
                          {'('}
                        </span>
                        <FormatNumber
                          nb={percentStakedADX}
                          className="text-txtfade text-base"
                          isDecimalDimmed={false}
                          format="percentage"
                        />
                        <span className="text-txtfade text-base font-mono">
                          {')'}
                        </span>
                      </div>
                    </div>
                  </Tippy>
                ) : null}
              </div>

              <div className="absolute top-2 right-4 text-sm flex gap-2">
                <div className="text-txtfade">Display as: </div>

                <div
                  onClick={() => setDisplayStakedAdxAs('amount')}
                  className={twMerge(
                    displayStakedAdxAs === 'amount' ? 'underline' : '',
                    'cursor-pointer',
                  )}
                >
                  Token Amount
                </div>

                <div
                  onClick={() => setDisplayStakedAdxAs('usd')}
                  className={twMerge(
                    displayStakedAdxAs === 'usd' ? 'underline' : '',
                    'cursor-pointer',
                  )}
                >
                  Usd
                </div>
              </div>

              <div className="flex w-full min-h-[15em] h-[20em] grow">
                <AllStakingChartADX
                  allStakingStats={allStakingStats}
                  displayAs={displayStakedAdxAs}
                />
              </div>

              <div className="flex flex-col items-center justify-center gap-1 w-full mt-4">
                <h2 className="flex">ADX STAKING REMAINING TIME</h2>

                <div className="w-full flex h-[20em]">
                  <UnlockStakingChart allStakingStats={allStakingStats} />
                </div>
              </div>
            </StyledContainer>
          </div>

          {/* Right side - Staking Leaderboard */}
          <div className="w-full xl:w-1/3 max-w-3xl xl:max-w-none mx-auto">
            <StyledContainer className="p-4 flex flex-col h-full">
              <h2 className="text-center mb-4">ADX STAKING LEADERBOARD</h2>
              <div className="flex-1">
                <StakingLeaderboard
                  walletAddress={wallet?.walletAddress || null}
                  allUserProfilesMetadata={allUserProfilesMetadata}
                  setProfile={async (wallet: PublicKey) => {
                    const p = await window.adrena.client.loadUserProfile({
                      user: wallet,
                    });

                    if (p === false) {
                      setActiveProfile(getNonUserProfile(wallet.toBase58()));
                    } else {
                      setActiveProfile(p);
                    }
                  }}
                />
              </div>
            </StyledContainer>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeProfile ? (
          <Modal
            className="h-[80vh] w-full overflow-y-auto"
            wrapperClassName="items-start w-full max-w-[70em] sm:mt-0"
            title=""
            close={() => setActiveProfile(null)}
            isWrapped={false}
          >
            <ViewProfileModal
              profile={activeProfile}
              close={() => setActiveProfile(null)}
            />
          </Modal>
        ) : null}
      </AnimatePresence>
    </>
  );
}
