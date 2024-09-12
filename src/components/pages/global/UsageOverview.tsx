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
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { getDatasetBackgroundColor, getFontSizeWeight } from '@/utils';

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
    >
      <div>
        <div className="flex items-center">
          <InfoAnnotation
            text="Positions currently opened using the pool's capital."
            className="mr-1"
            title="Positions"
          />
        </div>
        <div className="flex flex-row gap-3 mt-3">
          <NumberDisplay title="Count" nb={numberOpenedPositions} />

          <NumberDisplay
            title="Open Interest"
            nb={totalPositionsValue}
            format="currency"
          />
        </div>
      </div>

      <StyledSubContainer className="h-auto">
        <div className="flex items-center">
          <InfoAnnotation
            text="How much of the pool's capital is utilized?"
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
