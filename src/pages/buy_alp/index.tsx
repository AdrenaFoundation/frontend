import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import ALPSwap from '@/components/pages/buy_alp_adx/ALPSwap/ALPSwap';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { PageProps } from '@/types';

import infoIcon from '../../../public/images/Icons/info.svg';

export default function Buy({ connected, mainPool }: PageProps) {
  const aumUsd = useAssetsUnderManagement();
  const aumLiquidityRatio =
    mainPool && mainPool.aumSoftCapUsd > 0 && aumUsd !== null
      ? Math.round((aumUsd * 100) / mainPool.aumSoftCapUsd)
      : 0;

  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-4 pb-[150px] p-[20px] sm:p-[50px] w-full max-w-[1500px] m-auto">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-30 bg-cover bg-center bg-no-repeat bg-[url('/images/wallpaper.jpg')]" />

      <div className="flex flex-col justify-center items-start z-10 xl:h-[45em]">
        <h1 className="font-archivoblack text-[2.6rem] lg:text-[4rem] uppercase max-w-[840px] -translate-y-6">
          Buy ALP, receive 70% of all revenues
        </h1>

        <div className="w-full">
          <div className="flex flex-row gap-2 items-center">
            <h2 className="font-archivoblack">TOTAL VALUE LOCKED</h2>{' '}
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
          <div className="flex-start flex h-3 w-full overflow-hidden rounded-full bg-bcolor font-sans text-xs font-medium mt-6 p-1">
            <div
              className={twMerge(
                'flex items-center justify-center h-full overflow-hidden break-all bg-gradient-to-r from-[#2C30DC] to-[#6029BA] rounded-full',
              )}
              style={{ width: `${aumLiquidityRatio}%` }}
            ></div>
          </div>
        </div>

        <div className="mt-[50px]">
          <div className="p-3 pl-6 border-l-2 border-white">
            <h3 className="font-boldy text-lg">GET PASSIVE INCOME</h3>
            <p className="text-base opacity-75 max-w-96">
              The value of each share of ALP naturally appreciates as fee
              revenue grows.
            </p>
          </div>

          <div className="p-3 pl-6 border-l-2 border-white mt-7">
            <h3 className="font-boldy text-lg">GET BONUS REWARDS</h3>
            <p className="text-base opacity-75 max-w-96">
              Duration lock ALP for bonus USDC yield and ADX token rewards.
              The longer you lock, the higher the yield multipliers.
            </p>
          </div>
        </div>
      </div>

      <StyledContainer className="max-w-[400px] lg:max-w-[25em] mb-auto">
        <ALPSwap connected={connected} />
      </StyledContainer>
    </div>


  );
}
