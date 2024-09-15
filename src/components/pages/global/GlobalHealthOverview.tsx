import {
  ActiveElement,
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  ChartData,
  ChartEvent,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import ChartPluginAnnotation, {
  AnnotationOptions,
  AnnotationTypeRegistry,
} from 'chartjs-plugin-annotation';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import React from 'react';
import { Bar } from 'react-chartjs-2';

import Button from '@/components/common/Button/Button';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { PoolComposition, TokenInfo } from '@/hooks/usePoolInfo';
import {
  formatNumber,
  formatPriceInfo,
  getDatasetBackgroundColor,
  getFontSizeWeight,
} from '@/utils';

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

function indexToMin(index: number) {
  return index - 0.36;
}

function indexToMax(index: number) {
  return index + 0.36;
}

function generateLine(
  index: number,
  targetRatio: number | null,
): AnnotationOptions<keyof AnnotationTypeRegistry> {
  return {
    type: 'line',
    borderColor: '#ffffff',
    borderWidth: 1,
    xMax: indexToMax(index) + 0.05,
    xMin: indexToMin(index) - 0.05,
    xScaleID: 'x',
    yMax: () => targetRatio ?? 0,
    yMin: () => targetRatio ?? 0,
    yScaleID: 'y',
  };
}

function formatOwnedAssets(ownedAssets: unknown): string {
  return ownedAssets === null ? '-' : formatNumber(ownedAssets as number, 3);
}

function generateCompositionChart(
  compositionChartData: ChartData<'bar'>,
  composition: PoolComposition,
): JSX.Element {
  return (
    <Bar
      data={compositionChartData}
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
            // display labels (custodies name) on graph
            formatter: (_, context: Context) => [
              `${context.chart.data.labels?.[context.dataIndex]}`,
            ],
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
                [`line${i + 1}`]: generateLine(i, composition[i].targetRatio),
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
              label: (context: TooltipItem<'bar'>) => [
                `${
                  context.chart.data.labels?.[context.dataIndex]
                } amount: ${formatOwnedAssets(
                  composition[context.dataIndex].ownedAssets,
                )}`,
                `value: ${formatPriceInfo(
                  composition[context.dataIndex].custodyUsdValue,
                )}`,
              ],
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
              callback: (value: string | number) => value + '%',
            },
            beginAtZero: true,
          },
        },
      }}
    />
  );
}

export default function GlobalHealthOverview({
  compositionChartData,
  aumUsd,
  composition,
  className,
}: {
  compositionChartData: ChartData<'bar'>;
  aumUsd: number | null;
  composition: PoolComposition;
  className?: string;
}) {
  return (
    <StyledContainer
      title="Pool Composition"
      subTitle="Are the pool ratios on target?"
      className={className}
    >
      <div>
        <h3 className="mb-3">Assets Under Management</h3>

        <NumberDisplay
          title="Value"
          nb={aumUsd}
          format="currency"
          precision={0}
        />
      </div>

      <StyledSubContainer className="h-auto">
        <div className="flex items-center">
          <InfoAnnotation
            text="White lines indicates target ratios."
            className="mr-1"
            title="Composition"
          />
        </div>

        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {compositionChartData ? (
            <>
              <div className="text-xs w-full flex justify-center text-[#ffffff]">
                ── target ratio
              </div>
              {generateCompositionChart(compositionChartData, composition)}
            </>
          ) : null}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
