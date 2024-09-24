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
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

export default function BasicMonitoring({}: PageProps & {
  poolInfo: PoolInfo | null;
}) {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 p-4">
      <StyledContainer className="flex mt-4" bodyClassName="">
        <div className="grid lg:grid-cols-2 gap-16 lg:h-[18em]">
          <AumChart />
          <UtilizationChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:h-[18em]">
          <CompositionChart />
          <OpenInterestChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:h-[18em]">
          <UnrealizedPnlChart />
          <CumulativePnlChart />
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:h-[18em]">
          <FeesChart />
          <ALPPriceChart />
        </div>
      </StyledContainer>
    </div>
  );
}
