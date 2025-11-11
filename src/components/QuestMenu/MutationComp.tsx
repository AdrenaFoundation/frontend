import React from 'react';
import { twMerge } from 'tailwind-merge';

import { EnrichedSeasonMutation } from '@/types';
import { formatNumber } from '@/utils';

export default function MutationComp({
  mutation,
  className,
}: {
  mutation: EnrichedSeasonMutation;
  className?: string;
}) {
  return (
    <div className={twMerge('flex gap-1', className)}>
      <div className="flex items-center justify-between w-full gap-1">
        <div className="flex flex-col gap-1">
          {mutation.name && (
            <div className="flex gap-1">
              <div className="text-[0.8em] font-semibold">{mutation.name}</div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="font-semibold text-xs text-[#e47dbb]">
                  {mutation.calculationType === 'per_increment' ? (
                    <>
                      +{formatNumber(mutation.points, 3)} -{' '}
                      {formatNumber(mutation.maxPoints, 3)} mutagen
                    </>
                  ) : (
                    <>+{formatNumber(mutation.maxPoints, 3)} mutagen</>
                  )}
                </span>
              </div>
            </div>
          )}

          {mutation.description && (
            <p className="text-white/50 text-xs">{mutation.description}</p>
          )}
        </div>

        <div className="text-xs">Daily Bonus</div>
      </div>
    </div>
  );
}
