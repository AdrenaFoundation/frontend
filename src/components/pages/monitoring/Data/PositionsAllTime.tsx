import { twMerge } from 'tailwind-merge';

import { PoolExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function PositionsAllTime({
  mainPool,
  titleClassName,
  bodyClassName,
}: {
  mainPool: PoolExtended;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>Positions All time</p>
      </div>

      <div className="grid grid-cols-2">
        <div className="p-5">
          <p className={titleClassName}>Trading Volume</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.totalTradingVolume, 0, 0, 0)}
          </p>
        </div>
        <div className="border-l p-5">
          <p className={titleClassName}>Liquidation Volume</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.totalLiquidationVolume, 0, 0, 0)}
          </p>
        </div>
        <div className="border-t p-5">
          <p className={titleClassName}>Profits</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.profitsUsd, 0, 0, 0)}
          </p>
        </div>
        <div className="border-t border-l p-5">
          <p className={titleClassName}>Losses</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.lossUsd * -1, 0, 0, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
