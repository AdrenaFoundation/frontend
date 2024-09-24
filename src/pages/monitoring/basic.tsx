import React from 'react';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import UtilizationChart from '@/components/pages/global/UtilizationChart';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { PageProps } from '@/types';

export default function BasicMonitoring({
  mainPool,
  poolInfo,
}: PageProps & {
  poolInfo: PoolInfo | null;
}) {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2 p-4">
      <StyledContainer className="flex mt-4" bodyClassName="">
        <div className="grid lg:grid-cols-2 gap-16 lg:h-[18em]">
          <UtilizationChart />
          <UtilizationChart />
        </div>
      </StyledContainer>
    </div>
  );
}
