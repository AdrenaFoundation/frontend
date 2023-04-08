import { formatNumber, formatPriceInfo } from '@/utils';

export default function Overview({
  className,
  uiAumUsd,
  uiLongPositions,
  uiShortPositions,
  nbOpenLongPositions,
  nbOpenShortPositions,
  averageLongLeverage,
  averageShortLeverage,
}: {
  className?: string;
  uiAumUsd: number | null;
  uiLongPositions: number | null;
  uiShortPositions: number | null;
  nbOpenLongPositions: number | null;
  nbOpenShortPositions: number | null;
  averageLongLeverage: number | null;
  averageShortLeverage: number | null;
}) {
  return (
    <div
      className={`border border-grey bg-secondary flex flex-col w-[30em] max-w-full ${
        className ?? ''
      }`}
    >
      <div className="p-4 border-b border-grey">Overview</div>
      <div className="p-4 text-sm flex flex-col w-full">
        <div className="flex w-full justify-between">
          <div className="text-txtfade">AUM</div>
          <div>{formatPriceInfo(uiAumUsd)}</div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Long Positions</div>
          <div>{formatPriceInfo(uiLongPositions)}</div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Short Positions</div>
          <div>{formatPriceInfo(uiShortPositions)}</div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Active Long Positions</div>
          <div>{nbOpenLongPositions !== null ? nbOpenLongPositions : '-'}</div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Active Short Positions</div>
          <div>
            {nbOpenShortPositions !== null ? nbOpenShortPositions : '-'}
          </div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Average Long Leverage</div>
          <div>
            {averageLongLeverage
              ? `${formatNumber(averageLongLeverage, 2)}x`
              : '-'}
          </div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Average Short Leverage</div>
          <div>
            {averageShortLeverage
              ? `${formatNumber(averageShortLeverage, 2)}x`
              : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
