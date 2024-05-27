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
    <div className="p-5">
      <div>
        <div className="flex flex-row justify-between mb-4">
          <p className="text-red font-mono text-md">
            {' '}
            Estimated Fee for Early Exiting Stake :{' '}
            <span className="text-red font-bold text-2xl">
              {estimateLockedStakeEarlyExitFee(
                lockedStake,
                stakeTokenMintDecimals,
              )}
            </span>{' '}
            {lockedStake.tokenSymbol}
          </p>
        </div>
        <div className="flex mb-6">
          <p className="text-red font-mono text-md">
            Are you sure you wish to proceed ?
          </p>
        </div>
      </div>

      <Button
        variant="danger"
        className="w-full mt-3"
        size="lg"
        title="Early Exit"
        onClick={() => {
          handleLockedStakeRedeem(lockedStake, true);
        }}
      />
    </div>
  );
}
