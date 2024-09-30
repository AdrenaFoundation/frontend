import React, { useState } from 'react';
import { CategoricalChartState } from 'recharts/types/chart/types';

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
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isActive, setIsActive] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(0);

  // get the position of the mouse
  const handleMouseMove = (bar: CategoricalChartState) => {
    const { chartX, chartY, activeTooltipIndex } = bar;
    if (!chartX || !chartY || activeTooltipIndex === undefined) {
      return;
    }
    setIsActive(true);

    setPosition({ x: chartX, y: chartY });
    setActiveIndex(activeTooltipIndex);
  };

  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 p-4">
      <StyledContainer className="flex gap-6">
        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <AumChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
          <UtilizationChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <CompositionChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
          <OpenInterestChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <UnrealizedPnlChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
          <CumulativePnlChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-[2em] h-[37em] lg:h-[18em]">
          <FeesChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
          <ALPPriceChart
            position={position}
            isActive={isActive}
            setIsActive={setIsActive}
            handleMouseMove={handleMouseMove}
            activeIndex={activeIndex}
          />
        </div>
      </StyledContainer>
    </div>
  );
}
