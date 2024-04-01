import {
  ActiveElement,
  ArcElement,
  Chart as ChartJS,
  ChartData,
  ChartEvent,
  Legend,
  Tooltip,
} from 'chart.js';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import {
  formatNumber,
  formatPercentage,
  formatPriceInfo,
  getDatasetBackgroundColor,
  getFontSizeWeight,
} from '@/utils';

import InfoAnnotation from '../monitoring/InfoAnnotation';

ChartJS.register(ArcElement, ChartDataLabels, Tooltip, Legend);

function calculatePercentageFromTicks(value: number, total: number) {
  return value > total
    ? formatPercentage(100, 0)
    : formatPercentage((value / total) * 100, 0);
}

function getPercentageLabel(rawData: number, total: number | null) {
  return total === null ? '-' : formatPercentage((rawData / total) * 100, 2);
}

function getPriceLabel(rawData: number, price: number | null) {
  return price === null ? '-' : formatPriceInfo(rawData * price);
}

function createTooltip(
  label: string,
  raw: unknown,
  title: string,
  alpTotalSupply: number | null,
  adxTotalSupply: number | null,
  alpPrice: number | null,
  adxPrice: number | null,
) {
  const rawData = raw as number;
  const amountLabel = formatNumber(rawData, 2);
  const percentageLabel =
    title === 'ALP'
      ? getPercentageLabel(rawData, alpTotalSupply)
      : getPercentageLabel(rawData, adxTotalSupply);
  const priceLabel =
    title === 'ALP'
      ? getPriceLabel(rawData, alpPrice)
      : getPercentageLabel(rawData, adxPrice);

  return [
    `${title} ${label} amount: ${amountLabel} (${percentageLabel})`,
    `value: ${priceLabel}`,
  ];
}

function generateBarChat(
  chartData: ChartData<'bar'>,
  title: string,
  alpTotalSupply: number | null,
  adxTotalSupply: number | null,
  alpPrice: number | null,
  adxPrice: number | null,
): JSX.Element {
  return (
    <Bar
      data={chartData}
      options={{
        onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
          (event?.native?.target as HTMLElement).style.cursor =
            activeElements?.length > 0 ? 'pointer' : 'auto';
        },
        plugins: {
          datalabels: {
            align: 'end',
            anchor: 'end',
            color: (context: Context) => getDatasetBackgroundColor(context),
            font: (context: Context) => getFontSizeWeight(context),
            // display title and labels (custodies name) on graph
            formatter: (_, context: Context) => [
              `${title} ${context.chart.data.labels?.[context.dataIndex]}`,
            ],
          },
          legend: {
            display: false,
          },
          tooltip: {
            displayColors: false,
            callbacks: {
              //destructuration of the object to get the label and raw data values from TooltipItem
              label: ({ label, raw }) =>
                createTooltip(
                  label,
                  raw,
                  title,
                  alpTotalSupply,
                  adxTotalSupply,
                  alpPrice,
                  adxPrice,
                ),
              //remove title from tooltip because it is not needed and looks
              title: () => '',
            },
          },
        },
        //needed so the labels don't get hidden if bar is 100%
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
              callback: (value: string | number) =>
                calculatePercentageFromTicks(
                  value as number,
                  (title === 'ALP' ? alpTotalSupply : adxTotalSupply) as number,
                ),
            },
            beginAtZero: true,
            suggestedMax: 100,
          },
        },
      }}
    />
  );
}

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
  return (
    <div className="flex h-auto flex-col gap-3 bg-gray-300/75 backdrop-blur-md border border-gray-200 rounded-2xl p-5">
      <div className="flex items-center">
        <div className={`p-1 mr-2 bg-blue-500 rounded-full`}>
          <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
            ADX
          </p>
        </div>
        <div className={`p-1 mr-2 bg-red-500 rounded-full`}>
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
          <InfoAnnotation
            text="The currently active Stakes for ALP and ADX."
            className="mr-1"
            title="Stakes"
          />
        </div>
        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {alpChart ? (
            <>
              {generateBarChat(
                alpChart,
                'ALP',
                alpTotalSupply,
                null,
                alpPrice,
                null,
              )}
            </>
          ) : null}
          <div className="h-[1px] bg-gray-200 w-full mt-4 mb-4" />
          {adxChart ? (
            <>
              {generateBarChat(
                adxChart,
                'ADX',
                null,
                adxTotalSupply,
                null,
                adxPrice,
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
