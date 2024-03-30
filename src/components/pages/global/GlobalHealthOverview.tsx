import Image from 'next/image';
import React from 'react';
import {
  ActiveElement,
  ArcElement,
  Chart as ChartJS,
  ChartData,
  ChartEvent,
  Legend,
  Tooltip,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import ChartPluginAnnotation, {
  AnnotationOptions,
  AnnotationTypeRegistry,
} from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';

import { formatNumber, formatPriceInfo } from '@/utils';

import InfoAnnotationTitle from '../monitoring/InfoAnnotationTitle';
import { Bar } from 'react-chartjs-2';
import useALPIndexComposition, {
  ALPIndexComposition,
  TokenInfo,
} from '@/hooks/useALPIndexComposition';
import {
  _DeepPartialArray,
  _DeepPartialObject,
} from 'chart.js/dist/types/utils';

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

export default function GlobalHealthOverview({
  chart,
  aumUsd,
  composition,
}: {
  chart: ChartData<'bar'>;
  aumUsd: number | null;
  composition: ALPIndexComposition;
}) {
  // categoryPercentage is 0.8 by default
  // barPercentage is 0.9 by default
  // 1 * 0.8 * 0.9 = 0.72
  // 0.72 / 2 = 0.36
  function indexToMin(index: number) {
    return index - 0.36;
  }

  function indexToMax(index: number) {
    return index + 0.36;
  }

  function generateLine(
    index: number,
  ): AnnotationOptions<keyof AnnotationTypeRegistry> {
    return {
      type: 'line',
      borderColor: '#666666',
      borderWidth: 1,
      xMax: indexToMax(index) + 0.05,
      xMin: indexToMin(index) - 0.05,
      xScaleID: 'x',
      yMax: () => composition[index].targetRatio ?? 0,
      yMin: () => composition[index].targetRatio ?? 0,
      yScaleID: 'y',
    };
  }

  return (
    <div className="flex w-full h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center">
        <Image
          // TODO: replace with monster heart icon
          src={window.adrena.client.adxToken.image}
          width={32}
          height={32}
          alt="ADX icon"
        />

        <div className="flex flex-col justify-start ml-2">
          <h2 className="">Global Health</h2>
          <span className="opacity-50">Visualize the project sanity</span>
        </div>
      </div>

      <div className="border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <h3>Assets Under Management</h3>
        <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />

        <div className="flex flex-col gap-x-6 mt-4 bg-black p-4 border rounded-2xl">
          {
            <div className="flex w-full items-center justify-between">
              <div className="text-sm">Value</div>
              <span>{`${formatPriceInfo(aumUsd ?? 0)}`}</span>
            </div>
          }
        </div>

        <div className="h-[1px] bg-gray-200 h-40 w-full mt-4 mb-4" />

        <div className="flex items-center">
          <InfoAnnotationTitle
            text="Visualize the current and target composition of the pool."
            className=""
            title="Pool composition"
          />
        </div>

        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {chart ? (
            <>
              <div className="text-xs w-full flex justify-center text-[#666666]">
                ── target ratio
              </div>
              <Bar
                data={chart}
                options={{
                  onHover: (
                    event: ChartEvent,
                    activeElements: ActiveElement[],
                  ) => {
                    (event?.native?.target as HTMLElement).style.cursor =
                      activeElements?.length > 0 ? 'pointer' : 'auto';
                  },
                  plugins: {
                    datalabels: {
                      align: 'end',
                      anchor: 'end',
                      color: function (context) {
                        return (
                          (context.dataset.backgroundColor as string) ?? ''
                        );
                      },
                      font: function (context) {
                        const w = context.chart.width;
                        return {
                          size: w < 512 ? 12 : 14,
                          weight: 'bold',
                        };
                      },
                      formatter: function (value, context) {
                        return context.chart.data.labels?.[context.dataIndex];
                      },
                    },
                    annotation: {
                      annotations: composition.reduce(
                        (
                          lines: {
                            [key: string]: ReturnType<typeof generateLine>;
                          },
                          _: TokenInfo,
                          i: number,
                        ) => ({
                          [`line${i + 1}`]: generateLine(i),
                          ...lines,
                        }),
                        {},
                      ),
                    },
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      displayColors: false,
                      callbacks: {
                        label: function (context) {
                          return [
                            `${
                              context.chart.data.labels?.[context.dataIndex]
                            } amount: ${formatNumber(
                              composition[context.dataIndex].ownedAssets ?? 0,
                              3,
                            )}`,
                            `value: ${formatPriceInfo(
                              composition[context.dataIndex].custodyUsdValue,
                            )}`,
                          ];
                        },

                        title: () => '',
                      },
                    },
                  },
                  layout: {
                    padding: {
                      top: 20,
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
