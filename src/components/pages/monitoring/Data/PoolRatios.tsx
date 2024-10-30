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
import Image from 'next/image';
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
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>Pool Ratios</p>
      </div>

      <div className="grid md:grid-cols-2">
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
                  className={twMerge('p-5',
                    i % 2 && 'border-t md:border-l',
                    i > 1 && 'border-t',
                    i == 1 && 'md:border-t-0',
                  )}
                  key={i}
                >
                  <div className="flex flex-row items-center gap-2">
                    <Image
                      src={token.image}
                      alt="token icon"
                      width="24"
                      height="24"
                    />

                    <p className="text-lg font-boldy">{token.symbol}</p>
                  </div>
                  <div
                    className={twMerge(
                      'relative flex items-center h-[125px] w-full sm:text-base md:text-lg',
                    )}
                    key={i}
                  >
                    <div className="bg-third rounded-lg h-3 w-full relative overflow-visible">
                      <div className="absolute left-0 -bottom-8 font-mono text-sm text-gray-500">
                        Min: {minRatio}%
                      </div>

                      <div className="absolute right-0 -bottom-8 font-mono text-sm text-gray-500">
                        {maxRatio}%: Max
                      </div>

                      <>
                        <div
                          className="absolute -top-14 whitespace-nowrap font-mono text-sm text-gray-500"
                          style={{
                            left: `${targetRatioPercentage + 2}%`,
                          }}
                        >
                          Target: {targetRatio}%
                        </div>

                        <div className="relative flex items-center justify-center bg-bcolor h-[60px] w-[4px] z-1 -top-14 mx-auto">
                          <div className="absolute top-0 w-2 h-2 rounded-full bg-bcolor" />
                        </div>
                      </>

                      <div
                        className={twMerge(
                          'text-base md:text-xl absolute -top-8 text-[#9f8cae] flex',
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
                          'h-2 left-1 absolute bottom-0.5 rounded-full',
                          currentRatio < minRatio || currentRatio > maxRatio
                            ? 'bg-red opacity-90'
                            : 'bg-[#7fd7c1]',
                        )}
                        style={{
                          width: `${currentRatioPercentage > 100
                            ? 100
                            : currentRatioPercentage
                            }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            },
          )
          : null}
      </div>
    </div>
  );
}
