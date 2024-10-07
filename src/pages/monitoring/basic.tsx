import React, { useEffect, useState } from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import ALPPriceChart from '@/components/pages/global/ALPPrice/ALPPriceChart';
import AumChart from '@/components/pages/global/Aum/AumChart';
import CompositionChart from '@/components/pages/global/Composition/CompositionChart';
import FeesChart from '@/components/pages/global/Fees/FeesChart';
import OpenInterestChart from '@/components/pages/global/OpenInterest/OpenInterestChart';
import { RealizedPnlChart } from '@/components/pages/global/RealizedPnl/RealizedPnlChart';
import { UnrealizedPnlChart } from '@/components/pages/global/UnrealizedPnl/UnrealizedPnlChart';
import UtilizationChart from '@/components/pages/global/UtilizationChart/UtilizationChart';
import AllTimeAddRemoveLiquidityVolume from '@/components/pages/monitoring/Data/AllTimeAddRemoveLiquidityVolume';
import AllTimeFees from '@/components/pages/monitoring/Data/AllTimeFees';
import AllTimeLiquidationsVolume from '@/components/pages/monitoring/Data/AllTimeLiquidationsVolume';
import AllTimeTradingVolume from '@/components/pages/monitoring/Data/AllTimeTradingVolume';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

const className =
  'w-[12em] min-w-[12em] lg:w-[12em] lg:min-w-[12em] xl:w-[17em] xl:min-w-[17em] border-0 p-2 pb-4';
const titleClassName = 'text-xs lg:text-sm opacity-50 font-boldy';
const bodyClassName =
  'text-[1rem] lg:text-[1.3rem] xl:text-[1.5rem] font-bold h-4';

export default function BasicMonitoring({
  mainPool,
}: // custodies,
// poolInfo,
PageProps & {
  poolInfo: PoolInfo | null;
}) {
  const [isSmallScreen, setIsSmallSize] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const newIsSmallSize = window.innerWidth <= 500;
      console.log(
        `Window width: ${window.innerWidth}, isSmallSize: ${newIsSmallSize}`,
      );
      setIsSmallSize(newIsSmallSize);
    };

    handleResize(); // Call once to set initial state
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4">
      {mainPool && (
        <StyledContainer className="p-1">
          <div className="flex flex-wrap justify-between gap-2">
            <AllTimeTradingVolume
              className={className}
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
            <AllTimeLiquidationsVolume
              className={className}
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
            <AllTimeAddRemoveLiquidityVolume
              className={className}
              titleClassName={titleClassName}
              bodyClassName={bodyClassName}
              mainPool={mainPool}
            />
            <AllTimeFees
              className={className}
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
          <OpenInterestChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UnrealizedPnlChart isSmallScreen={isSmallScreen} />
          <RealizedPnlChart isSmallScreen={isSmallScreen} />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <FeesChart isSmallScreen={isSmallScreen} />
          <ALPPriceChart />
        </div>
      </StyledContainer>
    </div>
  );
}
