import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useAPR from '@/hooks/useAPR';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import usePoolInfo from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

import arrowIcon from '../../../../public/images/Icons/arrow-sm-45.svg';
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
  const poolInfo = usePoolInfo(custodies);
  const { aprs } = useAPR();
  const aumUsd = useAssetsUnderManagement();

  const alpApr = aprs?.lp ?? null;

  // const aumLiquidityRatio =
  //   mainPool && mainPool.aumSoftCapUsd > 0 && aumUsd !== null
  //     ? Math.round((aumUsd * 100) / mainPool.aumSoftCapUsd)
  //     : 0;

  return (
    <div className={twMerge(className, 'flex flex-col gap-3')}>
      <div className="flex flex-row gap-2 items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={window.adrena.client.alpToken.image}
            alt="alp icon"
            className="w-5 sm:w-7 h-5 sm:h-7"
          />
          <h1 className="font-interBold text-[1.5rem] sm:text-4xl">ALP</h1>
        </div>

        <FormatNumber
          nb={alpApr}
          format="percentage"
          suffix="APR"
          precision={0}
          suffixClassName="font-interBold text-[1rem] sm:text-[1.3rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]"
          className="font-interBold text-[1rem] sm:text-[1.3rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] tracking-[0.3rem]"
          isDecimalDimmed
        />
      </div>

      {/* <div className="flex-start flex h-2 w-full overflow-hidden rounded-full bg-bcolor font-sans text-xs font-medium mt-3">
          <div
            className={twMerge(
              'flex items-center justify-center h-full overflow-hidden break-all bg-gradient-to-r from-[#2C30DC] to-[#6029BA] rounded-full',
            )}
            style={{ width: `${aumLiquidityRatio}%` }}
          ></div>
        </div> */}

      <div>
        <div className="flex flex-col sm:flex-row gap-3  border rounded-xl h-[15em] sm:h-[20em]">
          <div className="flex flex-col justify-between p-4 flex-1">
            <div>
              <p className="opacity-50 font-boldy text-sm mb-1">About</p>
              <p className="text-sm opacity-75">
                <span className="font-interSemibold">
                  The Adrena Liquidity Provider (ALP) Pool
                </span>{' '}
                is a liquidity pool where it acts as a counterparty to traders —
                when traders seek to open leverage positions, they borrow tokens
                from the pool.
              </p>
              <p className="text-sm opacity-75 mt-4 mb-2">
                <span className="font-interSemibold">The ALP token</span> is the
                liquidity provider token where it&apos;s value is derived from:
              </p>
              <ul>
                <li className="text-sm opacity-75 list-disc ml-4">
                  An index fund of SOL, ETH, WBTC, USDC, USDT.
                </li>
                <li className="text-sm opacity-75 list-disc ml-4">
                  Trader&apos;s profit and loss
                </li>
                <li className="text-sm opacity-75 list-disc ml-4">
                  75% of the generated fees from opening and closing fees, price
                  impact, borrowing fees, and trading fees of the pool
                </li>
              </ul>
            </div>

            <Link
              href="https://docs.adrena.xyz/tokenomics/alp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit opacity-50 hover:opacity-100 transition-opacity duration-300 flex flex-row gap-2 items-center mt-3 cursor-pointer"
            >
              <p className="text-sm">Learn more</p>
              <Image src={arrowIcon} alt="arrow icon" className="w-2 h-2" />
            </Link>
          </div>

          <div className="p-4 flex-1">
            <AprLpChart isSmallScreen={false} />
          </div>
        </div>
      </div>

      {/* <div className='w-full h-[1px] my-3' /> */}

      <div className="mt-4">
        <div className="flex flex-row gap-2 items-center">
          <h2 className="font-boldy text-base opacity-50 capitalize">
            Total Value Locked
          </h2>{' '}
          <Tippy
            content={
              <p className="font-medium">
                The total value of all assets in the pool
              </p>
            }
            placement="auto"
          >
            <Image
              src={infoIcon}
              width={14}
              height={14}
              alt="info icon"
              className="opacity-50"
            />
          </Tippy>
        </div>

        <div className="flex flex-col gap-1 mt-2">
          <FormatNumber
            nb={aumUsd}
            format="currency"
            className="text-[1.2rem] sm:text-[2rem] font-interBold"
            precision={0}
          />

          <FormatNumber
            nb={mainPool?.aumSoftCapUsd ?? null}
            format="currency"
            prefix="Max: "
            className="text-sm font-mono opacity-50"
          />
        </div>
      </div>

      <PoolRatios poolInfo={poolInfo} />
    </div>
  );
}
