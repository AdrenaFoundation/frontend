/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { ChartData } from 'chart.js';
import React, { useEffect, useState } from 'react';

import CoinsOverview from '@/components/pages/global/CoinsOverview';
import GlobalHealthOverview from '@/components/pages/global/GlobalHealthOverview';
import UsageOverview from '@/components/pages/global/UsageOverview';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import useStakingAccount from '@/hooks/useStakingAccount';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { nativeToUi } from '@/utils';

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
          backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
          borderColor: ['rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
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
          backgroundColor: ['rgb(255, 99, 132)', 'rgb(75, 192, 192)'],
          borderColor: ['rgb(255, 99, 132)', 'rgb(75, 192, 192)'],
          borderWidth: 1,
        },
      ],
    });
  }, [adxStakingAccount, adxTotalSupply]);

  useEffect(() => {
    if (composition === null) return setAlpChartData(null);

    setAlpChartData({
      labels: composition?.map((comp) => comp.token.symbol),
      datasets: [
        {
          label: 'ALP Pool Current Composition',
          data: composition?.map((comp) => comp.currentRatio!) || [],
          backgroundColor: composition?.map((comp) => comp.color!) || [],
          borderColor: composition?.map((comp) => comp.color!) || [],
          borderWidth: 1,
        },
      ],
    });

    setUtilizationChartData({
      labels: composition?.map((comp) => comp.token.symbol),
      datasets: [
        {
          label: 'ALP Pool Utilization',
          data: composition?.map((comp) => comp.utilization!) || [],
          backgroundColor: composition?.map((comp) => comp.color!) || [],
          borderColor: composition?.map((comp) => comp.color!) || [],
          borderWidth: 1,
        },
      ],
    });
  }, [composition]);

  return (
    <>
      <div className="absolute w-full h-full left-0 top-0 overflow-hidden">
        <RiveAnimation
          animation="mid-monster"
          layout={new Layout({ fit: Fit.Fill, alignment: Alignment.TopLeft })}
          className={
            'absolute top-0 left-0 rotate-180 bottom-0 w-[1000px] lg:w-full h-full'
          }
        />

        <RiveAnimation
          animation="mid-monster"
          layout={
            new Layout({ fit: Fit.Contain, alignment: Alignment.TopRight })
          }
          className={'absolute top-0 right-0 w-[1000px] h-full'}
        />
      </div>

      <div className="flex flex-col lg:flex-row items-evenly gap-x-4">
        {alpChartData ? (
          <GlobalHealthOverview
            compositionChartData={alpChartData}
            aumUsd={mainPool?.aumUsd ?? null}
            composition={composition ?? []}
          />
        ) : null}
        {utilizationChartData ? (
          <UsageOverview
            utilizationChartData={utilizationChartData}
            nbOpenLongPositions={mainPool?.nbOpenLongPositions ?? null}
            oiLongUsd={mainPool?.oiLongUsd ?? null}
            nbOpenShortPositions={mainPool?.nbOpenShortPositions ?? null}
            oiShortUsd={mainPool?.oiShortUsd ?? null}
          />
        ) : null}
        {stakedAlpChartData || stakedAdxChartData ? (
          <CoinsOverview
            alpChart={stakedAlpChartData}
            alpPrice={alpPrice}
            alpTotalSupply={alpTotalSupply}
            adxChart={stakedAdxChartData}
            adxPrice={adxPrice}
            adxTotalSupply={adxTotalSupply}
          />
        ) : null}
      </div>
    </>
  );
}
