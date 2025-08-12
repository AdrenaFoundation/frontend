import React from 'react';
import { EmissionsChart } from '@/components/pages/global/Emissions/EmissionsChart';

export default function ADXLMChartWrapper() {
  return (
    <div className="w-full h-[13em]">
      <EmissionsChart
        isSmallScreen={false}
        showOnlyADX={true}
        customTitle="ADX Liquidity Mining Emissions"
      />
    </div>
  );
}
