import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

import infoIcon from '../../../../public/images/Icons/info.svg';

export default function TradingStatsBloc({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  const totalProfitLoss =
    userProfile.longStats.profitsUsd +
    userProfile.shortStats.profitsUsd -
    userProfile.longStats.lossesUsd -
    userProfile.shortStats.lossesUsd;

  return (
    <StyledContainer
      title="Trading Stats"
      titleClassName="text-2xl"
      className={twMerge(className)}
    >
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade">Opened positions count</div>

          <FormatNumber
            nb={
              userProfile.longStats.openedPositionCount +
              userProfile.shortStats.openedPositionCount
            }
            precision={1}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade">Liquidated positions count</div>

          <FormatNumber
            nb={
              userProfile.longStats.liquidatedPositionCount +
              userProfile.shortStats.liquidatedPositionCount
            }
            precision={1}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade">All time volume</div>

          <FormatNumber
            nb={
              userProfile.longStats.openingSizeUsd +
              userProfile.shortStats.openingSizeUsd
            }
            format="currency"
            precision={2}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade flex items-center">
            Account overall PnL
            <span className="ml-1">
              <Tippy
                content={
                  <p className="font-medium">
                    This is the sum of all your profits and losses over all trades, including fees.
                  </p>
                }
              >
                <Image src={infoIcon} width={12} height={12} alt="info icon" />
              </Tippy>
            </span>
          </div>

          <FormatNumber
            nb={totalProfitLoss}
            format="currency"
            precision={2}
            className={totalProfitLoss >= 0 ? 'text-green' : 'text-red'}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade flex items-center">
            Total fees
            <span className="ml-1">
              <Tippy
                content={
                  <p className="font-medium">
                    This include the Open/Close fees (0 bps open, 16bps close) and the Borrow fees.
                  </p>
                }
              >
                <Image src={infoIcon} width={12} height={12} alt="info icon" />
              </Tippy>
            </span>
          </div>
          <FormatNumber
            nb={
              userProfile.longStats.feePaidUsd +
              userProfile.shortStats.feePaidUsd
            }
            format="currency"
            precision={2}
            className="text-red"
          />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
