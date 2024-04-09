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
import React from 'react';
import { Bar } from 'react-chartjs-2';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
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
                borderColor: '#ffffff',
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
  numberOpenedPositions,
  totalPositionsValue,
  className,
}: {
  utilizationChartData: ChartData<'bar'>;
  numberOpenedPositions: number;
  totalPositionsValue: number;
  className?: string;
}) {
  return (
    <StyledContainer
      title={
        <div className="flex items-center">
          <div className="flex flex-col justify-start ml-2">
            <h1>Economic usage</h1>
            <span className="opacity-50">Visualize the project usage</span>
          </div>
        </div>
      }
      className={className}
    >
      <StyledSubContainer>
        <div className="flex items-center">
          <InfoAnnotation
            text="The active positions held by Adrena project."
            className="mr-1"
            title="Positions"
          />
        </div>

        <StyledSubSubContainer className="flex-col mt-4">
          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Active Positions</div>
            <span>
              {numberOpenedPositions === 0
                ? '-'
                : formatNumber(numberOpenedPositions, 1)}
            </span>
          </div>

          <div className="flex w-full items-center justify-between">
            <div className="text-sm">Total Value</div>
            <span>
              {totalPositionsValue === 0
                ? '-'
                : formatPriceInfo(totalPositionsValue)}
            </span>
          </div>
        </StyledSubSubContainer>
      </StyledSubContainer>

      <StyledSubContainer className="h-auto">
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
              <div className="text-xs w-full flex justify-end text-[#ffffff]">
                max utilization
              </div>
              {generateUtilizationChart(utilizationChartData)}
            </>
          ) : null}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
