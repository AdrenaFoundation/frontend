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
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import { PoolInfo, TokenInfo } from '@/hooks/usePoolInfo';
import { formatNumber, getFontSizeWeight } from '@/utils';

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

export default function PoolRatios({
  poolInfo,
  titleClassName,
}: {
  poolInfo: PoolInfo | null;
  titleClassName?: string;
}) {
  // Min ratio 20%
  // Max ratio 30%
  //
  // Min <*> Max : 10%
  // Target ratio 25% - min 20% = 5%

  return (
    <StyledContainer
      title="Pool Ratios"
      headerClassName="ml-auto mr-auto"
      className="grow w-[30em] h-auto"
      titleClassName={titleClassName}
      bodyClassName="flex items-center justify-center w-full h-auto"
    >
      <div className="w-full h-auto">
        {poolInfo?.composition.every(
          (comp) =>
            comp.targetRatio !== null &&
            comp.currentRatio !== null &&
            comp.minRatio !== null &&
            comp.maxRatio !== null,
        )
          ? poolInfo?.composition.map(
              ({ currentRatio, targetRatio, minRatio, maxRatio, token }, i) => {
                if (
                  currentRatio === null ||
                  targetRatio === null ||
                  minRatio === null ||
                  maxRatio === null
                )
                  return null; // To make TS happy

                currentRatio = Number(currentRatio.toFixed(2));

                const targetRatioPercentage =
                  ((targetRatio - minRatio) * 100) / (maxRatio - minRatio);

                const currentRatioPercentage =
                  ((currentRatio - minRatio) * 100) / (maxRatio - minRatio);

                return (
                  <div
                    className="h-[9em] pt-16 sm:text-base md:text-lg relative"
                    key={i}
                  >
                    <div className="bg-white h-3 relative overflow-visible">
                      <div className="absolute -top-14 left-[calc(50%-2.5em)] w-[5em] font-boldy flex justify-center">
                        {token.symbol}
                      </div>

                      <div className="absolute left-0 -bottom-8 bg-secondary">
                        Min: {minRatio}%
                      </div>

                      <div className="absolute right-0 -bottom-8 bg-secondary">
                        {maxRatio}%: Max
                      </div>

                      <>
                        <div
                          className="absolute -bottom-16 whitespace-nowrap text-gray-700"
                          style={{
                            left: `${targetRatioPercentage + 2}%`,
                          }}
                        >
                          Target: {targetRatio}%
                        </div>

                        <div
                          className="bg-gray-800 h-16 w-1 absolute -bottom-16 -z-10"
                          style={{
                            left: `${targetRatioPercentage}%`,
                          }}
                        />
                      </>

                      <div
                        className={twMerge(
                          'absolute -top-8 text-[#9f8cae] flex',
                          currentRatio >= maxRatio ? 'right-0' : 'left-0',
                          currentRatio < minRatio || currentRatio > maxRatio
                            ? 'bg-red opacity-90 pl-2 pr-2 text-white'
                            : 'text-[#7fd7c1]',
                        )}
                      >
                        {currentRatio < minRatio ? (
                          <div className="mr-1 font-boldy">{'<<<'}</div>
                        ) : null}
                        Current Ratio: {currentRatio}%
                        {currentRatio > maxRatio ? (
                          <div className="ml-1 font-boldy">{'>>>'}</div>
                        ) : null}
                      </div>

                      <div
                        className={twMerge(
                          'h-2 left-0 absolute bottom-0.5',
                          currentRatio < minRatio || currentRatio > maxRatio
                            ? 'bg-red opacity-90'
                            : 'bg-[#7fd7c1]',
                        )}
                        style={{
                          width: `${
                            currentRatioPercentage > 100
                              ? 100
                              : currentRatioPercentage
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )
          : null}
      </div>
    </StyledContainer>
  );
  // return (
  //   <StyledContainer
  //     title="Pool Ratios"
  //     headerClassName="ml-auto mr-auto"
  //     className="grow max-w-[40em] w-[30em]"
  //     titleClassName={titleClassName}
  //     bodyClassName="flex items-center justify-center w-full h-full"
  //   >
  //     {poolInfo?.composition.every(
  //       (comp) =>
  //         comp.targetRatio !== null &&
  //         comp.currentRatio !== null &&
  //         comp.minRatio !== null &&
  //         comp.maxRatio !== null,
  //     ) ? (
  //       <div className="flex-col h-full w-full p-4">
  //         <div className="flex w-full justify-evenly">
  //           <h3 className="flex flex-col">
  //             <div className="h-[3px] w-full bg-[#7fd7c1]"></div>
  //             <span className="text-sm text-[#7fd7c1]">target ratio</span>
  //           </h3>

  //           <h3 className="flex flex-col">
  //             <div className="h-[3px] w-full bg-[#9f8cae]"></div>
  //             <span className="text-sm text-[#9f8cae]">min ratio</span>
  //           </h3>

  //           <h3 className="flex flex-col">
  //             <div className="h-[3px] w-full bg-[#eb6672]"></div>
  //             <span className="text-sm text-[#eb6672]">max ratio</span>
  //           </h3>
  //         </div>

  //         <Bar
  //           data={{
  //             labels: poolInfo.composition.map((comp) => comp.token.symbol),
  //             datasets: [
  //               {
  //                 label: 'Ratio',
  //                 data: poolInfo.composition.map((comp) => comp.currentRatio),
  //                 backgroundColor: '#fffffff0',
  //                 borderColor:
  //                   // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                   poolInfo.composition.map((comp) => comp.color!) || [],
  //                 borderWidth: 1,
  //               },
  //             ],
  //           }}
  //           options={{
  //             responsive: true,
  //             onHover: (event: ChartEvent, activeElements: ActiveElement[]) => {
  //               (event?.native?.target as HTMLElement).style.cursor =
  //                 activeElements?.length > 0 ? 'pointer' : 'auto';
  //             },
  //             plugins: {
  //               datalabels: {
  //                 align: 'end',
  //                 anchor: 'end',
  //                 color: () => '#ffffff',
  //                 font: (context: Context) => getFontSizeWeight(context),
  //                 // display labels (custodies name) on graph
  //                 formatter: (_, context: Context) => [
  //                   `${context.chart.data.labels?.[context.dataIndex]}`,
  //                 ],
  //               },
  //               annotation: {
  //                 annotations: poolInfo.composition.reduce(
  //                   (
  //                     lines: {
  //                       [key: string]: ReturnType<typeof generateLine>;
  //                     },
  //                     _: TokenInfo,
  //                     i: number,
  //                   ) => ({
  //                     // Target ratio line
  //                     [`line${(i + 1) * 3}`]: generateLine(
  //                       i,
  //                       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                       poolInfo.composition[i].targetRatio!, // checked above
  //                       '#7fd7c1',
  //                     ),

  //                     // Min ratio line
  //                     [`line${(i + 1) * 3 + 1}`]: generateLine(
  //                       i,
  //                       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                       poolInfo.composition[i].minRatio!, // checked above
  //                       '#9f8cae',
  //                     ),

  //                     // Max ratio line
  //                     [`line${(i + 1) * 3 + 2}`]: generateLine(
  //                       i,
  //                       // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                       poolInfo.composition[i].maxRatio!, // checked above
  //                       '#eb6672',
  //                     ),

  //                     ...lines,
  //                   }),
  //                   {},
  //                 ),
  //               },
  //               legend: {
  //                 display: false,
  //               },
  //               tooltip: {
  //                 displayColors: false,
  //                 callbacks: {
  //                   label: (context: TooltipItem<'bar'>) =>
  //                     (() => {
  //                       const comp = poolInfo.composition[context.dataIndex];

  //                       return [
  //                         `current ratio: ${formatNumber(
  //                           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                           comp.currentRatio!, // checked above
  //                           3,
  //                         )}%`,

  //                         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                         `min ratio: ${formatNumber(comp.minRatio!, 3)}%`,

  //                         `target ratio: ${formatNumber(
  //                           // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                           comp.targetRatio!, // checked above
  //                           3,
  //                         )}%`,

  //                         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  //                         `max ratio: ${formatNumber(comp.maxRatio!, 3)}%`, // checked above
  //                       ];
  //                     })(),

  //                   //remove title from tooltip because it is not needed and looks
  //                   title: () => '',
  //                 },
  //               },
  //             },
  //             //needed so the labels don't get hidden if bar is 100%
  //             layout: {
  //               padding: {
  //                 top: 20,
  //               },
  //             },
  //             scales: {
  //               x: {
  //                 display: false,
  //                 offset: true,
  //               },
  //               y: {
  //                 ticks: {
  //                   callback: (value: string | number) => value + '%',
  //                 },
  //                 beginAtZero: true,
  //               },
  //             },
  //           }}
  //         />
  //       </div>
  //     ) : null}
  //   </StyledContainer>
  // );
}
