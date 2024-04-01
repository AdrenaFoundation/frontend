import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import ChartPluginAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import Image from 'next/image';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import {
  formatNumber,
  formatPriceInfo,
  getDatasetBackgroundColor,
  getFontSizeWeight,
} from '@/utils';

import longLogo from '../../../../public/images/long.svg';
import InfoAnnotation from '../monitoring/InfoAnnotation';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  ChartDataLabels,
  ChartPluginAnnotation,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

function generateUtilizationChart(utilizationChartData: ChartData<'bar'>) {
  return (
    <Bar
      data={utilizationChartData}
      options={{
        plugins: {
          datalabels: {
            align: 'end',
            anchor: 'end',
            clamp: false,
            color: (context: Context) => getDatasetBackgroundColor(context),
            font: (context: Context) => getFontSizeWeight(context),
            // display labels (staked and liquid) on graph
            formatter: (_, context: Context) =>
              context.chart.data.labels?.[context.dataIndex],
          },
          legend: {
            display: false,
          },
          tooltip: { enabled: false },
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                yMin: 100,
                yMax: 100,
                borderColor: '#666666',
                borderWidth: 2,
              },
            },
          },
        },
        //needed so the labels don't get hidden if bar is 100%
        layout: {
          padding: {
            top: 10,
          },
        },
        scales: {
          x: {
            display: false,
            offset: true,
          },
          y: {
            ticks: {
              callback: (value: string | number) => value + '%',
            },
            beginAtZero: true,
            suggestedMax: 100,
          },
        },
      }}
    />
  );
}

export default function UsageOverview({
  utilizationChartData,
  oiLongUsd,
  oiShortUsd,
  nbOpenLongPositions,
  nbOpenShortPositions,
}: {
  utilizationChartData: ChartData<'bar'>;
  oiLongUsd: number | null;
  oiShortUsd: number | null;
  nbOpenLongPositions: number | null;
  nbOpenShortPositions: number | null;
}) {
  return (
    <div className="flex h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center">
        <Image
          //TODO: replace with a monster arm shaped as an arrow going up (generate on midjourney)
          src={longLogo}
          width={32}
          height={32}
          alt="longLogo"
        />
        <div className="flex flex-col justify-start ml-2">
          <h2 className="">Economic usage</h2>
          <span className="opacity-50">Visualize the project usage</span>
        </div>
      </div>
      <div className="border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <div className="flex items-center">
          <InfoAnnotation
            text="The active positions held by Adrena project."
            className="mr-1"
            title="Positions"
          />
        </div>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex flex-col gap-x-6 mt-4 bg-black p-4 border rounded-2xl">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Active Positions</div>
            <span>
              {nbOpenLongPositions === null || nbOpenShortPositions === null
                ? '-'
                : formatNumber(nbOpenLongPositions + nbOpenShortPositions, 1)}
            </span>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Total Value</div>
            <span>
              {oiLongUsd === null || oiShortUsd === null
                ? '-'
                : formatPriceInfo(oiLongUsd + oiShortUsd)}
            </span>
          </div>
        </div>
      </div>
      <div className="h-full border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <div className="flex items-center">
          <InfoAnnotation
            text="The current utilization of the pool by custody."
            className="mr-1"
            title="Utilization"
          />
        </div>
        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {utilizationChartData ? (
            <>
              <div className="text-xs w-full flex justify-end text-[#666666]">
                max utilization
              </div>
              {generateUtilizationChart(utilizationChartData)}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
