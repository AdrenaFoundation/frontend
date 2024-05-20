import React from 'react';

import ADXFeeStreamAnimation from '@/components/buy_adx/ADXFeeStreamAnimation';
import Button from '@/components/common/Button/Button';

export default function RewardsAnimation() {
  return (
    <div className="flex flex-col sm:flex-row items-center z-10">
      <div className="w-full">
        <h1 className="text-[36px] mb-1">GET PASSIVE INCOME</h1>
        <p className="text-[24px] max-w-[600px]">
          The value of each share of ALP naturally appreciates as fee revenue
          grows
        </p>
        <Button size="lg" title="Stake ALP" href={'/stake'} className="mt-3" />
      </div>
      <div className="w-full m-auto">
        <ADXFeeStreamAnimation token="ALP" />
      </div>
    </div>
  );
}
