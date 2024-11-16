import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { UserProfileExtended } from '@/types';

export default function TradingStats({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
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
    <StyledContainer
      className={className}
      bodyClassName="gap-1 flex-wrap flex-col sm:flex-row"
    >
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
      // tippyInfo='This include the Open/Close fees (0 bps open, 16bps close) and the Borrow fees.'
      />

      <NumberDisplay
        title="Positions"
        className='border-0 min-w-[9em] p-1'
        bodyClassName='text-base'
        headerClassName='pb-2'
        titleClassName='text-[0.7em] sm:text-[0.7em]'
        nb={
          userProfile.longStats.openedPositionCount +
          userProfile.shortStats.openedPositionCount
        }
        precision={0}
      />

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
    </StyledContainer >
  );
}
