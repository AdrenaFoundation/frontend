import React from 'react';
import { AprLmChart } from '@/components/pages/global/Apr/AprLmChart';

export default function ADXAPRChartWrapper() {
  return (
    <div className="w-full h-[13em] -mb-4">
      <AprLmChart defaultPeriod="1M" defaultLockPeriod={540} />
    </div>
  );
}
