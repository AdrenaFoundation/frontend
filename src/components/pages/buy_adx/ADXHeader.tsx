import Image from 'next/image';
import React, { useMemo } from 'react';

import FormatNumber from '@/components/Number/FormatNumber';
import useADXCirculatingSupply from '@/hooks/useADXCirculatingSupply';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useAPR from '@/hooks/useAPR';
import useStakingAccount from '@/hooks/useStakingAccount';
import { useSelector } from '@/store/store';
import { nativeToUi } from '@/utils';

export default function ADXHeader() {
  const adxTotalSupply = useADXTotalSupply();
  const adxCirculatingSupply = useADXCirculatingSupply({
    totalSupplyADX: adxTotalSupply,
  });
  const { aprs } = useAPR();
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);

  const { stakingAccount: adxStakingAccount } = useStakingAccount(
    window.adrena.client.lmTokenMint,
  );

  const stakingData = useMemo(() => {
    if (!adxStakingAccount) return null;

    const decimals = adxStakingAccount.stakedTokenDecimals;

    const totalLiquidStaked = nativeToUi(
      adxStakingAccount.nbLiquidTokens,
      decimals,
    );
    const totalLockedStaked = nativeToUi(
      adxStakingAccount.nbLockedTokens,
      decimals,
    );
    const totalStaked = totalLiquidStaked + totalLockedStaked;

    return {
      totalStaked,
      circulatingPercentage:
        adxTotalSupply && adxCirculatingSupply
          ? (adxCirculatingSupply / adxTotalSupply) * 100
          : null,
      stakedPercentage:
        adxCirculatingSupply && totalStaked
          ? (totalStaked / adxCirculatingSupply) * 100
          : null,
    };
  }, [adxStakingAccount, adxTotalSupply, adxCirculatingSupply]);

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
            {tokenPriceADX != null ? (
              <span className="text-xl opacity-90 font-normal">
                ${tokenPriceADX.toFixed(4)}
              </span>
            ) : null}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <FormatNumber
              nb={adxCirculatingSupply}
              format="number"
              prefix="Circulating: "
              className="text-sm font-mono opacity-50"
              suffix="ADX"
            />
            {stakingData?.circulatingPercentage != null ? (
              <span className="text-sm font-mono opacity-90">
                ({stakingData.circulatingPercentage.toFixed(1)}%)
              </span>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <FormatNumber
              nb={stakingData?.totalStaked}
              format="number"
              prefix="Staked: "
              className="text-sm font-mono opacity-50"
              suffix="ADX"
            />
            {stakingData?.stakedPercentage != null ? (
              <span className="text-sm font-mono opacity-90">
                ({stakingData.stakedPercentage.toFixed(1)}%)
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <FormatNumber
        nb={aprs?.lm}
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
