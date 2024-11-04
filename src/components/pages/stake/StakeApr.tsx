
import React, { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';

export default function StakeApr({
  token,
  className,
}: {
  token: 'ADX' | 'ALP';
  className?: string;
}) {
  const [aprRolling7D, setAprRolling7D] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    // const res = await fetch(
    //   `https://datapi.adrena.xyz/${dataEndpoint}?cumulative_profit_usd=true&cumulative_loss_usd=true&start_date=${(() => {
    //     const startDate = new Date();
    //     startDate.setDate(startDate.getDate() - 7);

    //     return startDate.toISOString();
    //   })()}&end_date=${new Date().toISOString()}`,
    // );

    setAprRolling7D(19);
  }, []);

  useEffect(() => {
    loadData();

    const interval = setInterval(loadData, 60 * 1000);

    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className={twMerge("flex flex-wrap bg-main rounded-2xl border h-18", className)}>
      <NumberDisplay
        title="Overall APR"
        nb={aprRolling7D}
        format="percentage"
        precision={2}
        className="border-0"
        isDecimalDimmed={false}
        bodyClassName="text-sm"
        headerClassName="pb-0"
        titleClassName="text-xs sm:text-xs"
      />

      <div className='flex grow border-l'>
        <NumberDisplay
          title="90d APR"
          nb={aprRolling7D}
          format="percentage"
          precision={2}
          className="border-0"
          isDecimalDimmed={false}
          bodyClassName="text-sm"
          headerClassName="pb-0"
          titleClassName="text-xs sm:text-xs"
        />

        <NumberDisplay
          title="180d APR"
          nb={aprRolling7D}
          format="percentage"
          precision={2}
          className="border-0"
          isDecimalDimmed={false}
          bodyClassName="text-sm"
          headerClassName="pb-0"
          titleClassName="text-xs sm:text-xs"
        />

        <NumberDisplay
          title="360d APR"
          nb={aprRolling7D}
          format="percentage"
          precision={2}
          className="border-0"
          isDecimalDimmed={false}
          bodyClassName="text-sm"
          headerClassName="pb-0"
          titleClassName="text-xs sm:text-xs"
        />

        <NumberDisplay
          title="540d APR"
          nb={aprRolling7D}
          format="percentage"
          precision={2}
          className="border-0"
          isDecimalDimmed={false}
          bodyClassName="text-sm"
          headerClassName="pb-0"
          titleClassName="text-xs sm:text-xs"
        />
      </div>
    </div >
  );
}
