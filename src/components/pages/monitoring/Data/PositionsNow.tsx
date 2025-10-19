import Image from 'next/image';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { PoolExtended } from '@/types';

import liveIcon from '../../../../../public/images/Icons/live-icon.svg';

export default function PositionsNow({
  mainPool,
  titleClassName,
}: {
  mainPool: PoolExtended;
  titleClassName?: string;
}) {
  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="flex flex-row gap-2 w-full border-b p-3">
        <p className={titleClassName}>Positions Live</p>

        <Image
          src={liveIcon}
          alt="Live icon"
          width={12}
          height={12}
          className='animate-pulse w-3 h-3'
        />
      </div>

      <div className="grid sm:grid-cols-2">
        <NumberDisplay
          title="Long positions"
          nb={mainPool.nbOpenLongPositions}
          precision={0}
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b sm:border-r'
        />

        <NumberDisplay
          title="Short positions"
          nb={mainPool.nbOpenShortPositions}
          precision={0}
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b'
        />

        <NumberDisplay
          title="Open Interest Long"
          nb={mainPool.longPositions}
          precision={0}
          format='currency'
          className='rounded-none border-t-0 border-l-0 border-r-0 border-b-0 sm:border-r'
        />

        <NumberDisplay
          title="Open Interest Short"
          nb={mainPool.shortPositions}
          precision={0}
          format='currency'
          className='rounded-none border-t border-l-0 border-r-0 border-b-0 sm:border-t-0'
        />
      </div>
    </div>
  );
}
