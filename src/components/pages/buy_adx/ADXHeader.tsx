import Image from 'next/image';
import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import { useAllStakingStats } from '@/hooks/useAllStakingStats';
import { useSelector } from '@/store/store';

export default function ADXHeader() {
  const adxTotalSupply = useADXTotalSupply();
  const adxCirculatingSupply = useADXCirculatingSupply({
    totalSupplyADX: adxTotalSupply,
  });
  const { allStakingStats } = useAllStakingStats();
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const circulatingPercentage =
    adxTotalSupply && adxCirculatingSupply
      ? (adxCirculatingSupply / adxTotalSupply) * 100
      : null;

  const totalStaked = allStakingStats?.byDurationByAmount.ADX
    ? allStakingStats.byDurationByAmount.ADX.liquid +
      allStakingStats.byDurationByAmount.ADX.totalLocked
    : null;

  const stakedPercentage =
    adxCirculatingSupply && totalStaked
      ? (totalStaked / adxCirculatingSupply) * 100
      : null;

  const renderPrice = () => {
    if (tokenPriceADX === null || tokenPriceADX === undefined) {
      return (
        <div className="font-interBold text-[1rem] sm:text-[1.5rem] text-txtfade">
          $0.000
        </div>
      );
    }

    const formattedPrice = tokenPriceADX.toFixed(3);
    const [integer, decimal] = formattedPrice.split('.');

    return (
      <div className="font-interBold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#a82e2e_40%,#f96a6a_60%,#a82e2e)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]">
        ${integer}.{decimal}
      </div>
    );
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-between">
      <div>
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={window.adrena.client.adxToken.image}
            alt="adx icon"
            className="w-5 sm:w-7 h-5 sm:h-7"
          />
          <h1 className="font-interBold text-[1.5rem] sm:text-4xl">ADX</h1>
        </div>

        {/* Supply Metrics */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2">
            <FormatNumber
              nb={adxCirculatingSupply}
              format="number"
              prefix="Circulating Supply: "
              className="text-sm font-mono opacity-50"
              suffix=" ADX"
            />
            {circulatingPercentage && (
              <span className="text-xs font-mono opacity-40">
                ({circulatingPercentage.toFixed(1)}% of total)
              </span>
            )}
          </div>

          {totalStaked && (
            <div className="flex items-center gap-2">
              <FormatNumber
                nb={totalStaked}
                format="number"
                prefix="Staked: "
                className="text-sm font-mono opacity-50"
                suffix=" ADX"
              />
              {stakedPercentage && (
                <span className="text-xs font-mono opacity-40">
                  ({stakedPercentage.toFixed(1)}% of circulating)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {renderPrice()}
    </div>
  );
}
