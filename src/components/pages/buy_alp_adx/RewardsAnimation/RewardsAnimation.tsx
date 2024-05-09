import React from 'react';

import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';

export default function RewardsAnimation() {
  return (
    <div className="flex flex-col sm:flex-row items-center z-10">
      <div>
        <h1 className="text-[36px] mb-1">
          Continuously receive your share of platform&apos;s revenues
        </h1>
        <p className="text-[24px]">
          Hold ALP and earn passive income: as the pool accrues fees, your share
          value grows, your share grows.
        </p>
      </div>
      <div className="w-full m-auto">
        <ADXFeeStreamAnimation token="ALP" />
      </div>
    </div>
  );
}
