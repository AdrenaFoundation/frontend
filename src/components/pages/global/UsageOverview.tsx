import Image from 'next/image';
import longLogo from '../../../../public/images/long.svg';
import React from 'react';
import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import ChartPluginAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import InfoAnnotationTitle from '../monitoring/InfoAnnotationTitle';
import { formatNumber, formatPriceInfo } from '@/utils';

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

export default function UsageOverview({
  chart,
  oiLongUsd,
  oiShortUsd,
  nbOpenLongPositions,
  nbOpenShortPositions,
}: {
  chart: ChartData<'bar'>;
  oiLongUsd: number | null;
  oiShortUsd: number | null;
  nbOpenLongPositions: number | null;
  nbOpenShortPositions: number | null;
}) {
  return (
    <div className="flex w-full h-auto flex-col  gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
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
          <InfoAnnotationTitle
            text="The active positions held by Adrena project."
            className=""
            title="Positions"
          />
        </div>

        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex flex-col gap-x-6 mt-4 bg-black p-4 border rounded-2xl">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Active Positions</div>
            <span>
              {formatNumber(
                (nbOpenLongPositions ?? 0) + (nbOpenShortPositions ?? 0),
                1,
              )}
            </span>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Total Value</div>
            <span>{`${formatPriceInfo(
              (oiLongUsd ?? 0) + (oiShortUsd ?? 0),
            )}`}</span>
          </div>
        </div>
      </div>

      <div className="border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <div className="flex items-center">
          <InfoAnnotationTitle
            text="The current utilization of the pool by custody."
            className=""
            title="Utilization"
          />
        </div>
        <div className="relative flex flex-col p-4 items-center justify-center m-auto w-full">
          {chart ? (
            <>
              <div className="text-xs w-full flex justify-end text-[#666666]">
                max utilization
              </div>
              <Bar
                data={chart}
                options={{
                  plugins: {
                    datalabels: {
                      align: 'end',
                      anchor: 'end',
                      clamp: false,
                      color: function (context) {
                        return (
                          (context.dataset.backgroundColor as string) ?? ''
                        );
                      },
                      font: function (context) {
                        var w = context.chart.width;
                        return {
                          size: w < 512 ? 12 : 14,
                          weight: 'bold',
                        };
                      },
                      formatter: function (value, context) {
                        return context.chart.data.labels?.[context.dataIndex];
                      },
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
                        callback: function (value, index, ticks) {
                          return value + '%';
                        },
                      },
                      beginAtZero: true,
                      suggestedMax: 100,
                    },
                  },
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
