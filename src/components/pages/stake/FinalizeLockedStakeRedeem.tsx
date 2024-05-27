import React from 'react';

import Button from '@/components/common/Button/Button';
import { LockedStakeExtended } from '@/types';
import { estimateLockedStakeEarlyExitFee } from '@/utils';

export default function FinalizeLockedStakeRedeem({
  lockedStake,
  stakeTokenMintDecimals,
  handleLockedStakeRedeem,
}: {
  lockedStake: LockedStakeExtended;
  stakeTokenMintDecimals: number;
  handleLockedStakeRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
}) {
  return (
    <div className="p-5 w-[30em]">
      <div>
        <div className="flex flex-row justify-between mb-4">
          <span className="font-mono text-md opacity-50">
            The early exit feature allow the user to break the initial Locked
            Staking agreement by paying a penalty based on the time elapsed and
            the initial commitment duration.
          </span>
        </div>
        <div className="flex flex-row mb-6">
          <span className="text-red font-mono text-md">
            In order to early exit this staking position, the penalty will be{' '}
            <span className="text-red font-bold text-2xl">
              {estimateLockedStakeEarlyExitFee(
                lockedStake,
                stakeTokenMintDecimals,
              )}
            </span>{' '}
            {lockedStake.tokenSymbol} that you&apos;ll forfeit to the pool
            (other users).
          </span>
        </div>
      </div>

      <Button
        variant="danger"
        className="w-full mt-3"
        size="lg"
        title="I agree to exit early and pay the fee"
        onClick={() => {
          handleLockedStakeRedeem(lockedStake, true);
        }}
      />
    </div>
  );
}
