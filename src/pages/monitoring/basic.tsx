import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ALPPriceChart from '@/components/pages/global/ALPPrice/ALPPriceChart';
import AumChart from '@/components/pages/global/Aum/AumChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import CumulativePnlChart from '@/components/pages/global/CumulativePnl/CumulativePnlChart';
import FeesChart from '@/components/pages/global/Fees/FeesChart';
import OpenInterestChart from '@/components/pages/global/OpenInterest/OpenInterestChart';
import UnrealizedPnlChart from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import AllTimeAddRemoveLiquidityVolume from '@/components/pages/monitoring/Data/AllTimeAddRemoveLiquidityVolume';
import AllTimeFees from '@/components/pages/monitoring/Data/AllTimeFees';
import AllTimeLiquidationsVolume from '@/components/pages/monitoring/Data/AllTimeLiquidationsVolume';
import AllTimeTradingVolume from '@/components/pages/monitoring/Data/AllTimeTradingVolume';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

const titleClassName = 'text-sm opacity-50 font-bold';
const bodyClassName = 'text-3xl font-bold';

export default function BasicMonitoring({
  mainPool,
  // custodies,
  // poolInfo,
}: PageProps & {
  poolInfo: PoolInfo | null;
}) {
  return (
    <div className="flex flex-col gap-4 p-4">
      {mainPool && (
        <StyledContainer className="p-3">
          <div className="flex justify-between gap-2">
            <AllTimeTradingVolume
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
            <AllTimeLiquidationsVolume
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool} />
            <AllTimeAddRemoveLiquidityVolume
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool} />
            <AllTimeFees
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
          </div>
        </StyledContainer>
      )}
      <StyledContainer className="flex gap-6" bodyClassName="">
        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <AumChart />
          <UtilizationChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <CompositionChart />
          <OpenInterestChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UnrealizedPnlChart />
          <CumulativePnlChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <FeesChart />
          <ALPPriceChart />
        </div>
      </StyledContainer>
    </div>
  );
}
