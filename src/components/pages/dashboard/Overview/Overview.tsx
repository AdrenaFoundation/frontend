import { formatNumber, formatPriceInfo } from '@/utils';

export default function Overview({
  className,
  aumUsd,
  longPositions,
  shortPositions,
  nbOpenLongPositions,
  nbOpenShortPositions,
  averageLongLeverage,
  averageShortLeverage,
}: {
  className?: string;
  aumUsd: number | null;
  longPositions: number | null;
  shortPositions: number | null;
  nbOpenLongPositions: number | null;
  nbOpenShortPositions: number | null;
  averageLongLeverage: number | null;
  averageShortLeverage: number | null;
}) {
  const rowClasses = 'flex w-full justify-between mt-2';

  return (
    <div
      className={`border border-grey bg-secondary flex flex-col max-w-full ${
        className ?? ''
      }`}
    >
      <div className="p-4 border-b border-grey">Overview</div>
      <div className="pb-4 pl-4 pr-4 pt-2 text-md flex flex-col w-full">
        <div className={rowClasses}>
          <div className="text-txtfade">AUM</div>
          <div>{formatPriceInfo(aumUsd)}</div>
        </div>

        <div className={rowClasses}>
          <div className="text-txtfade">Long Positions</div>
          <div>{formatPriceInfo(longPositions)}</div>
        </div>

        <div className={rowClasses}>
          <div className="text-txtfade">Short Positions</div>
          <div>{formatPriceInfo(shortPositions)}</div>
        </div>

        <div className={rowClasses}>
          <div className="text-txtfade">Active Long Positions</div>
          <div>{nbOpenLongPositions !== null ? nbOpenLongPositions : '-'}</div>
        </div>

        <div className={rowClasses}>
          <div className="text-txtfade">Active Short Positions</div>
          <div>
            {nbOpenShortPositions !== null ? nbOpenShortPositions : '-'}
          </div>
        </div>

        <div className={rowClasses}>
          <div className="text-txtfade">Average Long Leverage</div>
          <div>
            {averageLongLeverage
              ? `${formatNumber(averageLongLeverage, 2)}x`
              : '-'}
          </div>
        </div>

        <div className={rowClasses}>
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
