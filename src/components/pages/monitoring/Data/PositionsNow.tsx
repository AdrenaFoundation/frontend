import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { PoolExtended } from '@/types';
import { formatNumber, formatPriceInfo } from '@/utils';

import liveIcon from '../../../../../public/images/Icons/live-icon.svg';

export default function PositionsNow({
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
      <div className="flex flex-row gap-2 w-full border-b p-5">
        <p className={titleClassName}>Positions live</p>
        <Image
          src={liveIcon}
          alt="Live icon"
          width={12}
          height={12}
          className='animate-pulse'
        />
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="p-5">
          <p className={titleClassName}>Long positions</p>
          <p className={bodyClassName}>
            {formatNumber(mainPool.nbOpenLongPositions, 0)}
          </p>
        </div>
        <div className="border-t sm:border-t-0 sm:border-l p-5">
          <p className={titleClassName}>Short positions</p>
          <p className={bodyClassName}>
            {formatNumber(mainPool.nbOpenShortPositions, 0)}
          </p>
        </div>
        <div className="border-t p-5">
          <p className={titleClassName}>Open Interest Long</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.longPositions, 0)}
          </p>
        </div>
        <div className="border-t sm:border-l p-5">
          <p className={titleClassName}>Open Interest Short</p>
          <p className={bodyClassName}>
            {formatPriceInfo(mainPool.shortPositions, 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
