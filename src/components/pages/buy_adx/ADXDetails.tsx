import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import arrowIcon from '../../../../public/images/Icons/arrow-sm-45.svg';
import ADXHeader from './ADXHeader';
import { AprLmChart } from '../global/Apr/AprLmChart';

export default function ADXDetails({ className }: { className?: string }) {
  return (
    <div className={twMerge(className, 'flex flex-col gap-3')}>
      <ADXHeader />

      <div>
        <div className="flex flex-col gap-3 p-4 border rounded-xl">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm opacity-75">
                <span className="font-interSemibold">ADX</span> is Adrena's
                revenue share and governance token that is freely tradable on
                the open market. It's designed to align holders with the
                protocol's long-term success by conferring both economic and
                control benefits.
              </p>

              <p className="text-sm opacity-75 mt-4">
                <span className="font-interSemibold">Key Benefits:</span>
              </p>
              <ul>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  <span className="font-interSemibold">Revenue Share:</span> ADX
                  entitles the holder to receive a direct share of 20% of
                  protocol fees.
                </li>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  <span className="font-interSemibold">USDC Distribution:</span>{' '}
                  This revenue is distributed to ADX holders in USDC.
                </li>
                <li className="text-sm opacity-75 list-disc ml-4 mt-1">
                  <span className="font-interSemibold">Bonus Rewards:</span>{' '}
                  Duration locked ADX additionally receives ADX liquidity mining
                  rewards and multipliers on both USDC revenue and ADX rewards.
                </li>
              </ul>

              <p className="text-sm font-interMedium mt-2 bg-[linear-gradient(110deg,#a82e2e_40%,#f96a6a_60%,#a82e2e)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
                You may stake your $ADX in order to earn passive income from
                protocol revenue, and voting rights.
              </p>
            </div>
          </div>

          <div className="w-full h-[20em] flex items-center justify-center">
            <AprLmChart isAdxPage />
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
