import React from 'react';

import ADXDetails from '@/components/pages/buy_adx/ADXDetails';
import ADXSwap from '@/components/pages/buy_adx/ADXSwap/ADXSwap';
import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import ADXVoteAnimation from '@/components/buy_adx/ADXVoteAnimation';
import Button from '@/components/common/Button/Button';
import StakeAnimation from '@/components/pages/buy_adx/StakeAnimation/StakeAnimation';
import { PageProps } from '@/types';
import { WalletAdapterExtended } from '@/types';
import { Connection } from '@solana/web3.js';

import jupIcon from '../../../public/images/jup-logo.png';

export default function BuyADX({ connected, adapters, activeRpc }: PageProps) {
  return (
    <>
      {/* Container 1: Constrained width for details + swap (like ALP page) */}
      <div className="flex flex-col gap-4 mt-4 pb-[150px] p-[20px] w-full max-w-[1300px] m-auto">
        {/* Section 1: Two-Column Layout */}
        <div className="flex flex-col lg:flex-row justify-between gap-4">
          <ADXDetails className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border basis-4/6 sm:h-fit" />

          <div className="basis-2/6 flex flex-col gap-4">
            <ADXSwap
              connected={connected}
              adapters={adapters}
              activeRpc={activeRpc}
              className="relative z-10 bg-secondary p-3 sm:p-5 rounded-xl border h-fit"
            />
          </div>
        </div>
      </div>

      {/* Container 2: Full width for hero and content sections */}
      <div className="w-[90%] m-auto">
        {/* Section 2: Hero Section */}
        <div className="relative flex flex-col justify-center items-start w-full mb-[150px] sm:mb-0">
          <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

          <div className="flex flex-col lg:flex-row items-center justify-between pt-[50px] mb-[150px] lg:mb-0 lg:h-[800px] w-full z-10 px-[20px]">
            <div>
              <h1 className="text-[2.6rem] sm:text-[4rem] uppercase max-w-[840px] font-black">
                DIRECTLY CAPTURE REVENUE AND INFLUENCE THE PROTOCOL WITH THE
                ADRENA TOKEN
              </h1>

              <p className="text-[1.4rem] max-w-[640px] text-txtfade mb-6 z-10">
                Accumulate and stake ADX to get proportional control and
                economic value capture.
              </p>

              <Button
                title="Buy ADX on Jupiter"
                href="https://jup.ag/swap/SOL-AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw"
                isOpenLinkInNewTab
                rightIcon={jupIcon}
                iconClassName="w-5 h-5"
                size="lg"
                className="mt-4 px-14 py-3 text-base"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Passive Income Section - Combined with Bonus Rewards */}
        <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full mb-[150px] sm:mb-[250px] px-[20px]">
          <div className="relative">
            <h1 className="text-[36px] mb-1 font-black">
              GET PASSIVE INCOME & BONUS REWARDS
            </h1>
            <p className="text-[24px] max-w-[600px]">
              Staked ADX receives 20% of protocol revenue in direct USDC
              airdrops. Duration lock ADX for bonus USDC yield and ADX token
              rewards. The longer you lock, the higher the multipliers.
            </p>
            <Button
              size="lg"
              title="Stake ADX"
              href={'/stake'}
              className="mt-3"
            />
          </div>

          <StakeAnimation isADX title="" subtitle="" />
        </div>

        {/* Section 4: Governance Section */}
        <div className="flex flex-col lg:flex-row gap-12 justify-between items-center w-full mb-[150px] sm:mb-[250px] px-[20px]">
          <div>
            <h1 className="text-[46px] mb-1 font-black">
              1 ADX = 1 VOTE, EXERCISE GOVERNANCE
            </h1>
          </div>

          <ADXVoteAnimation />
        </div>
      </div>
    </>
  );
}
