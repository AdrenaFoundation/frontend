import ADXDetails from '@/components/pages/dashboard/ADXDetails/ADXDetails';
import ALPDetails from '@/components/pages/dashboard/ALPDetails/ALPDetails';
import ALPIndexComposition from '@/components/pages/dashboard/ALPIndexComposition/ALPIndexComposition';
import Overview from '@/components/pages/dashboard/Overview/Overview';
import Stats from '@/components/pages/dashboard/Stats/Stats';
import { PageProps } from '@/types';

export default function Dashboard({ mainPool, custodies }: PageProps) {
  return (
    <>
      <h1>Stats</h1>

      <div className="flex justify-between flex-col sm:flex-row mt-4">
        <Overview
          className="grow sm:mr-4"
          aumUsd={mainPool?.aumUsd ?? null}
          longPositions={mainPool?.longPositions ?? null}
          shortPositions={mainPool?.shortPositions ?? null}
          nbOpenLongPositions={mainPool?.nbOpenLongPositions ?? null}
          nbOpenShortPositions={mainPool?.nbOpenShortPositions ?? null}
          averageLongLeverage={mainPool?.averageLongLeverage ?? null}
          averageShortLeverage={mainPool?.averageShortLeverage ?? null}
        />

        <Stats
          className="mt-2 sm:mt-0 grow"
          totalCollectedFees={mainPool?.totalFeeCollected ?? null}
          totalVolume={mainPool?.totalVolume ?? null}
        />
      </div>

      <div className="text-4xl mt-6">Tokens</div>

      <div className="flex justify-between flex-col sm:flex-row mt-4">
        <ALPDetails className="grow sm:mr-4" custodies={custodies} />
        <ADXDetails className="mt-2 sm:mt-0 grow" custodies={custodies} />
      </div>

      <ALPIndexComposition custodies={custodies} className="mt-4" />
    </>
  );
}
