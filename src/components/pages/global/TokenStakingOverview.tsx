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

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import {
  formatNumber,
  formatPercentage,
  formatPriceInfo,
  getDatasetBackgroundColor,
  getFontSizeWeight,
} from '@/utils';

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
  totalSupply: number | null,
  price: number | null,
) {
  const rawData = raw as number;
  const amountLabel = formatNumber(rawData, 2);
  const percentageLabel = getPercentageLabel(rawData, totalSupply);
  const priceLabel = getPriceLabel(rawData, price);

  return [
    `${title} ${label} amount: ${amountLabel} (${percentageLabel})`,
    `value: ${priceLabel}`,
  ];
}

function generateBarChat(
  chartData: ChartData<'bar'>,
  title: string,
  totalSupply: number | null,
  price: number | null,
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
              `${title} (${context.chart.data.labels?.[context.dataIndex]})`,
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
                createTooltip(label, raw, title, totalSupply, price),
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
                  totalSupply as number,
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

export default function TokenStakingOverview({
  alpChart,
  alpPrice,
  alpTotalSupply,
  adxChart,
  adxPrice,
  adxTotalSupply,
  className,
}: {
  alpChart: ChartData<'bar'> | null;
  alpPrice: number | null;
  alpTotalSupply: number | null;
  adxChart: ChartData<'bar'> | null;
  adxPrice: number | null;
  adxTotalSupply: number | null;
  className?: string;
}) {
  return (
    <StyledContainer
      title="Staking"
      subTitle="How much of the token supply is staked?"
      className={className}
      bodyClassName="flex-col sm:flex-row justify-evenly"
    >
      <StyledSubContainer className="w-full sm:w-[calc(50%-1em)]">
        {alpChart
          ? generateBarChat(alpChart, 'ALP', alpTotalSupply, alpPrice)
          : null}
      </StyledSubContainer>

      <StyledSubContainer className="w-full sm:w-[calc(50%-1em)]">
        {adxChart
          ? generateBarChat(adxChart, 'ADX', adxTotalSupply, adxPrice)
          : null}
      </StyledSubContainer>
    </StyledContainer>
  );
}
