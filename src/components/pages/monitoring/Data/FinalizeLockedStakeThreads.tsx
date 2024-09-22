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
    <StyledContainer
      title={
        <>
          FINALIZE LOCKED STAKE THREADS
          <InfoAnnotation
            text="Theses are crons which are responsible for wrapping up user locked staked. Example an user stake ADX for 6 months, at the end of the staking period, this cron triggers and wrap things up."
            className="mr-1 w-4 h-4"
          />
        </>
      }
      className="w-[37em] grow relative"
      titleClassName={twMerge('flex', titleClassName)}
    >
      <div
        className={twMerge(
          'flex w-full items-center justify-center',
          !loadFinalizeLockedStakedThreads && 'pt-8 pb-8',
        )}
      >
        {!loadFinalizeLockedStakedThreads ? (
          <>
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
          </>
        ) : (
          <FinalizeLockedStakedThreadsInner />
        )}
      </div>
    </StyledContainer>
  );
}
