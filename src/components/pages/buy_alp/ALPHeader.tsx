import Image from 'next/image';
import { useMemo } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useAPR from '@/hooks/useAPR';
import useMainPool from '@/hooks/useMainPool';
import { useSelector } from '@/store/store';

export default function ALPHeader() {
  const { aprs } = useAPR();
  const mainPool = useMainPool();
  const tokenPriceALP = useSelector((s) => s.tokenPrices.ALP);

  const alpApr = aprs?.lp ?? null;

  const poolUsage = useMemo(() => {
    if (
      !mainPool ||
      typeof mainPool.oiLongUsd !== 'number' ||
      typeof mainPool.oiShortUsd !== 'number' ||
      typeof mainPool.aumUsd !== 'number'
    ) {
      return null;
    }

    const totalOI = mainPool.oiLongUsd + mainPool.oiShortUsd;
    const aumUsd = mainPool.aumUsd;

    if (totalOI === 0 || aumUsd === 0) return null;

    return {
      totalUsageUsd: totalOI,
      totalUsagePercentage: (totalOI / aumUsd) * 100,
      longUsageUsd: mainPool.oiLongUsd,
      shortUsageUsd: mainPool.oiShortUsd,
      longPercentage: (mainPool.oiLongUsd / totalOI) * 100,
      shortPercentage: (mainPool.oiShortUsd / totalOI) * 100,
    };
  }, [mainPool]);

  return (
    <div className="flex flex-row gap-2 items-start justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Image
            src={window.adrena.client.alpToken.image}
            alt="alp icon"
            className="w-5 sm:w-7 h-5 sm:h-7"
          />

          <div className="flex flex-row items-center gap-4">
            <h1 className="font-bold text-[1.5rem] sm:text-4xl">ALP</h1>
          </div>
        </div>

        <div>
          <FormatNumber
            nb={mainPool?.aumUsd}
            format="currency"
            prefix="Total TVL: "
            className="text-sm font-mono opacity-50"
          />

          <div className="flex items-center gap-2">
            <FormatNumber
              nb={poolUsage?.totalUsageUsd}
              format="currency"
              prefix="Pool Usage: "
              className="text-sm font-mono opacity-50"
            />
            {poolUsage && poolUsage.totalUsagePercentage !== null ? (
              <>
                <span className="text-sm font-mono opacity-90">
                  ({poolUsage.totalUsagePercentage.toFixed(0)}%)
                </span>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <FormatNumber
          nb={alpApr}
          format="percentage"
          suffix="APR"
          precision={0}
          suffixClassName="font-bold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
          className="font-bold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
          isDecimalDimmed
        />
        {tokenPriceALP != null ? (
          <span className="text-xl font-semibold">
            ${tokenPriceALP.toFixed(4)}
          </span>
        ) : null}
      </div>
    </div>
  );
}
