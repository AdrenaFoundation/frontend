import { twMerge } from 'tailwind-merge';

import { LockedStakeExtended } from '@/types';

import LockedStakesDuration from './LockedStakesDuration';

export default function LockedStakes({
  lockedStakes,
  className,
  handleRedeem,
  handleClickOnUpdateLockedStake,
  readonly = false,
}: {
  lockedStakes: LockedStakeExtended[];
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
  readonly?: boolean;
}) {
  const lockedStakesPerDuration = lockedStakes.reduce((acc, lockedStake) => {
    if (!acc[lockedStake.lockDuration.toString()])
      acc[lockedStake.lockDuration.toString()] = [];

    acc[lockedStake.lockDuration.toString()].push(lockedStake);

    return acc;
  }, {} as Record<string, LockedStakeExtended[]>);

  return (
    <div
      className={twMerge(
        'flex flex-col w-full',
        className,
      )}
    >
      {Object.values(lockedStakesPerDuration).map((lockedStakes, i) => (
        <LockedStakesDuration
          readonly={readonly}
          lockedStakes={lockedStakes}
          key={i}
          handleRedeem={handleRedeem}
          handleClickOnUpdateLockedStake={handleClickOnUpdateLockedStake}
        />
      ))}
    </div>
  );
}
