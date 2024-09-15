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

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { getDatasetBackgroundColor, getFontSizeWeight } from '@/utils';

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
      title="Current Pool utilization"
      subTitle="Is the pool capital efficient?"
      className={className}
      titleClassName="text-xxl opacity-50 font-boldy"
    >
      <div>
        <div className="flex flex-row gap-3 mt-3">
          <NumberDisplay title="Positions" nb={numberOpenedPositions} />

          <NumberDisplay
            title="Open Interest"
            nb={totalPositionsValue}
            format="currency"
          />
        </div>
      </div>

      <StyledSubContainer className="h-auto">
        <h1 className="flex justify-center text-base sm:text-lg items-center mr-1 text-xxl opacity-50 font-boldy">
          Utilization
        </h1>
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
