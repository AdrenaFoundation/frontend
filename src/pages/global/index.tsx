import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { ChartData } from 'chart.js';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import GlobalHealthOverview from '@/components/pages/global/GlobalHealthOverview';
import TokenStakingOverview from '@/components/pages/global/TokenStakingOverview';
import UsageOverview from '@/components/pages/global/UsageOverview';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useStakingAccount from '@/hooks/useStakingAccount';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { nativeToUi } from '@/utils';

import monsterFace from '../../../public/images/monster-1.png';
import monsterFace2 from '../../../public/images/monster-2.png';

export const DEFAULT_LOCKED_STAKE_DURATION = 90;

export default function Global({ mainPool, custodies }: PageProps) {
  const alpStakingAccount = useStakingAccount(window.adrena.client.lpTokenMint);
  const adxStakingAccount = useStakingAccount(window.adrena.client.lmTokenMint);
  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;
  const adxPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;
  const alpTotalSupply = useALPTotalSupply();
  const adxTotalSupply = useADXTotalSupply();
  const composition = useALPIndexComposition(custodies);
  const [stakedAlpChartData, setStakedAlpChartData] =
    useState<ChartData<'bar'> | null>(null);
  const [stakedAdxChartData, setStakedAdxChartData] =
    useState<ChartData<'bar'> | null>(null);
  const [alpChartData, setAlpChartData] = useState<ChartData<'bar'> | null>(
    null,
  );
  const [utilizationChartData, setUtilizationChartData] =
    useState<ChartData<'bar'> | null>(null);

  useEffect(() => {
    if (!alpStakingAccount || !alpTotalSupply) {
      setStakedAlpChartData(null);
      return;
    }

    const alpLockedTokens = nativeToUi(
      alpStakingAccount.nbLockedTokens,
      window.adrena.client.alpToken.decimals,
    );
    const alpLiquidTokens = alpTotalSupply - alpLockedTokens;

    const alpStakeData = {
      label: ['staked', 'liquid'],
      value: [alpLockedTokens, alpLiquidTokens],
    };

    setStakedAlpChartData({
      labels: alpStakeData.label,
      datasets: [
        {
          label: 'ALP Pool stakes',
          data: alpStakeData?.value,
          backgroundColor: ['#36A2EB', '#FFCC66'],
          borderColor: ['#36A2EB', '#FFCC66'],
          borderWidth: 1,
        },
      ],
    });
  }, [alpStakingAccount, alpTotalSupply]);

  useEffect(() => {
    if (!window.adrena.client.readonlyConnection) return;

    if (!adxStakingAccount || !adxTotalSupply) {
      setStakedAdxChartData(null);
      return;
    }
    const adxLockedTokens = nativeToUi(
      adxStakingAccount.nbLockedTokens,
      window.adrena.client.adxToken.decimals,
    );
    const adxLiquidTokens = adxTotalSupply - adxLockedTokens;

    const adxStakeData = {
      label: ['staked', 'liquid'],
      value: [adxLockedTokens, adxLiquidTokens],
    };

    setStakedAdxChartData({
      labels: adxStakeData?.label,
      datasets: [
        {
          label: 'ADX Pool stakes',
          data: adxStakeData?.value,
          backgroundColor: ['#ff6384', '#4BC0C0'],
          borderColor: ['#ff6384', '#4BC0C0'],
          borderWidth: 1,
        },
      ],
    });
  }, [adxStakingAccount, adxTotalSupply]);

  useEffect(() => {
    if (composition === null) return setAlpChartData(null);

    setAlpChartData({
      labels: composition.map((comp) => comp.token.symbol),
      datasets: [
        {
          label: 'ALP Pool Current Composition',
          data: composition.map((comp) => comp.currentRatio),
          backgroundColor: composition.map((comp) => comp.color!) || [],
          borderColor: composition.map((comp) => comp.color!) || [],
          borderWidth: 1,
        },
      ],
    });

    setUtilizationChartData({
      labels: composition.map((comp) => comp.token.symbol),
      datasets: [
        {
          label: 'ALP Pool Utilization',
          data: composition.map((comp) => comp.utilization),
          backgroundColor: composition.map((comp) => comp.color!) || [],
          borderColor: composition.map((comp) => comp.color!) || [],
          borderWidth: 1,
        },
      ],
    });
  }, [composition]);

  const numberOpenedPositions =
    mainPool?.nbOpenLongPositions ?? 0 + (mainPool?.nbOpenShortPositions ?? 0);
  const totalPositionsValue =
    mainPool?.oiLongUsd ?? 0 + (mainPool?.oiShortUsd ?? 0);

  return (
    <div className="flex flex-row flex-wrap justify-center gap-4 p-4">
      <div className="fixed w-[100vw] h-[100vh] left-0 top-0 opacity-10">
        <Image
          src={monsterFace2}
          alt="monster"
          className="absolute hidden md:block bottom-0 left-[-30em] h-[100vh] w-[100vh] -z-10"
        />

        <Image
          src={monsterFace}
          alt="monster"
          className="absolute hidden md:block bottom-0 right-[-30em] h-[110vh] w-[110vh] scale-x-[-1] -z-10"
        />
      </div>

      {alpChartData ? (
        <GlobalHealthOverview
          compositionChartData={alpChartData}
          aumUsd={mainPool?.aumUsd ?? null}
          composition={composition ?? []}
          className="max-w-[30em]"
        />
      ) : null}

      {utilizationChartData ? (
        <UsageOverview
          utilizationChartData={utilizationChartData}
          numberOpenedPositions={numberOpenedPositions}
          totalPositionsValue={totalPositionsValue}
          className="max-w-[30em]"
        />
      ) : null}

      {stakedAlpChartData || stakedAdxChartData ? (
        <TokenStakingOverview
          alpChart={stakedAlpChartData}
          alpPrice={alpPrice}
          alpTotalSupply={alpTotalSupply}
          adxChart={stakedAdxChartData}
          adxPrice={adxPrice}
          adxTotalSupply={adxTotalSupply}
          className="max-w-[61em]"
        />
      ) : null}
    </div>
  );
}
