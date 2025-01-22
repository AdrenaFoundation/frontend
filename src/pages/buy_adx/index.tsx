import React from 'react';

import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import ADXVoteAnimation from '@/components/buy_adx/ADXVoteAnimation';
import Button from '@/components/common/Button/Button';
import StakeAnimation from '@/components/pages/buy_alp_adx/StakeAnimation/StakeAnimation';
import { PageProps } from '@/types';

import jupIcon from '../../../public/images/jup-logo.png';

export default function BuyADX({ }: PageProps) {
  return (
    <div className="px-7">
      <div className="relative flex flex-col justify-center items-start w-full mb-[150px] sm:mb-0">

        <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

        <div className="flex flex-col lg:flex-row items-center justify-between pt-[50px] mb-[150px] lg:mb-0 lg:h-[800px] w-full z-10">
          <div>
            <h1 className="text-[2.6rem] sm:text-[4rem] uppercase max-w-[840px]">
              DIRECTLY CAPTURE REVENUE AND INFLUENCE THE PROTOCOL WITH THE
              ADRENA TOKEN
            </h1>

            <p className="text-[1.4rem] max-w-[640px] text-txtfade mb-6 z-10">
              Accumulate and stake ADX to get proportional control and economic
              value capture.
            </p>

            <Button
              title="Buy ADX on Jupiter"
              href="https://jup.ag/swap/USDC-AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw"
              isOpenLinkInNewTab
              rightIcon={jupIcon}
              iconClassName="w-5 h-5"
              size="lg"
              className="mt-4 px-14 py-3 text-base"
            />
          </div>

          {/* <div className="mx-auto lg:mx-0 lg:mb-auto">
            <IntegratedTerminal
              connected={connected}
              activeRpc={activeRpc}
              className="w-full lg:w-[400px] h-[700px]"
            />
          </div> */}
        </div>
      </div>

      <div className="relative flex flex-col lg:flex-row gap-12 justify-between items-center w-full mb-[150px] sm:mb-[250px]">
        <div className="relative">
          <h1 className="text-[36px] mb-1">GET PASSIVE INCOME</h1>
          <p className="text-[24px] max-w-[600px]">
            Staked ADX receives 20% of protocol revenue in direct USDC airdrops.
          </p>
          <Button
            size="lg"
            title="Stake ADX"
            href={'/stake'}
            className="mt-3"
          />
        </div>

        <ADXFeeStreamAnimation token="ADX" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12 justify-between items-center w-full mb-[150px] sm:mb-[250px]">
        <div>
          <h1 className="text-[46px] mb-1">
            1 ADX = 1 VOTE, EXERCISE GOVERNANCE
          </h1>
          {/* <p className="text-[24px] max-w-[800px]">1 ADX = 1 VOTE</p> */}
        </div>

        <ADXVoteAnimation />
      </div>

      <StakeAnimation
        isADX
        title="GET BONUS REWARDS"
        subtitle="Duration lock ADX for bonus USDC yield and ADX token rewards. The longer you lock, the higher the multipliers."
      />
    </div>
  );
}
