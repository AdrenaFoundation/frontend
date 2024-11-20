import { twMerge } from 'tailwind-merge';

import { AdxLockPeriod, AlpLockPeriod, LockedStakeExtended } from '@/types';

import LockedStakesDuration from './LockedStakesDuration';

export default function LockedStakes({
  lockedStakes,
  className,
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
  handleClickOnStakeMore,
}: {
  lockedStakes: LockedStakeExtended[];
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
  handleClickOnStakeMore: (initialLockPeriod: AlpLockPeriod | AdxLockPeriod) => void;
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
          lockedStakes={lockedStakes}
          key={i}
          handleRedeem={handleRedeem}
          handleClickOnFinalizeLockedRedeem={handleClickOnFinalizeLockedRedeem}
          handleClickOnUpdateLockedStake={handleClickOnUpdateLockedStake}
          handleClickOnStakeMore={handleClickOnStakeMore}
        />
      ))}
    </div>
  );
}
