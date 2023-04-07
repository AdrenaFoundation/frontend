import { formatPriceInfo } from '@/utils';

export default function Overview({
  className,
  uiAumUsd,
  uiLongPositions,
  uiShortPositions,
}: {
  className?: string;
  uiAumUsd: number | null;
  uiLongPositions: number | null;
  uiShortPositions: number | null;
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
          <div>{uiAumUsd != null ? formatPriceInfo(uiAumUsd) : '-'}</div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Long Positions</div>
          <div>
            {uiLongPositions !== null ? formatPriceInfo(uiLongPositions) : '-'}
          </div>
        </div>

        <div className="flex w-full justify-between">
          <div className="text-txtfade">Short Positions</div>
          <div>
            {uiShortPositions !== null
              ? formatPriceInfo(uiShortPositions)
              : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
