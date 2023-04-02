import { BN } from '@project-serum/anchor';

import { formatPriceInfo, nativeToUi } from '@/utils';

export default function Overview({
  className,
  aum,
}: {
  className?: string;
  aum: BN | null;
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
          <div>{aum ? formatPriceInfo(nativeToUi(aum, 6)) : '-'}</div>
        </div>
      </div>
    </div>
  );
}
