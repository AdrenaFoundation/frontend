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
import Image from 'next/image';
import { Bar } from 'react-chartjs-2';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { USD_DECIMALS } from '@/constant';
import useALPIndexComposition, {
  TokenInfo,
} from '@/hooks/useALPIndexComposition';
import { useSelector } from '@/store/store';
import { CustodyExtended, PoolExtended } from '@/types';
import {
  formatNumber,
  formatPriceInfo,
  getFontSizeWeight,
  nativeToUi,
} from '@/utils';

import abbreviateWords from '../abbreviateWords';
import NumberInfo from '../NumberInfo';
import Table from '../Table';

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

export default function PoolView({
  className,
  mainPool,
  custodies,
}: {
  className?: string;
  mainPool: PoolExtended;
  custodies: CustodyExtended[];
}) {
  const tokenPrices = useSelector((s) => s.tokenPrices);
  const composition = useALPIndexComposition(custodies);

  const attributes = Object.keys(custodies[0].nativeObject.volumeStats);

  return (
    <>
      <StyledContainer
        title="AUM"
        subTitle=""
        className="min-w-[20em] w-[20em] grow"
      >
        <StyledSubContainer>
          <h2>Total USD worth</h2>

          <StyledSubSubContainer className="mt-2">
            <h2>{formatPriceInfo(mainPool.aumUsd)}</h2>
          </StyledSubSubContainer>
        </StyledSubContainer>
      </StyledContainer>

      <StyledContainer
        title="AUM Breakdown"
        className="min-w-[22em] w-[22em] grow"
      >
        <Table
          rowTitleWidth="50%"
          data={[
            ...custodies.map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  <Image
                    src={custody.tokenInfo.image}
                    alt="token icon"
                    width="16"
                    height="16"
                  />
                  <span className="ml-1">{custody.tokenInfo.name}</span>
                </div>
              ),

              value: (
                <div className="flex flex-col">
                  <NumberInfo
                    value={custody.owned}
                    precision={custody.decimals}
                    denomination={custody.tokenInfo.symbol}
                  />

                  {tokenPrices[custody.tokenInfo.symbol] ? (
                    <NumberInfo
                      value={
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        custody.owned * tokenPrices[custody.tokenInfo.symbol]!
                      }
                    />
                  ) : null}
                </div>
              ),
            })),
          ]}
        />
      </StyledContainer>

      <StyledContainer
        title="Pool Ratios"
        headerClassName="ml-auto mr-auto"
        className="w-full grow"
        bodyClassName="items-center"
      >
        {composition &&
        composition.every(
          (comp) =>
            comp.targetRatio !== null &&
            comp.currentRatio !== null &&
            comp.minRatio !== null &&
            comp.maxRatio !== null,
        ) ? (
          <StyledSubSubContainer className="flex-col max-w-[30em]">
            <div className="flex w-full justify-evenly">
              <h3 className="flex flex-col">
                <div className="h-[3px] w-full bg-green"></div>
                <span className="text-sm text-green">target ratio</span>
              </h3>

              <h3 className="flex flex-col">
                <div className="h-[3px] w-full bg-blue-500"></div>
                <span className="text-sm text-blue-500">min ratio</span>
              </h3>

              <h3 className="flex flex-col">
                <div className="h-[3px] w-full bg-red"></div>
                <span className="text-sm text-red">max ratio</span>
              </h3>
            </div>

            <Bar
              data={{
                labels: composition.map((comp) => comp.token.symbol),
                datasets: [
                  {
                    label: 'Ratio',
                    data: composition.map((comp) => comp.currentRatio),
                    backgroundColor: '#fffffff0',
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    borderColor: composition.map((comp) => comp.color!) || [],
                    borderWidth: 1,
                  },
                ],
              }}
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
                    color: () => '#ffffff',
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
                        // Target ratio line
                        [`line${(i + 1) * 3}`]: generateLine(
                          i,
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          composition[i].targetRatio!, // checked above
                          '#07956b',
                        ),

                        // Min ratio line
                        [`line${(i + 1) * 3 + 1}`]: generateLine(
                          i,
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          composition[i].minRatio!, // checked above
                          '#3b82f6',
                        ),

                        // Max ratio line
                        [`line${(i + 1) * 3 + 2}`]: generateLine(
                          i,
                          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                          composition[i].maxRatio!, // checked above
                          '#c9243a',
                        ),

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
                      label: (context: TooltipItem<'bar'>) =>
                        (() => {
                          const comp = composition[context.dataIndex];

                          return [
                            `current ratio: ${formatNumber(
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              comp.currentRatio!, // checked above
                              3,
                            )}%`,

                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            `min ratio: ${formatNumber(comp.minRatio!, 3)}%`,

                            `target ratio: ${formatNumber(
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              comp.targetRatio!, // checked above
                              3,
                            )}%`,

                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            `max ratio: ${formatNumber(comp.maxRatio!, 3)}%`, // checked above
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
                      callback: (value: string | number) => value + '%',
                    },
                    beginAtZero: true,
                  },
                },
              }}
            />
          </StyledSubSubContainer>
        ) : null}
      </StyledContainer>

      <StyledContainer title={'Volume Breakdown'} className={className}>
        <Table
          rowTitleWidth="90px"
          columnsTitles={attributes.map(abbreviateWords)}
          data={[
            ...custodies.map((custody) => ({
              rowTitle: (
                <div className="flex items-center">
                  <Image
                    src={custody.tokenInfo.image}
                    alt="token icon"
                    width="16"
                    height="16"
                  />
                  <span className="ml-1 text-base">
                    {custody.tokenInfo.name}
                  </span>
                </div>
              ),
              values: attributes.map((attribute) => (
                <NumberInfo
                  key={attribute}
                  value={nativeToUi(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (custody.nativeObject.volumeStats as any)[attribute],
                    USD_DECIMALS,
                  )}
                />
              )),
            })),

            {
              rowTitle: <div className="font-semibold">Total</div>,
              values: attributes.map((param, i) => (
                <NumberInfo
                  key={i}
                  value={custodies.reduce(
                    (total, custody) =>
                      total +
                      nativeToUi(
                        // Force typing as we know the keys are matching the collectedFees field
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (custody.nativeObject.volumeStats as any)[param],
                        USD_DECIMALS,
                      ),
                    0,
                  )}
                />
              )),
            },
          ]}
        />
      </StyledContainer>
    </>
  );
}
