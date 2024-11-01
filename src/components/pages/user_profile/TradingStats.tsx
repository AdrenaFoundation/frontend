import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { UserProfileExtended } from '@/types';

import infoIcon from '../../../../public/images/Icons/info.svg';

export default function TradingStats({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  // Calculate the total profit/loss (without fees)
  const totalProfitLoss =
    userProfile.longStats.profitsUsd +
    userProfile.shortStats.profitsUsd -
    userProfile.longStats.lossesUsd -
    userProfile.shortStats.lossesUsd -
    userProfile.longStats.feePaidUsd -
    userProfile.shortStats.feePaidUsd;

  return (
    <StyledContainer
      title="Trading Stats"
      titleClassName="text-2xl"
      className={className}
      bodyClassName=""
    >
      <div className='flex flex-wrap flex-col sm:flex-row w-full gap-4'>
        <NumberDisplay
          title="Realized PnL"
          nb={totalProfitLoss}
          format="currency"
          precision={2}
          className={twMerge(
            totalProfitLoss > 0 ? 'text-green' : '',
            totalProfitLoss < 0 ? 'text-red' : '',
          )}
          tippyInfo='This is the sum of all your profits and losses over all trades. Does not include fees.'
        />

        <NumberDisplay
          title="Paid Fees"
          nb={
            userProfile.longStats.feePaidUsd +
            userProfile.shortStats.feePaidUsd
          }
          format="currency"
          precision={2}
          className={twMerge(
            (userProfile.longStats.feePaidUsd +
              userProfile.shortStats.feePaidUsd) > 0 ? 'text-red' : '',
          )}
          tippyInfo='This include the Open/Close fees (0 bps open, 16bps close) and the Borrow fees.'
        />
      </div>

      <div className='flex flex-wrap flex-col sm:flex-row w-full gap-4'>
        <NumberDisplay
          title="Opened Positions Count"
          nb={
            userProfile.longStats.openedPositionCount +
            userProfile.shortStats.openedPositionCount
          }
          precision={0}
        />

        <NumberDisplay
          title="Liquidated Positions Count"
          nb={
            userProfile.longStats.liquidatedPositionCount +
            userProfile.shortStats.liquidatedPositionCount
          }
          precision={0}
        />

        <NumberDisplay
          title="All Time Volume"
          nb={
            userProfile.longStats.openingSizeUsd +
            userProfile.shortStats.openingSizeUsd
          }
          format="currency"
          precision={2}
        />
      </div>
    </StyledContainer >
  );
}
