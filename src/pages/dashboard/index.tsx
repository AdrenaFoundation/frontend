import { twMerge } from 'tailwind-merge';

import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import Stats from '@/components/pages/dashboard/Stats/Stats';
import { PageProps } from '@/types';

export default function Dashboard({ client, mainPool, custodies }: PageProps) {
  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'bg-main',
        'justify-center',
      )}
    >
      <div
        className={twMerge(
          'w-full',
          'flex',
          'max-w-[1400px]',
          'flex-col',
          'grow',
        )}
      >
        <div className="text-3xl mt-6">Stats</div>

        <div className="flex justify-evenly flex-col sm:flex-row mt-8 sm:mt-4 md:mt-0">
          <Overview
            className="sm:m-4"
            aumUsd={mainPool?.aumUsd ?? null}
            longPositions={mainPool?.longPositions ?? null}
            shortPositions={mainPool?.shortPositions ?? null}
            nbOpenLongPositions={mainPool?.nbOpenLongPositions ?? null}
            nbOpenShortPositions={mainPool?.nbOpenShortPositions ?? null}
            averageLongLeverage={mainPool?.averageLongLeverage ?? null}
            averageShortLeverage={mainPool?.averageShortLeverage ?? null}
          />

          <Stats
            className="mt-4 sm:mt-0 sm:m-4"
            totalCollectedFees={mainPool?.totalFeeCollected ?? null}
            totalVolume={mainPool?.totalVolume ?? null}
          />
        </div>

        <div className="text-3xl mt-6">Tokens</div>

        <ALPIndexComposition
          client={client}
          custodies={custodies}
          className="mt-4"
        />
      </div>
    </div>
  );
}
