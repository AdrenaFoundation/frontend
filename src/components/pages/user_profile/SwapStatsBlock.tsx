import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import NumberInfo from '../monitoring/NumberInfo';

export default function SwapStatsBloc({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  return (
    <div className={twMerge('flex flex-col', className)}>
      <div className="flex w-full justify-center items-center">
        <div className="flex h-[1px] grow bg-bcolor"></div>
        <div className="font-special text-2xl pl-6 pr-6">Swap Stats</div>
        <div className="flex h-[1px] grow bg-bcolor"></div>
      </div>

      <div className="flex w-full grow justify-around items-center flex-wrap max-w-[30em] self-center">
        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-special">Count</div>
          <NumberInfo
            className="text-4xl font-special"
            value={userProfile.swapCount}
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-special">Volume</div>
          <NumberInfo
            className="text-4xl font-special"
            value={userProfile.swapVolumeUsd}
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-special text-center">
            Fee paid
          </div>
          <NumberInfo
            className="text-4xl font-special"
            value={userProfile.swapFeePaidUsd}
          />
        </div>
      </div>
    </div>
  );
}
