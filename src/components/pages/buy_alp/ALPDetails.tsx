import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useAPR from '@/hooks/useAPR';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import usePoolInfo from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

import infoIcon from '../../../../public/images/Icons/info.svg';
import { AprLpChart } from '../global/Apr/AprLpChart';
import PoolRatios from '../monitoring/Data/PoolRatios';

export default function ALPDetails({
  mainPool,
  custodies,
  className,
}: {
  mainPool: PageProps['mainPool'];
  custodies: PageProps['custodies'];
  className?: string;
}) {
  const poolInfo = usePoolInfo(custodies)
  const { aprs } = useAPR();
  const aumUsd = useAssetsUnderManagement();

  const alpApr = aprs?.lp ?? null;

  const aumLiquidityRatio =
    mainPool && mainPool.aumSoftCapUsd > 0 && aumUsd !== null
      ? Math.round((aumUsd * 100) / mainPool.aumSoftCapUsd)
      : 0;

  return (
    <div className={twMerge(className, 'flex flex-col gap-6')}>
      <div>
        <div className="flex flex-row gap-2 items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <Image
              src={window.adrena.client.alpToken.image}
              alt="alp icon"
              className="w-5 sm:w-7 h-5 sm:h-7"
            />
            <h1 className='font-boldy text-[1.5rem] sm:text-4xl'>ALP</h1>
          </div>
          <FormatNumber
            nb={alpApr}
            format="percentage"
            suffix="APR"
            suffixClassName="font-archivoblack text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]"
            className="font-archivoblack text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]"
            isDecimalDimmed
          />
        </div>

        <div className="flex flex-row gap-2 items-center mt-3">
          <h2 className="font-boldy text-lg opacity-50 capitalize">Total Value Locked</h2>{' '}
          <Tippy
            content={
              <p className="font-medium">
                The total value of all assets in the pool
              </p>
            }
            placement="auto"
          >
            <Image src={infoIcon} width={14} height={14} alt="info icon" className='opacity-50' />
          </Tippy>
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 items-center mt-2">
          <FormatNumber
            nb={aumUsd}
            format="currency"
            className="text-[1.2rem] sm:text-[1.6rem] font-mono"
            precision={0}
          />
          <span className="text-[1.2rem] sm:text-[1.6rem] font-mono opacity-50">
            /
          </span>
          <FormatNumber
            nb={mainPool?.aumSoftCapUsd ?? null}
            format="currency"
            className="text-[1.2rem] sm:text-[1.6rem] font-mono opacity-50"
          />
        </div>

        <div className="flex-start flex h-2 w-full overflow-hidden rounded-full bg-bcolor font-sans text-xs font-medium mt-3">
          <div
            className={twMerge(
              'flex items-center justify-center h-full overflow-hidden break-all bg-gradient-to-r from-[#2C30DC] to-[#6029BA] rounded-full',
            )}
            style={{ width: `${aumLiquidityRatio}%` }}
          ></div>
        </div>
      </div>

      <div className='p-4 border rounded-xl h-[15em] sm:h-[20em] w-full'>
        <AprLpChart isSmallScreen={false} />
      </div>

      <PoolRatios poolInfo={poolInfo} />


    </div>
  );
}
