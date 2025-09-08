import React from 'react';

import Button from '@/components/common/Button/Button';
import { AdxLockPeriod, AlpLockPeriod, LockedStakeExtended } from '@/types';

import LockedStakes from './LockedStakes';

interface SortConfig {
  size: 'asc' | 'desc';
  duration: 'asc' | 'desc';
  lastClicked: 'size' | 'duration';
}

interface LockedStakesSectionProps {
  lockedStakes: LockedStakeExtended[] | null;
  sortConfig: SortConfig;
  onSort: (key: 'size' | 'duration') => void;
  onAddStake: (lockPeriod: AdxLockPeriod | AlpLockPeriod) => void;
  onRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  onFinalize: (lockedStake: LockedStakeExtended) => void;
  onUpdate: (lockedStake: LockedStakeExtended) => void;
  defaultLockPeriod: AdxLockPeriod | AlpLockPeriod;
}

export default function LockedStakesSection({
  lockedStakes,
  sortConfig,
  onSort,
  onAddStake,
  onRedeem,
  onFinalize,
  onUpdate,
  defaultLockPeriod,
}: LockedStakesSectionProps) {
  // Sort locked stakes
  const sortedLockedStakes = lockedStakes
    ? lockedStakes.sort((a: LockedStakeExtended, b: LockedStakeExtended) => {
        const sizeModifier = sortConfig.size === 'asc' ? 1 : -1;
        const durationModifier = sortConfig.duration === 'asc' ? 1 : -1;

        const sizeDiff = (Number(a.amount) - Number(b.amount)) * sizeModifier;
        const durationDiff =
          (Number(a.endTime) * 1000 - Number(b.endTime) * 1000) *
          durationModifier;

        if (sortConfig.lastClicked === 'size') {
          return sizeDiff !== 0 ? sizeDiff : durationDiff;
        }

        if (sortConfig.lastClicked === 'duration') {
          return durationDiff !== 0 ? durationDiff : sizeDiff;
        }

        // Fallback sorting
        return durationDiff || sizeDiff;
      })
    : [];

  return (
    <div className="px-5">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold mr-2">My Locked Stakes</h3>
          <h3 className="text-lg font-semibold text-txtfade">
            {lockedStakes?.length ? ` (${lockedStakes.length})` : ''}
          </h3>
        </div>

        <div className="flex items-center gap-2 mt-4 sm:mt-0 flex-col sm:flex-row w-full sm:w-auto">
          <div className="flex items-center text-xs bg-secondary rounded-full p-[2px] border border-bcolor">
            <button
              className="px-2 py-1 rounded-full transition-colors flex items-center"
              onClick={() => onSort('size')}
            >
              Amount
              <span className="ml-1 text-txtfade text-[10px]">
                {sortConfig.size === 'asc' ? '↑' : '↓'}
              </span>
            </button>
            <div className="w-px h-4 bg-bcolor mx-[1px]"></div>
            <button
              className="px-2 py-1 rounded-full transition-colors flex items-center"
              onClick={() => onSort('duration')}
            >
              Unlock Date
              <span className="ml-1 text-txtfade text-[10px]">
                {sortConfig.duration === 'asc' ? '↑' : '↓'}
              </span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            className="w-[8em]"
            title="Add Stake"
            onClick={() => onAddStake(defaultLockPeriod)}
          />
        </div>
      </div>

      <LockedStakes
        lockedStakes={sortedLockedStakes}
        className="gap-3 mt-4"
        handleRedeem={onRedeem}
        handleClickOnFinalizeLockedRedeem={onFinalize}
        handleClickOnUpdateLockedStake={onUpdate}
      />
    </div>
  );
}
