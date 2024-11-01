import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';

import FinalizeLockedStakedThreadsInner from '../FinalizeLockedStakedThreadsInner';
import InfoAnnotation from '../InfoAnnotation';

export default function FinalizeLockedStakedThreads({
  titleClassName,
}: {
  titleClassName?: string;
}) {
  const [loadFinalizeLockedStakedThreads, setLoadFinalizeLockedStakedThreads] =
    useState<boolean>(false);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="flex flex-row items-center gap-2 w-full border-b p-5">
        <p className={titleClassName}>FINALIZE LOCKED STAKE THREADS</p>
        <InfoAnnotation
          text="Theses are crons which are responsible for wrapping up user locked staked. Example an user stake ADX for 6 months, at the end of the staking period, this cron triggers and wrap things up."
          className="mr-1 w-4 h-4"
        />
      </div>

      <div>
        {!loadFinalizeLockedStakedThreads ? (
          <div className='p-5 flex flex-row items-center justify-center gap-3'>
            <Button
              title="Load"
              className="w-80"
              onClick={() => {
                setLoadFinalizeLockedStakedThreads(true);
              }}
            />

            <InfoAnnotation
              text="As there are many crons, it requires a manual action to load them."
              className="mr-1 w-4 h-4"
            />
          </div>
        ) : (
          <FinalizeLockedStakedThreadsInner />
        )}
      </div>
    </div>
  );
}
