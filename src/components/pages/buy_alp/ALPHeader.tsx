import Image from 'next/image';
import React from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useAPR from '@/hooks/useAPR';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { useSelector } from '@/store/store';

export default function ALPHeader() {
  const { aprs } = useAPR();
  const aumUsd = useAssetsUnderManagement();
  const tokenPriceALP = useSelector((s) => s.tokenPrices.ALP);

  const alpApr = aprs?.lp ?? null;

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
            <h1 className="font-interBold text-[1.5rem] sm:text-4xl">ALP</h1>
            {tokenPriceALP && (
              <span className="text-xl opacity-70 font-normal">
                ${tokenPriceALP.toFixed(4)}
              </span>
            )}
          </div>
        </div>
        <FormatNumber
          nb={aumUsd}
          format="currency"
          prefix="Current TVL: "
          className="text-sm font-mono opacity-50"
        />
      </div>

      <FormatNumber
        nb={alpApr}
        format="percentage"
        suffix="APR"
        precision={0}
        suffixClassName="font-interBold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
        className="font-interBold text-[1rem] sm:text-[1.5rem] bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
        isDecimalDimmed
      />
    </div>
  );
}
