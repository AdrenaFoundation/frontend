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

import { formatPercentage } from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Details({
  title,
  details,
  chart,
}: {
  title: string;
  details: { title: string; value: string | null }[];
  chart: any; // @TODO: type this
}) {
  return (
    <div
      className={twMerge(
        'border w-full',
        'border-gray-300',
        'bg-gray-200 rounded-lg',
        'flex',
        'flex-col',
      )}
    >
      <div className="flex flex-col">
        {/* infos */}
        <div className="border-b border-b-gray-300 flex items-center p-4">
          <Image
            src={
              title === 'ALP'
                ? window.adrena.client.alpToken.image
                : window.adrena.client.adxToken.image
            }
            alt="ALP icon"
            className="h-8 mr-2"
            height="32"
            width="32"
          />
          <h2 className="text-lg font-medium">{title}</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center">
          <div className="flex flex-col gap-5 sm:border-r sm:border-r-gray-300 w-full h-full p-4 md:min-w-[250px]">
            {details &&
              details.map((detail) => (
                <div
                  className="flex flex-row sm:flex-col justify-between"
                  key={detail.title}
                >
                  <div className="opacity-50 mb-1 text-sm">{detail.title}</div>
                  <p className="font-mono text-sm sm:text-lg">
                    {detail.value !== null ? detail.value : '-'}
                  </p>
                </div>
              ))}
          </div>

          {/* chart */}
          <div className="relative flex flex-col p-4 items-center justify-center m-auto max-w-[300px]">
            {chart ? (
              <>
                <div className="absolute mt-7">
                  {title === 'ALP' ? 'Composition' : 'Distribution'}
                </div>
                <Doughnut
                  data={chart}
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
                        display: true,

                        labels: {
                          boxWidth: 5,
                          boxHeight: 5,
                          usePointStyle: true,
                          borderRadius: 10,
                        },
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
