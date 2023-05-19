import { twMerge } from 'tailwind-merge';

import { formatPriceInfo } from '@/utils';

export default function Stats({
  className,
  totalCollectedFees,
  totalVolume,
}: {
  className?: string;
  totalCollectedFees: number | null;
  totalVolume: number | null;
}) {
  const rowClasses = 'flex w-full justify-between mt-2';

  return (
    <div
      className={twMerge(
        'border',
        'border-grey',
        'bg-secondary',
        'flex',
        'flex-col',
        'w-[30em]',
        'max-w-full',
        className,
      )}
    >
      <div className="p-4 border-b border-grey">Total Stats</div>
      <div className="pr-4 pt-2 pb-4 pl-4 text-sm flex flex-col w-full">
        <div className={rowClasses}>
          <div className="text-txtfade">Total Fees</div>
          <div>{formatPriceInfo(totalCollectedFees)}</div>
        </div>
        <div className={rowClasses}>
          <div className="text-txtfade">Total Volume</div>
          <div>{formatPriceInfo(totalVolume)}</div>
        </div>
      </div>
    </div>
  );
}
