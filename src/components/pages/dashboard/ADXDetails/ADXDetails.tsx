import {
  ActiveElement,
  ArcElement,
  Chart as ChartJS,
  ChartEvent,
  Legend,
  Tooltip,
} from 'chart.js';
import Image from 'next/image';
import { Doughnut } from 'react-chartjs-2';
import { twMerge } from 'tailwind-merge';

import useADXTotalSupply from '@/hooks/useADXTotalSupply';
import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import { useSelector } from '@/store/store';
import { CustodyExtended } from '@/types';
import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ADXDetails({
  className,
  custodies,
}: {
  className?: string;
  custodies: CustodyExtended[] | null;
}) {
  const rowClasses = 'flex justify-between mt-2';

  const composition = useALPIndexComposition(custodies);
  const adxTotalSupply = useADXTotalSupply();
  const adxPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.adxToken.name]) ??
    null;

  const marketCap =
    adxPrice !== null && adxTotalSupply != null
      ? adxPrice * adxTotalSupply
      : null;

  // @TODO plug to staking system
  const staked = 0;
  const vested = 0;
  const liquid = 100;

  return (
    <div
      className={twMerge(
        'border',
        'border-grey',
        'bg-secondary',
        'flex',
        'flex-col',
        className,
      )}
    >
      <div className="p-4 flex flex-col sm:flex-row">
        {/* infos */}
        <div className="flex flex-col grow">
          <div className="pb-2 border-b border-grey flex items-center">
            <Image
              src={window.adrena.client.adxToken.image}
              alt="ADX icon"
              className="h-8 mr-2"
              height="32"
              width="32"
            />
            ADX
          </div>

          <div className={rowClasses}>
            <div className="text-txtfade">Price</div>
            <div>{formatPriceInfo(adxPrice)}</div>
          </div>

          <div className={rowClasses}>
            <div className="text-txtfade">Supply</div>
            <div>
              {adxTotalSupply !== null
                ? `${formatNumber(
                    adxTotalSupply,
                    window.adrena.client.adxToken.decimals,
                  )} ADX`
                : '-'}
            </div>
          </div>

          <div className={rowClasses}>
            <div className="text-txtfade">Market Cap</div>
            <div>{formatPriceInfo(marketCap)}</div>
          </div>
        </div>

        {/* chart */}
        <div
          className={twMerge(
            'flex',
            'flex-col',
            'h-[10em]',
            'w-[10em]',
            'relative',
            'grow',
            'items-center',
            'justify-center',
            'mt-4',
            'pl-4',
            'sm:mt-0',
            'ml-auto',
            'mr-auto',
            'sm:ml-0',
            'sm:mr-0',
          )}
        >
          {composition ? (
            <>
              <div className="absolute">Distribution</div>
              <Doughnut
                data={{
                  labels: ['staked', 'vested', 'liquid'],
                  datasets: [
                    {
                      label: 'ALP Pool',
                      data: [staked, vested, liquid],
                      backgroundColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                      ],
                      borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                      ],
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  // Active cursor pointer for hovering
                  onHover: (
                    event: ChartEvent,
                    activeElements: ActiveElement[],
                  ) => {
                    (event?.native?.target as HTMLElement).style.cursor =
                      activeElements?.length > 0 ? 'pointer' : 'auto';
                  },
                  cutout: '90%',
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      displayColors: false,
                      callbacks: {
                        // Display the % of tokens
                        label: ({ label, raw }) =>
                          `${label}: ${formatPercentage(raw as number, 2)}`,

                        // remove title
                        title: () => '',
                      },
                    },
                  },
                }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
