import { ChartData } from 'chart.js';

import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Details from '@/components/pages/dashboard/Details/Details';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

export default function Dashboard({ mainPool, custodies }: PageProps) {
  const alpTotalSupply = useALPTotalSupply();
  const adxTotalSupply = useADXTotalSupply();

  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.name]) ??
    null;
  const adxPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.name]) ??
    null;

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

  // @TODO plug to staking system
  const staked = 20;
  const vested = 30;
  const liquid = 50;

  const ADXChartData: ChartData<'doughnut'> = {
    labels: ['Staked', 'Vested', 'Liquid'],
    datasets: [
      {
        label: 'ALP Pool',
        data: [staked, vested, liquid],
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
    labels: composition?.map((comp) => comp.token.name),
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

  const ALPDetailsArray = [
    { title: 'Price', value: formatPriceInfo(alpPrice) },
    {
      title: 'Circulating Supply',
      value:
        alpTotalSupply !== null
          ? formatNumber(alpTotalSupply, window.adrena.client.alpToken.decimals)
          : '-',
    },
    { title: 'Market Cap', value: formatPriceInfo(ALPmarketCap) },
    { title: 'Stablecoin %', value: formatPercentage(stablecoinPercentage) },
  ];

  const ADXDetailsArray = [
    { title: 'Price', value: formatPriceInfo(adxPrice) ?? '-' },
    {
      title: 'Total Supply',
      value:
        adxTotalSupply !== null
          ? formatNumber(adxTotalSupply, window.adrena.client.alpToken.decimals)
          : '-',
    },
    { title: 'Circulating Supply', value: formatPriceInfo(adxPrice) ?? '-' }, // @TODO get circulating supply
    { title: 'Market Cap', value: formatPriceInfo(ADXmarketCap) ?? '-' },
  ];

  return (
    <>
      <h2 className="text-2xl mb-3 font-medium">Dashboard</h2>

      <div className="flex justify-between flex-col sm:flex-row">
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

      <h2 className="text-2xl mt-7 font-medium">Tokens</h2>

      <div className="flex w-full flex-col gap-7 lg:flex-row mt-4">
        <Details title="ALP" details={ALPDetailsArray} chart={ALPChartData} />
        <Details title="ADX" details={ADXDetailsArray} chart={ADXChartData} />
      </div>

      <ALPIndexComposition custodies={custodies} className="mt-7" />
    </>
  );
}
