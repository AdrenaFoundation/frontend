import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '../../../../public/images/Icons/arrow-sm-45.svg';
import ADXLMChartWrapper from './ChartWrappers/ADXLMChartWrapper';
import ADXAPRChartWrapper from './ChartWrappers/ADXAPRChartWrapper';
import ADXHeader from './ADXHeader';

export default function ADXDetails({ className }: { className?: string }) {
  return (
    <div className={twMerge(className, 'flex flex-col gap-3')}>
      <ADXHeader />

      <div>
        <div className="flex flex-col gap-3 p-4 border rounded-xl">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-md font-interMedium mt-2  mb-4 bg-[linear-gradient(110deg,#FFFFFF_40%,#f96a6a_60%,#FFFFFF)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%] text-center">
                Stake ADX to start earning passive income from protocol revenue
                and voting rights.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <ADXLMChartWrapper />
            <ADXAPRChartWrapper />
          </div>

          <Link
            href="https://docs.adrena.xyz/tokenomics/adx"
            target="_blank"
            rel="noopener noreferrer"
            className="w-fit opacity-50 hover:opacity-100 transition-opacity duration-300 flex flex-row gap-2 items-center mt-3 cursor-pointer"
          >
            <p className="text-sm">Learn more</p>
            <Image src={arrowIcon} alt="arrow icon" className="w-2 h-2" />
          </Link>
        </div>
      </div>
    </div>
  );
}
