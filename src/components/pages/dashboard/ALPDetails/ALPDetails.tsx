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

import useALPIndexComposition from '@/hooks/useALPIndexComposition';
import useALPTotalSupply from '@/hooks/useALPTotalSupply';
import { useSelector } from '@/store/store';
import { CustodyExtended } from '@/types';
import { formatNumber, formatPercentage, formatPriceInfo } from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ALPDetails({
  className,
  custodies,
}: {
  className?: string;
  custodies: CustodyExtended[] | null;
}) {
  const composition = useALPIndexComposition(custodies);
  const alpTotalSupply = useALPTotalSupply();
  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.name]) ??
    null;

  const marketCap =
    alpPrice !== null && alpTotalSupply != null
      ? alpPrice * alpTotalSupply
      : null;

  // Add currentRatio of stable tokens
  const stablecoinPercentage = composition
    ? composition.reduce((total, comp) => {
        return total + (comp.token.isStable ? comp.currentRatio ?? 0 : 0);
      }, 0)
    : null;

  return (
    <div
      className={twMerge(
        'border',
        'border-gray-300',
        'bg-gray-200 rounded-lg',
        'flex',
        'flex-col',
        className,
      )}
    >
      <div className="flex flex-col">
        {/* infos */}
        <div className="border border-b-gray-300 flex items-center p-4">
          <Image
            src={window.adrena.client.alpToken.image}
            alt="ALP icon"
            className="h-8 mr-2"
            height="32"
            width="32"
          />
          ALP
        </div>

        <div className="flex flex-col sm:flex-row items-center">
          <div className="flex flex-col gap-3 grow border border-r-gray-300 h-full p-4">
            <div>
              <p className="opacity-50 mb-1">Price</p>
              <p className="font-mono text-lg">{formatPriceInfo(alpPrice)}</p>
            </div>

            <div>
              <div className="opacity-50 mb-1">Supply</div>
              <p className="font-mono text-lg">
                {alpTotalSupply !== null
                  ? `${formatNumber(
                      alpTotalSupply,
                      window.adrena.client.alpToken.decimals,
                    )} ALP`
                  : '-'}
              </p>
            </div>

            <div>
              <p className="opacity-50 mb-1">Market Cap</p>
              <p className="font-mono text-lg">{formatPriceInfo(marketCap)}</p>
            </div>

            <div>
              <p className="opacity-50 mb-1">Stablecoin Percentage</p>
              <p className="font-mono text-lg">
                {formatPercentage(stablecoinPercentage, 2)}
              </p>
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
              'sm:mt-0',
              'pl-4',
              'ml-auto',
              'mr-auto',
              'sm:ml-0',
              'sm:mr-0',
            )}
          >
            {composition ? (
              <>
                <div className="absolute">Composition</div>
                <Doughnut
                  data={{
                    labels: composition.map((comp) => comp.token.name),
                    datasets: [
                      {
                        label: 'ALP Pool',
                        data: composition.map((comp) => comp.currentRatio),
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
    </div>
  );
}
