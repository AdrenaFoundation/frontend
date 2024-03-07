import Tippy from '@tippyjs/react';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { twMerge } from 'tailwind-merge';

import { formatPriceInfo } from '@/utils';

import NumberInfo from '../monitoring/NumberInfo';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ProfitsAndLossesChart({
  longProfitsUsd,
  longLossesUsd,
  shortProfitsUsd,
  shortLossesUsd,
  className,
}: {
  longProfitsUsd: number;
  longLossesUsd: number;
  shortProfitsUsd: number;
  shortLossesUsd: number;
  className?: string;
}) {
  return (
    <div className={twMerge('w-[150px] h-[150px]', className)}>
      <Tippy
        content={
          <div className="flex flex-col space-y-1 text-sm">
            <div className="flex items-center">
              <span className="font-specialmonster">Profits:</span>
              <span className="ml-1 text-sm text-[#32a330]">
                {formatPriceInfo(longProfitsUsd + shortProfitsUsd)}
              </span>
            </div>

            <div className="flex items-center">
              <span className="font-specialmonster">Losses:</span>
              <span className="ml-1 text-sm text-[#d23e3e]">
                -{formatPriceInfo(longLossesUsd + shortLossesUsd)}
              </span>
            </div>
          </div>
        }
        placement="top"
      >
        <div className="relative">
          <Doughnut
            className="opacity-70"
            height={150}
            width={150}
            options={{
              cutout: 55,
              plugins: {
                legend: {
                  display: false,
                  position: 'bottom',
                  align: 'center',
                  fullSize: true,
                },

                tooltip: {
                  enabled: false,
                },
              },
            }}
            data={{
              labels: ['Profits', 'Losses'],
              datasets: [
                {
                  label: 'Total',
                  data: [
                    longProfitsUsd + shortProfitsUsd,
                    longLossesUsd + shortLossesUsd,
                  ],
                  borderWidth: 0,
                  backgroundColor: ['#32a330', '#d23e3e'],
                },
              ],
            }}
          />

          {/* Homemade legend */}
          <div className="flex flex-col w-full justify-around mt-4 absolute top-[2.8em] left-[-0.4em] space-y-2">
            <div className="w-[10em] flex items-center justify-center">
              {
                <NumberInfo
                  className="text-xl font-specialmonster"
                  value={
                    longProfitsUsd +
                    shortProfitsUsd -
                    longLossesUsd -
                    shortLossesUsd
                  }
                />
              }
            </div>
          </div>
        </div>
      </Tippy>
    </div>
  );
}
