import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import Loader from '@/components/Loader/Loader';
import FormatNumber from '@/components/Number/FormatNumber';
import RewardsAnimation from '@/components/pages/buy_alp_adx/RewardsAnimation/RewardsAnimation';
import StakeAnimation from '@/components/pages/buy_alp_adx/StakeAnimation/StakeAnimation';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { useDebounce } from '@/hooks/useDebounce';
import { useSelector } from '@/store/store';
import { PageProps, Token } from '@/types';
import { nativeToUi, uiToNative } from '@/utils';

import infoIcon from '../../../public/images/Icons/info.svg';
import ALPSwap from '@/components/pages/buy_alp_adx/ALPSwap/ALPSwap';

// use the counter to handle asynchronous multiple loading
// always ignore outdated information
let loadingCounter = 0;

export type FeesAndAmountsType = {
  [tokenSymbol: string]: {
    token: Token;
    fees: number | null;
    amount: number | null;
    equivalentAmount: number | null;
  };
};

export default function Buy({
  connected,
  triggerWalletTokenBalancesReload,
  mainPool,
}: PageProps) {
  const aumUsd = useAssetsUnderManagement();
  const aumLiquidityRatio =
    mainPool && mainPool.aumSoftCapUsd > 0 && aumUsd !== null
      ? Math.round((aumUsd * 100) / mainPool.aumSoftCapUsd)
      : 0;

  return (
    <div className="flex flex-col gap-[150px] sm:gap-[250px] mx-5 sm:mx-10 mt-[150px] lg:mt-[50px]">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 p-4 lg:h-[800px]">
        <div className="absolute w-full h-full left-0 top-0 opacity-20">
          <RiveAnimation
            animation="fred-bg"
            layout={
              new Layout({
                fit: Fit.Fill,
                alignment: Alignment.TopLeft,
              })
            }
            className="absolute top-0 left-0 h-full w-full scale-x-[-1]"
            imageClassName="absolute top-0 left-0 w-[300px] sm:w-[400px] scale-x-[-1]"
          />

          <RiveAnimation
            animation="fred-bg"
            layout={
              new Layout({
                fit: Fit.Fill,
                alignment: Alignment.TopRight,
              })
            }
            className="absolute top-0 right-0 w-full h-full scale-y-[-1.2]"
            imageClassName="absolute top-0 right-0 w-[300px] sm:w-[400px] scale-y-[-1.2]"
          />
        </div>

        <div className="flex flex-col justify-center items-start z-10 -translate-y-28">
          <h1 className="text-[2.6rem] lg:text-[4rem] uppercase max-w-[640px]">
            Buy ALP, receive 70% of all revenues
          </h1>
          <div className="w-full max-w-[640px] h-[1px] bg-bcolor my-8" />
          <div className="w-full">
            <div className="flex flex-row gap-2 items-center">
              <h2>TOTAL VALUE LOCKED</h2>{' '}
              <Tippy
                content={
                  <p className="font-medium">
                    The total value of all assets in the pool
                  </p>
                }
                placement="auto"
              >
                <Image src={infoIcon} width={16} height={16} alt="info icon" />
              </Tippy>
            </div>
            <div className="flex flex-row gap-2 sm:gap-3 items-center mt-3">
              <FormatNumber
                nb={aumUsd}
                format="currency"
                className="text-[1.2rem] sm:text-[2.4rem] font-bold"
                precision={0}
              />
              <span className="text-[1.2rem] sm:text-[2rem] font-bold opacity-50">
                /
              </span>
              <FormatNumber
                nb={mainPool?.aumSoftCapUsd ?? null}
                format="currency"
                className="text-[1.2rem] sm:text-[2rem] font-bold opacity-50"
              />
            </div>
            <div className="flex-start flex h-4 w-full overflow-hidden rounded-full bg-bcolor font-sans text-xs font-medium mt-6 p-1">
              <div
                className={twMerge(
                  'flex items-center justify-center h-full overflow-hidden break-all bg-gradient-to-r from-[#2C30DC] to-[#6029BA] rounded-full',
                )}
                style={{ width: `${aumLiquidityRatio}%` }}
              ></div>
            </div>
          </div>
        </div>

        <StyledContainer className="max-w-[400px] lg:max-w-[25em] mb-auto">
          <ALPSwap
            triggerWalletTokenBalancesReload={triggerWalletTokenBalancesReload}
            connected={connected}
          />
        </StyledContainer>
      </div>

      <RewardsAnimation />

      <StakeAnimation
        title="GET BONUS REWARDS"
        subtitle="Duration lock ALP for bonus USDC yield and ADX token rewards. The
          longer you lock, the higher the yield multipliers."
      />
    </div>
  );
}
