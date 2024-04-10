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

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { ALPIndexComposition, TokenInfo } from '@/hooks/useALPIndexComposition';
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
    borderColor: '#666666',
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
  composition: ALPIndexComposition,
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
                `${context.chart.data.labels?.[context.dataIndex]} amount:
                            ${formatOwnedAssets(
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
  composition: ALPIndexComposition;
  className?: string;
}) {
  return (
    <StyledContainer
      title="Global Health"
      subTitle="Visualize the project sanity."
      className={className}
    >
      <StyledSubContainer>
        <h3>Assets Under Management</h3>

        <StyledSubSubContainer className="mt-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Value</div>
            <span>{aumUsd === null ? '-' : formatPriceInfo(aumUsd)}</span>
          </div>
        </StyledSubSubContainer>
      </StyledSubContainer>

      <StyledSubContainer className="h-auto">
        <div className="flex items-center">
          <InfoAnnotation
            text="Visualize the current and target composition of the pool."
            className="mr-1"
            title="Pool composition"
          />
        </div>

        <div className="relative flex flex-col p-4 items-center justify-center mx-auto w-full">
          {compositionChartData ? (
            <>
              <div className="text-xs w-full flex justify-center text-[#666666]">
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
