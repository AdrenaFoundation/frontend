import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

export default function TradingStats({
  userProfile,
  className,
  livePositionsNb,
  showFeesInPnl,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  livePositionsNb: number | null;
  showFeesInPnl?: boolean;
}) {
  const [showAfterFees, setShowAfterFees] = useState(showFeesInPnl);

  // Calculate the total profit/loss (without fees)
  const totalProfitLoss = useMemo(() => {
    return (userProfile.longStats.profitsUsd +
      userProfile.shortStats.profitsUsd -
      userProfile.longStats.lossesUsd -
      userProfile.shortStats.lossesUsd) +
      (showAfterFees ? 0 : userProfile.longStats.feePaidUsd +
        userProfile.shortStats.feePaidUsd);
  }, [showAfterFees, userProfile.longStats.feePaidUsd, userProfile.longStats.lossesUsd, userProfile.longStats.profitsUsd, userProfile.shortStats.feePaidUsd, userProfile.shortStats.lossesUsd, userProfile.shortStats.profitsUsd]);

  return (
    <div className={twMerge("flex-wrap flex-row w-full flex gap-6 pl-4 pr-4", className)}>
      <NumberDisplay
        title={
          <div className='flex'>
            <div className='flex flex-col text-xs text-txtfade'>
              Realized PnL
            </div>

            <div className='flex gap-1 items-center justify-start absolute top-2 right-2'>
              <Switch
                className=""
                checked={showAfterFees}
                onChange={() => setShowAfterFees(!showAfterFees)}
                size="small"
              />
            </div>
          </div>
        }
        nb={totalProfitLoss}
        format="currency"
        precision={2}
        className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        bodyClassName={twMerge(
          'text-base',
          totalProfitLoss > 0 ? 'text-green' : '',
          totalProfitLoss < 0 ? 'text-red' : '',
        )}
        isDecimalDimmed={false}
        footer={
          <div className='text-xxs flex items-center justify-center text-txtfade mt-1'>{showAfterFees ? 'with fees' : 'without fees'}</div>
        }
      //  tippyInfo='This is the sum of all your profits and losses over all trades. Does not include fees.'
      />

      <NumberDisplay
        title="Fees Paid"
        nb={
          userProfile.longStats.feePaidUsd +
          userProfile.shortStats.feePaidUsd
        }
        format="currency"
        precision={2}
        className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        bodyClassName={twMerge(
          'text-base',
          (userProfile.longStats.feePaidUsd +
            userProfile.shortStats.feePaidUsd) > 0 ? 'text-red' : '',
        )}
        isDecimalDimmed={false}
      />

      <div className='flex-col w-full rounded-lg z-20 relative flex items-center flex-1 min-h-[2em] border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'>
        <div className='flex flex-col text-center justify-center pb-2 uppercase text-txtfade text-[0.7em] sm:text-[0.7em] font-boldy'>Positions</div>

        <div className='flex gap-1 items-center justify-center w-full'>
          <FormatNumber
            nb={
              userProfile.longStats.openedPositionCount +
              userProfile.shortStats.openedPositionCount
            }
            precision={0}
            className='text-base'
          />

          <div className='text-txtfade'>{'/'}</div>

          <div className='flex gap-1'>
            <FormatNumber
              nb={livePositionsNb}
              precision={0}
              className='text-base'
              suffixClassName='text-sm font-boldy text-txtfade'
            />

            <LiveIcon />
          </div>
        </div>
      </div>

      <NumberDisplay
        title="Liquidated Positions"
        className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
        bodyClassName='text-base'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        nb={
          userProfile.longStats.liquidatedPositionCount +
          userProfile.shortStats.liquidatedPositionCount
        }
        precision={0}
      />

      <NumberDisplay
        title="Total Open Volume"
        className='border-0 bg-third pl-4 pr-4 pt-5 pb-5 w-min-[9em]'
        bodyClassName='text-base'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        nb={
          userProfile.longStats.openingSizeUsd +
          userProfile.shortStats.openingSizeUsd
        }
        format="currency"
        precision={2}
      />
    </div>
  );
}
