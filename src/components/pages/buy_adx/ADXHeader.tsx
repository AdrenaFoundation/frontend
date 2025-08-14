import Image from 'next/image';
import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useADXHeaderData from '@/hooks/useADXHeaderData';

export default function ADXHeader() {
  const {
    circulatingSupply,
    totalStaked,
    tokenPrice,
    apr,
    circulatingPercentage,
    stakedPercentage,
  } = useADXHeaderData();

  return (
    <div className="flex flex-row gap-2 items-start justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            alt="adx icon"
            className="w-5 sm:w-7 h-5 sm:h-7"
          />
          <div className="flex flex-row items-center gap-4">
            <h1 className="font-interBold text-[1.5rem] sm:text-4xl">ADX</h1>
            {tokenPrice && (
              <span className="text-xl opacity-90 font-normal">
                ${tokenPrice.toFixed(4)}
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <FormatNumber
              nb={circulatingSupply}
              format="number"
              prefix="Circulating: "
              className="text-sm font-mono opacity-50"
            />
            {circulatingPercentage && (
              <span className="text-sm font-mono opacity-90">
                ({circulatingPercentage.toFixed(1)}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <FormatNumber
              nb={totalStaked}
              format="number"
              prefix="Staked: "
              className="text-sm font-mono opacity-50"
            />
            {stakedPercentage && (
              <span className="text-sm font-mono opacity-90">
                ({stakedPercentage.toFixed(1)}%)
              </span>
            )}
          </div>
        </div>
      </div>

      <FormatNumber
        nb={apr}
        format="percentage"
        suffix="APR"
        precision={0}
        suffixClassName="font-interBold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#a82e2e_40%,#f96a6a_60%,#a82e2e)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
        className="font-interBold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#a82e2e_40%,#f96a6a_60%,#a82e2e)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
        isDecimalDimmed
      />
    </div>
  );
}
