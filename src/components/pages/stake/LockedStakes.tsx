import { twMerge } from 'tailwind-merge';

import { LockedStakeExtended } from '@/types';

import LockedStakesDuration from './LockedStakesDuration';

export default function LockedStakes({
  lockedStakes,
  className,
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
}: {
  lockedStakes: LockedStakeExtended[];
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
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
          className=""
          handleRedeem={handleRedeem}
          handleClickOnFinalizeLockedRedeem={handleClickOnFinalizeLockedRedeem}
          handleClickOnUpdateLockedStake={handleClickOnUpdateLockedStake}
        />
      ))}
    </div>
  );
}
