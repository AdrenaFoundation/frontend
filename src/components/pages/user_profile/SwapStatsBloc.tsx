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
        <div className="flex h-[1px] grow bg-gray-300"></div>
        <div className="font-specialmonster text-2xl pl-6 pr-6">Swap Stats</div>
        <div className="flex h-[1px] grow bg-gray-300"></div>
      </div>

      <div className="flex w-full grow justify-around items-center flex-wrap max-w-[30em] self-center">
        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-specialmonster">Count</div>
          <NumberInfo
            className="text-4xl font-specialmonster"
            value={userProfile.swapCount}
            precision={1}
            denomination=""
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-specialmonster">
            Volume
          </div>
          <NumberInfo
            className="text-4xl font-specialmonster"
            value={userProfile.swapVolumeUsd}
          />
        </div>

        <div className="flex flex-col items-center m-4 p-4">
          <div className="text-2xl text-txtfade font-specialmonster text-center">
            Fee paid
          </div>
          <NumberInfo
            className="text-4xl font-specialmonster"
            value={userProfile.swapFeePaidUsd}
          />
        </div>
      </div>
    </div>
  );
}
