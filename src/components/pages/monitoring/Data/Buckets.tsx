import {
  ActiveElement,
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
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
import { Bar } from 'react-chartjs-2';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { Cortex } from '@/types';
import {
  formatNumber,
  formatNumberShort,
  getFontSizeWeight,
  nativeToUi,
} from '@/utils';

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
  ratio: number,
  color: string,
): AnnotationOptions<keyof AnnotationTypeRegistry> {
  return {
    type: 'line',
    borderColor: color,
    borderWidth: 4,
    xMax: indexToMax(index) + 0.05,
    xMin: indexToMin(index) - 0.05,
    xScaleID: 'x',
    yMax: () => ratio,
    yMin: () => ratio,
    yScaleID: 'y',
  };
}

export default function Buckets({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  const bucketNames = [
    'coreContributor',
    'daoTreasury',
    'pol',
    'ecosystem',
  ] as const;
  const bucketsLabels = ['Core Contrib.', 'DAO Treasury', 'POL', 'Ecosystem'];
  const isBreakpoint = useBetterMediaQuery('(max-width: 500px)');

  return (
    <StyledContainer
      title="BUCKETS"
      headerClassName="ml-auto mr-auto"
      className="w-auto grow"
      titleClassName={titleClassName}
    >
      <StyledSubSubContainer className="flex-col items-center">
        <div className="w-full max-w-[30em] ">
          <div className="flex w-full justify-evenly">
            <h3 className="flex flex-col">
              <div className="h-[3px] w-full bg-white"></div>
              <span className="text-sm">minted</span>
            </h3>

            <h3 className="flex flex-col">
              <div className="h-[3px] w-full bg-blue-500"></div>
              <span className="text-sm text-blue-500">allocated</span>
            </h3>
          </div>

          <Bar
            data={{
              labels: bucketsLabels,
              datasets: [
                {
                  label: 'Minted',
                  data: bucketNames.map((name) =>
                    nativeToUi(
                      cortex[`${name}BucketMintedAmount`],
                      window.adrena.client.adxToken.decimals,
                    ),
                  ),
                  backgroundColor: '#fffffff0',
                  borderColor: [],
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
                (event?.native?.target as HTMLElement).style.cursor =
                  activeElements?.length > 0 ? 'pointer' : 'auto';
              },
              plugins: {
                datalabels: {
                  align: 'end',
                  anchor: 'end',
                  color: () => '#ffffff',
                  font: (context: Context) => getFontSizeWeight(context),
                  formatter: (_, context: Context) => [
                    `${context.chart.data.labels?.[context.dataIndex]}`,
                  ],
                },
                annotation: {
                  annotations: bucketNames.reduce((lines, name, index) => {
                    return {
                      [`line${index + 1}`]: generateLine(
                        index,
                        nativeToUi(
                          cortex[`${name}BucketAllocation`],
                          window.adrena.client.adxToken.decimals,
                        ),
                        '#3b82f6',
                      ),
                      ...lines,
                    };
                  }, {}),
                },
                legend: {
                  display: false,
                },
                tooltip: {
                  displayColors: false,
                  callbacks: {
                    label: (context: TooltipItem<'bar'>) =>
                      (() => {
                        const name = bucketNames[context.dataIndex];

                        return [
                          `allocation: ${formatNumber(
                            nativeToUi(
                              cortex[`${name}BucketAllocation`],
                              window.adrena.client.adxToken.decimals,
                            ),
                            3,
                          )} ADX`,

                          `minted: ${formatNumber(
                            nativeToUi(
                              cortex[`${name}BucketMintedAmount`],
                              window.adrena.client.adxToken.decimals,
                            ),
                            3,
                          )} ADX`,
                        ];
                      })(),

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
                      formatNumberShort(value) + ' ADX',

                    font: {
                      size: isBreakpoint ? 8 : 12,
                    },
                  },
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
