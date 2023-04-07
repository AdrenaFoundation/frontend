import { formatPriceInfo } from '@/utils';

export default function Stats({
  className,
  totalCollectedFees,
}: {
  className?: string;
  totalCollectedFees: number | null;
}) {
  return (
    <div
      className={`border border-grey bg-secondary flex flex-col w-[30em] max-w-full ${
        className ?? ''
      }`}
    >
      <div className="p-4 border-b border-grey">Total Stats</div>
      <div className="p-4 text-sm flex flex-col w-full">
        <div className="flex w-full justify-between">
          <div className="text-txtfade">Total Fees</div>
          <div>
            {totalCollectedFees ? formatPriceInfo(totalCollectedFees) : '-'}
          </div>
        </div>
      </div>
    </div>
  );
}
