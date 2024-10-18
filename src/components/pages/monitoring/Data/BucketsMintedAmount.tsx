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
import ChartPluginAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
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

export default function BucketsMintedAmount({
  cortex,
  titleClassName,
}: {
  cortex: Cortex;
  titleClassName?: string;
}) {
  const bucketNames = ['coreContributor', 'foundation', 'ecosystem'] as const;
  const bucketsLabels = ['Core Contrib.', 'Foundation', 'Ecosystem'];
  const isBreakpoint = useBetterMediaQuery('(max-width: 500px)');

  return (
    <StyledContainer
      title="ADX BUCKETS MINTED AMOUNT"
      headerClassName="ml-auto mr-auto"
      className="grow max-w-[40em] w-[30em]"
      titleClassName={titleClassName}
      bodyClassName="flex items-center justify-center w-full h-full"
    >
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
              backgroundColor: '#9f8cae',
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
          responsive: true,
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
                      `Minted: ${formatNumber(
                        nativeToUi(
                          cortex[`${name}BucketMintedAmount`],
                          window.adrena.client.adxToken.decimals,
                        ),
                        window.adrena.client.adxToken.displayAmountDecimalsPrecision,
                      )} ADX`,
                    ];
                  })(),

                // Remove title from tooltip because it is not needed and looks
                title: () => '',
              },
            },
          },
          // Needed so the labels don't get hidden if bar is 100%
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
    </StyledContainer>
  );
}
