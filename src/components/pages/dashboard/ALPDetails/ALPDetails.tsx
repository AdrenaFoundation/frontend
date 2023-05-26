import {
  ActiveElement,
  ArcElement,
  Chart as ChartJS,
  ChartEvent,
  Legend,
  Tooltip,
} from 'chart.js';
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
  const rowClasses = 'flex justify-between mt-2';

  const composition = useALPIndexComposition(custodies);
  const alpTotalSupply = useALPTotalSupply();
  const alpPrice =
    useSelector((s) => s.tokenPrices?.[window.adrena.client.alpToken.name]) ??
    null;

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
          <div className="pb-2 border-b border-grey">ALP</div>

          <div className={rowClasses}>
            <div className="text-txtfade">Price</div>
            <div>{formatPriceInfo(alpPrice)}</div>
          </div>

          <div className={rowClasses}>
            <div className="text-txtfade">Supply</div>
            <div>
              {alpTotalSupply !== null
                ? `${formatNumber(
                    alpTotalSupply,
                    window.adrena.client.alpToken.decimals,
                  )} ALP`
                : '-'}
            </div>
          </div>

          <div className={rowClasses}>
            <div className="text-txtfade">Stablecoin Percentage</div>
            <div>{formatPercentage(stablecoinPercentage, 2)}</div>
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
  );
}
