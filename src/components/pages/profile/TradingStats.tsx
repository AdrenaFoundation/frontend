import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LiveIcon from '@/components/common/LiveIcon/LiveIcon';
import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import Switch from '@/components/common/Switch/Switch';
import FormatNumber from '@/components/Number/FormatNumber';
import { useSelector } from '@/store/store';
import { EnrichedTraderInfo } from '@/types';
import { formatSecondsToTimeDifference } from '@/utils';

export default function TradingStats({
  traderInfo,
  className,
  livePositionsNb,
}: {
  traderInfo: EnrichedTraderInfo | null;
  className?: string;
  livePositionsNb: number | null;
}) {
  const settings = useSelector((state) => state.settings);

  const [showAfterFees, setShowAfterFees] = useState(settings.showFeesInPnl);

  const totalProfitLoss = useMemo(() => {
    return (
      (traderInfo?.totalPnl ?? 0) +
      (showAfterFees ? 0 : (traderInfo?.totalFees ?? 0))
    );
  }, [showAfterFees, traderInfo?.totalFees, traderInfo?.totalPnl]);

  return (
    <div
      className={twMerge(
        'flex-wrap flex-row w-full flex gap-6 pl-4 pr-4',
        className,
      )}
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <NumberDisplay
          title={
            <div className="flex">
              <div className="flex flex-col font-boldy opacity-50">
                Realized PnL
              </div>
              <div className="flex gap-1 items-center justify-start absolute top-2 right-2">
                <Switch
                  checked={showAfterFees}
                  onChange={() => setShowAfterFees(!showAfterFees)}
                  size="small"
                />
                <div className="ml-0.5 text-xs lowercase w-9 text-gray-600 whitespace-nowrap text-center">
                  {showAfterFees ? 'w/ fees' : 'w/o fees'}
                </div>
              </div>
            </div>
          }
          nb={totalProfitLoss}
          format="currency"
          precision={2}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName={twMerge(
            'text-lg',
            totalProfitLoss > 0 ? 'text-green' : '',
            totalProfitLoss < 0 ? 'text-red' : '',
          )}
          isDecimalDimmed={false}
        />

        <NumberDisplay
          title="Total Fees"
          nb={traderInfo?.totalFees ?? 0}
          format="currency"
          precision={0}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName="text-lg"
        />

        <NumberDisplay
          title="Win Rate"
          nb={traderInfo?.winRatePercentage ?? 0}
          format="percentage"
          precision={2}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName="text-lg"
          isDecimalDimmed={false}
        />

        <NumberDisplay
          title="Total Volume"
          nb={traderInfo?.totalVolume ?? 0}
          format="currency"
          precision={0}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName="text-lg"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
        <NumberDisplay
          title="Most profitable Trade"
          nb={
            traderInfo?.largestWinningTrade
              ? traderInfo.largestWinningTrade > 0
                ? traderInfo.largestWinningTrade
                : null
              : null
          }
          format="currency"
          precision={2}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName="text-green text-lg"
        />

        <NumberDisplay
          title="Most Unfortunate Trade"
          nb={
            traderInfo?.largestLosingTrade
              ? traderInfo.largestLosingTrade < 0
                ? traderInfo.largestLosingTrade
                : null
              : null
          }
          format="currency"
          precision={2}
          className="border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5"
          headerClassName="pb-2"
          titleClassName="capitalize text-[0.7em] sm:text-[0.7em]"
          bodyClassName="text-red text-lg"
        />

        <div className="flex-col w-full rounded-lg z-20 relative flex items-center flex-1 min-h-[2em] border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5">
          <div className="flex flex-col text-center justify-center pb-2 opacity-50 capitalize text-[0.7em] sm:text-[0.7em] font-boldy">
            Positions
          </div>
          <div className="flex gap-1 items-center justify-center w-full">
            <FormatNumber
              nb={traderInfo?.totalNumberPositions ?? 0}
              precision={0}
              className="text-lg"
            />
            <div className="opacity-50">/</div>
            <div className="flex items-center gap-2">
              <FormatNumber
                nb={livePositionsNb}
                precision={0}
                className="text-lg"
                suffixClassName="text-sm font-boldy opacity-50"
              />
              <LiveIcon />
            </div>
          </div>
        </div>

        <div className="flex-col w-full rounded-lg p-3 z-20 relative flex items-center flex-1 min-h-[2em] border border-bcolor bg-third pl-4 pr-4 pt-5 pb-5">
          <div className="flex flex-col text-center justify-center pb-2">
            <div className="flex flex-col">
              <h1 className="opacity-50 font-boldy capitalize text-[0.7em] sm:text-[0.7em]">
                Avg. Time Opened
              </h1>
              <h5 className="opacity-50 text-xs"></h5>
            </div>
          </div>
          <div className="flex flex-col gap-0">
            <p className="font-mono inline-block text-lg">
              {formatSecondsToTimeDifference(traderInfo?.avgHoldingTime ?? 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
