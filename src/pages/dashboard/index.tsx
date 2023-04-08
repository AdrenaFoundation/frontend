import { twMerge } from 'tailwind-merge';

import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import Stats from '@/components/pages/dashboard/Stats/Stats';
import useAdrenaClient from '@/hooks/useAdrenaClient';
import useConnection from '@/hooks/useConnection';
import useCustodies from '@/hooks/useCustodies';
import useListenToPythTokenPricesChange from '@/hooks/useListenToPythTokenPricesChange';
import useMainPool from '@/hooks/useMainPool';
import useWatchWalletBalance from '@/hooks/useWatchWalletBalance';

export default function Trade() {
  const client = useAdrenaClient();
  const connection = useConnection();
  const mainPool = useMainPool(client);
  const custodies = useCustodies(client, mainPool);

  useListenToPythTokenPricesChange(client, connection);
  useWatchWalletBalance(client, connection);

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
          uiAumUsd={mainPool?.uiAumUsd ?? null}
          uiLongPositions={mainPool?.uiLongPositions ?? null}
          uiShortPositions={mainPool?.uiShortPositions ?? null}
          nbOpenLongPositions={mainPool?.nbOpenLongPositions ?? null}
          nbOpenShortPositions={mainPool?.nbOpenShortPositions ?? null}
          averageLongLeverage={mainPool?.averageLongLeverage ?? null}
          averageShortLeverage={mainPool?.averageShortLeverage ?? null}
        />

        <Stats
          className="mt-4 sm:mt-0 sm:m-4"
          totalCollectedFees={mainPool?.uiTotalFeeCollected ?? null}
          totalVolume={mainPool?.uiTotalVolume ?? null}
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
