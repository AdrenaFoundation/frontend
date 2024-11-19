import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

export default function TradingStats({
  userProfile,
  className,
  livePositionsNb,
}: {
  userProfile: UserProfileExtended;
  className?: string;
  livePositionsNb: number | null;
}) {
  // Calculate the total profit/loss (without fees)
  const totalProfitLoss =
    (userProfile.longStats.profitsUsd +
      userProfile.shortStats.profitsUsd -
      userProfile.longStats.lossesUsd -
      userProfile.shortStats.lossesUsd) +
    userProfile.longStats.feePaidUsd +
    userProfile.shortStats.feePaidUsd;

  return (
    <div className={twMerge("flex-wrap flex-row w-full flex", className)}>
      <NumberDisplay
        title="Realized PnL"
        nb={totalProfitLoss}
        format="currency"
        precision={2}
        className='border-0 min-w-[9em] p-1'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        bodyClassName={twMerge(
          'text-base',
          totalProfitLoss > 0 ? 'text-green' : '',
          totalProfitLoss < 0 ? 'text-red' : '',
        )}
        isDecimalDimmed={false}
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
        className='border-0 min-w-[9em] p-1'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        bodyClassName={twMerge(
          'text-base',
          (userProfile.longStats.feePaidUsd +
            userProfile.shortStats.feePaidUsd) > 0 ? 'text-red' : '',
        )}
        isDecimalDimmed={false}
      />

      <div className='flex-col w-full rounded-lg z-20 relative flex items-center flex-1 min-h-[2em] bg-transparent border-0 min-w-[9em] p-1'>
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
        className='border-0 min-w-[9em] p-1'
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
        title="Total Volume"
        className='border-0 min-w-[9em] p-1'
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
