import { Alignment, Fit, Layout } from '@rive-app/react-canvas';
import { ChartData } from 'chart.js';
import { useEffect, useState } from 'react';

import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Details from '@/components/pages/dashboard/Details/Details';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import RiveAnimation from '@/components/RiveAnimation/RiveAnimation';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import {
  formatNumber,
  formatPercentage,
  formatPriceInfo,
  nativeToUi,
} from '@/utils';

export default function Dashboard({ mainPool, custodies }: PageProps) {
  const alpTotalSupply = useALPTotalSupply();
  const adxTotalSupply = useADXTotalSupply();

  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.symbol]) ??
    null;
  const adxPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.symbol]) ??
    null;

  const [staked, setStaked] = useState<number | null>(null);
  const [vested, setVested] = useState<number | null>(null);

  const composition = useALPIndexComposition(custodies);

  // Add currentRatio of stable tokens
  const stablecoinPercentage = composition
    ? composition.reduce((total, comp) => {
        return total + (comp.token.isStable ? comp.currentRatio ?? 0 : 0);
      }, 0)
    : null;

  const ADXmarketCap =
    adxPrice !== null && adxTotalSupply != null
      ? adxPrice * adxTotalSupply
      : null;

  const ALPmarketCap =
    alpPrice !== null && alpTotalSupply != null
      ? alpPrice * alpTotalSupply
      : null;

  useEffect(() => {
    if (!window.adrena.client.connection) return;

    lockedStake();
    getVestedAmount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.adrena.client.connection]);

  const lockedStake = async () => {
    const lockedStake = await window.adrena.client.getStakingStats();
    if (!lockedStake.lm) return;

    setStaked(
      nativeToUi(
        lockedStake.lm.nbLockedTokens,
        window.adrena.client.adxToken.decimals,
      ),
    );
  };

  const getVestedAmount = async () => {
    const acc = await window.adrena.client.getAllVestingAccounts();

    if (!acc) return;

    const total = acc.reduce((acc, { amount }) => {
      return acc + nativeToUi(amount, window.adrena.client.adxToken.decimals);
    }, 0);

    setVested(total);
  };

  // TODO: plug real data
  const liquid = 0;

  const ADXChartData: ChartData<'doughnut'> = {
    labels: ['Locked stake', 'Vested', 'Liquid'],
    datasets: [
      {
        label: 'ALP Pool',
        data: [staked ?? 0, vested ?? 0, liquid],
        borderRadius: 10,
        offset: 20,
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ALPChartData: ChartData<'doughnut'> = {
    labels: composition?.map((comp) => comp.token.symbol),
    datasets: [
      {
        label: 'ALP Pool',
        data: composition?.map((comp) => comp.currentRatio!) || [],
        borderRadius: 10,
        offset: 20,
        backgroundColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const comingSoon = <p className="opacity-25 text-sm italic">coming soon</p>;

  const ALPDetailsArray = [
    { title: 'Price', value: formatPriceInfo(alpPrice) },
    {
      title: 'Circulating Supply',
      value: alpTotalSupply !== null ? formatNumber(alpTotalSupply, 2) : '-',
    },
    { title: 'Market Cap', value: formatPriceInfo(ALPmarketCap) },
    { title: 'Stablecoin %', value: formatPercentage(stablecoinPercentage) },
  ];

  const ADXDetailsArray = [
    {
      title: 'Price',
      value: adxPrice ? formatPriceInfo(adxPrice) : comingSoon,
    },
    {
      title: 'Total Supply',
      value: adxTotalSupply !== null ? formatNumber(adxTotalSupply, 2) : null,
    },
    {
      title: 'Circulating Supply',
      value: adxPrice ? formatPriceInfo(adxPrice) : comingSoon,
    },
    {
      title: 'Market Cap',
      value: ADXmarketCap ? formatPriceInfo(ADXmarketCap) : comingSoon,
    },
  ];

  return (
    <>
      <RiveAnimation
        src="./rive/mid-monster.riv"
        layout={new Layout({ fit: Fit.Contain, alignment: Alignment.TopRight })}
        className={
          'fixed lg:absolute top-[50px] md:top-[-50px] right-0 w-full h-full'
        }
      />

      <h2 className="text-2xl mb-3 font-medium z-20">Dashboard</h2>

      <div className="flex justify-between flex-col sm:flex-row z-20">
        <Overview
          aumUsd={mainPool?.aumUsd ?? null}
          longPositions={mainPool?.longPositions ?? null}
          shortPositions={mainPool?.shortPositions ?? null}
          nbOpenLongPositions={mainPool?.nbOpenLongPositions ?? null}
          nbOpenShortPositions={mainPool?.nbOpenShortPositions ?? null}
          averageLongLeverage={mainPool?.averageLongLeverage ?? null}
          averageShortLeverage={mainPool?.averageShortLeverage ?? null}
          totalCollectedFees={mainPool?.totalFeeCollected ?? null}
          totalVolume={mainPool?.totalVolume ?? null}
        />
      </div>

      <h2 className="text-2xl mt-7 font-medium z-20">Tokens</h2>

      <div className="flex w-full flex-col gap-7 lg:flex-row mt-4 z-20">
        <Details title="ALP" details={ALPDetailsArray} chart={ALPChartData} />
        <Details title="ADX" details={ADXDetailsArray} chart={ADXChartData} />
      </div>

      <ALPIndexComposition custodies={custodies} className="mt-7 z-20" />
    </>
  );
}
