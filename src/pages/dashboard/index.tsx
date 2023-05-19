import { twMerge } from 'tailwind-merge';

import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import Stats from '@/components/pages/dashboard/Stats/Stats';
import { PYTH_ORACLE_RPC } from '@/constant';
import useConnection from '@/hooks/useConnection';
import useCustodies from '@/hooks/useCustodies';
import useMainPool from '@/hooks/useMainPool';
import useWatchTokenPrices from '@/hooks/useWatchTokenPrices';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';
import { PageProps } from '@/types';

export default function Dashboard({ client }: PageProps) {
  const pythConnection = useConnection(PYTH_ORACLE_RPC);
  const mainPool = useMainPool(client);
  const custodies = useCustodies(client, mainPool);

  useWatchTokenPrices(client, pythConnection);
  useWatchWalletBalance(client);

  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'overflow-auto',
        'flex-col',
        'bg-main',
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
  );
}
