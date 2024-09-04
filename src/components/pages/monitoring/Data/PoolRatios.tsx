import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from 'chart.js';
import ChartPluginAnnotation from 'chartjs-plugin-annotation';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PoolInfo } from '@/hooks/usePoolInfo';

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

export default function PoolRatios({
  poolInfo,
  titleClassName,
}: {
  poolInfo: PoolInfo | null;
  titleClassName?: string;
}) {
  return (
    <StyledContainer
      title="Pool Ratios"
      headerClassName="ml-auto mr-auto"
      className="grow w-[30em] h-auto max-w-[40em]"
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
}
