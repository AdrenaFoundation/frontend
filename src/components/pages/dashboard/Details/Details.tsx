import {
  ActiveElement,
  ArcElement,
  Chart as ChartJS,
  ChartData,
  ChartEvent,
  Legend,
  Tooltip,
} from 'chart.js';
import { ReactNode } from 'react';
import { Doughnut } from 'react-chartjs-2';

import { formatPercentage } from '@/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Details({
  title,
  details,
  chart,
}: {
  title: string;
  details: { title: string; value: ReactNode | null }[];
  chart: ChartData<'doughnut'>;
}) {
  return (
    <div className="border sm:w-full border-gray-300 bg-gray-200 rounded-lg flex flex-col">
      <div className="flex flex-col">
        {/* infos */}
        <div className="border-b border-b-gray-300 flex items-center p-4">
          <div
            className={`p-1 mr-2 bg-${
              title === 'ADX' ? 'red' : 'blue'
            }-500 rounded-full`}
          >
            <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
              {title === 'ADX' ? 'ADX' : 'ALP'}
            </p>
          </div>
          <h2 className="text-lg font-medium">{title}</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center">
          <div className="flex flex-col gap-5 sm:border-r sm:border-r-gray-300 w-full h-full p-4 ">
            {details &&
              details.map((detail) => (
                <div
                  className="flex flex-row sm:flex-col justify-between"
                  key={detail.title}
                >
                  <div className="opacity-50 mb-1 text-sm">{detail.title}</div>
                  <p className="font-mono text-sm sm:text-lg">
                    {detail.value !== null ? detail.value : '–'}
                  </p>
                </div>
              ))}
          </div>

          {/* chart */}
          <div className="relative flex flex-col p-4 items-center justify-center m-auto w-full lg:max-w-[300px]">
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
