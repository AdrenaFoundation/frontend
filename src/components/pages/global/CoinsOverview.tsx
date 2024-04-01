import React from 'react';
import {
  ArcElement,
  Chart as ChartJS,
  ChartData,
  Legend,
  Tooltip,
  ChartEvent,
  ActiveElement,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import InfoAnnotationTitle from '../monitoring/InfoAnnotationTitle';
import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

ChartJS.register(ArcElement, ChartDataLabels, Tooltip, Legend);

export default function CoinsOverview({
  alpChart,
  alpPrice,
  alpTotalSupply,
  adxChart,
  adxPrice,
  adxTotalSupply,
}: {
  alpChart: ChartData<'bar'> | null;
  alpPrice: number | null;
  alpTotalSupply: number | null;
  adxChart: ChartData<'bar'> | null;
  adxPrice: number | null;
  adxTotalSupply: number | null;
}) {
  function calculatePercentageFromTicks(value: number, total: number) {
    let percentage = '';
    if (value > total) percentage = formatPercentage(100, 0);
    else percentage = formatPercentage((value / total) * 100, 0);
    return percentage;
  }

  return (
    <div className="flex h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center">
        <div className={`p-1 mr-2 bg-${'blue'}-500 rounded-full`}>
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            ADX
          </p>
        </div>
        <div className={`p-1 mr-2 bg-${'red'}-500 rounded-full`}>
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            ALP
          </p>
        </div>
        <div className="flex flex-col justify-start ml-2">
          <h2 className="">Coins</h2>
          <span className="opacity-50">Visualize Adrena coins states.</span>
        </div>
      </div>

      <div className="h-full border border-gray-200 bg-gray-300 p-6 rounded-2xl">
        <div className="flex items-center">
          <InfoAnnotationTitle
            text="The currently active Stakes for ALP and ADX."
            className=""
            title="Stakes"
          />
        </div>
        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {alpChart ? (
            <>
              <Bar
                data={alpChart}
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
                        return [
                          `ALP ${
                            context.chart.data.labels?.[context.dataIndex]
                          }`,
                        ];
                      },
                    },
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      displayColors: false,
                      callbacks: {
                        label: ({ label, raw }) => [
                          `ALP ${label} amount: ${formatNumber(
                            raw as number,
                            2,
                          )} (${formatPercentage(
                            (((raw as number) / (alpTotalSupply ?? 0)) *
                              100) as number,
                            2,
                          )})`,
                          `value: ${formatPriceInfo(
                            (raw as number) * (alpPrice ?? 0),
                          )}`,
                        ],
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
                          return calculatePercentageFromTicks(
                            value as number,
                            alpTotalSupply as number,
                          );
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
          <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />
          {adxChart ? (
            <>
              <Bar
                data={adxChart}
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
                        return [
                          `ADX ${
                            context.chart.data.labels?.[context.dataIndex]
                          }`,
                        ];
                      },
                    },
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      displayColors: false,
                      callbacks: {
                        label: ({ label, raw }) => [
                          `ADX ${label} amount: ${formatNumber(
                            raw as number,
                            2,
                          )} (${formatPercentage(
                            (((raw as number) / (adxTotalSupply ?? 0)) *
                              100) as number,
                            2,
                          )})`,
                          `value: ${formatPriceInfo(
                            (raw as number) * (adxPrice ?? 0),
                          )}`,
                        ],
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
                          return calculatePercentageFromTicks(
                            value as number,
                            adxTotalSupply as number,
                          );
                        },
                      },
                      beginAtZero: true,
                      suggestedMax: adxTotalSupply ?? 0,
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
