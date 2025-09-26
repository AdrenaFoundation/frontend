import React from 'react';

import Button from '@/components/common/Button/Button';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended } from '@/types';
import {
  calculateCappedFeeForExitEarly,
  estimateLockedStakeEarlyExitFee,
  formatNumber,
} from '@/utils';

import { nativeToUi } from '../../../utils';

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
  const feePercentage = calculateCappedFeeForExitEarly(lockedStake) * 100;

  const estimatedFee = estimateLockedStakeEarlyExitFee(
    lockedStake,
    stakeTokenMintDecimals,
  );

  const numberOfStakedTokens = nativeToUi(
    lockedStake.amount,
    stakeTokenMintDecimals,
  );

  const precision = lockedStake.tokenSymbol === 'ALP' ?
    window.adrena.client.alpToken.displayAmountDecimalsPrecision :
    window.adrena.client.adxToken.displayAmountDecimalsPrecision;


  return (
    <div className="flex flex-col rounded-md sm:min-w-[400px] h-fit p-5">
      <StyledSubSubContainer className="flex flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Staked amount</div>

          <span>
            <FormatNumber
              nb={numberOfStakedTokens}
              precision={precision}
              placeholder="0"
              className="inline"
            />
            <span className="ml-1">{lockedStake.tokenSymbol}</span>
          </span>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="text-redbright text-sm">Fee</div>

          <span className="text-redbright text-sm">
            -
            <FormatNumber
              nb={estimatedFee}
              precision={precision}
              placeholder="0"
              className="inline text-redbright"
              isDecimalDimmed={false}
            />
            <span className="ml-1 text-redbright">({feePercentage}%)</span>
            <span className="ml-1 text-redbright">
              {lockedStake.tokenSymbol}
            </span>
          </span>
        </div>

        <div className="border-b border-[#ffffff10] mt-2 mb-2"></div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Amount out</div>

          <span>
            <FormatNumber
              nb={numberOfStakedTokens - estimatedFee}
              precision={precision}
              placeholder="0"
              className="inline"
            />
            <span className="ml-1">{lockedStake.tokenSymbol}</span>
          </span>
        </div>
      </StyledSubSubContainer>

      <div className="flex flex-row justify-between mt-6">
        <h2>How early exit works</h2>
      </div>

      <div className="flex flex-row justify-between mt-2">
        <span className="text-txtfade text-sm">
          The early exit feature allows the user to break the initial Locked
          Staking agreement by paying a penalty based on the time elapsed and
          the initial commitment duration.
        </span>
      </div>

      <div className="flex flex-row justify-between mt-4">
        <h2>Early exit fee</h2>
      </div>

      <div className="flex flex-row mt-2">
        <span className="text-txtfade text-sm">
          In order to early exit this staking position, the penalty will be
          <span className="text-white ml-1 mr-1">
            {formatNumber(estimatedFee, precision)} {lockedStake.tokenSymbol} (
            {formatNumber(feePercentage, 4)}% fee)
          </span>
          that you&apos;ll forfeit to the pool (other users).
        </span>
      </div>

      <Button
        variant="danger"
        className="w-full mt-8"
        size="lg"
        title="I agree to exit early and pay the fee"
        onClick={() => {
          return handleLockedStakeRedeem(lockedStake, true);
        }}
      />
    </div>
  );
}
