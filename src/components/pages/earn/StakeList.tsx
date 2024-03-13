import { BN } from '@coral-xyz/anchor';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { STAKE_MULTIPLIERS } from '@/constant';
import { LockPeriod, StakePositionsExtended } from '@/types';
import { formatNumber, getDaysRemaining, nativeToUi } from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';

export default function StakeList({
  positions,
  handleRemoveLockedStake,
}: {
  positions: StakePositionsExtended[];
  handleRemoveLockedStake: (
    tokenSymbol: 'ADX' | 'ALP',
    resolved: boolean,
    threadId: BN,
    lockedStakeIndex: number,
  ) => void;
}) {
  const today = new Date();

  if (positions.length === 0) {
    return <p className="text-center opacity-25">No locked stake</p>;
  }

  return (
    <table className="w-full">
      <thead>
        <tr>
          {[
            'Token',
            'Amount',
            'Stake Time',
            'Claim Time',
            'Lock Duration',
            'LM Reward Multiplier',
            'Reward Multiplier',
            'Vote Multiplier',
            'Actions',
          ].map((header) => (
            <th className="text-sm text-left opacity-50" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {positions &&
          positions.map(
            (
              {
                lockedStakeIndex,
                resolved,
                amount,
                stakeTime,
                claimTime,
                lockDuration,
                stakeResolutionThreadId,
                tokenSymbol,
              },
              i,
            ) => (
              <tr
                key={String(stakeResolutionThreadId)}
                className={twMerge(
                  i !== positions.length - 1 && 'border-b border-b-gray-200',
                )}
              >
                <td className="py-5 text-sm font-mono">
                  <div className="flex flex-row gap-2 items-center">
                    <div
                      className={`p-1 bg-${
                        tokenSymbol === 'ADX' ? 'red' : 'blue'
                      }-500 rounded-full`}
                    >
                      <p className="flex items-center justify-center text-sm font-specialmonster h-7 w-7">
                        {tokenSymbol === 'ADX' ? 'ADX' : 'ALP'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium opacity-50">
                        {tokenSymbol}
                      </p>
                      <p>
                        {tokenSymbol === 'ADX'
                          ? window.adrena.client.adxToken.name
                          : window.adrena.client.alpToken.name}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-5 text-sm font-mono">
                  {formatNumber(
                    nativeToUi(amount, window.adrena.client.adxToken.decimals),
                    2,
                  )}{' '}
                  ADX
                </td>

                <td className="py-5 text-sm font-mono">
                  {new Date(Number(stakeTime) * 1000).toLocaleString('en', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>

                <td className="py-5 text-sm font-mono">
                  {Number(claimTime) !== 0
                    ? new Date(Number(claimTime) * 1000).toLocaleString('en', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '–'}
                </td>

                <td className="py-5 text-sm font-mono">
                  {Number(lockDuration) / 3600 / 24}
                  <span className="opacity-50"> days</span>
                </td>

                <td className="py-5 text-sm font-mono">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].adx}
                  x
                </td>

                <td className="py-5 text-sm font-mono">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].usdc}
                  x
                </td>

                <td className="py-5 text-sm font-mono">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].votes}
                  x
                </td>

                <td className="py-5 text-sm">
                  <Button
                    className="w-full max-w-[200px] mt-3 text-sm"
                    variant="secondary"
                    rightIcon={
                      getDaysRemaining(stakeTime, lockDuration) <= 0
                        ? undefined
                        : lockIcon
                    }
                    disabled={!(getDaysRemaining(stakeTime, lockDuration) <= 0)}
                    title={
                      getDaysRemaining(stakeTime, lockDuration) <= 0
                        ? 'Redeem'
                        : `${getDaysRemaining(
                            stakeTime,
                            lockDuration,
                          )} days remaining (${new Date(
                            today.setDate(
                              today.getDay() +
                                getDaysRemaining(stakeTime, lockDuration),
                            ),
                          ).toLocaleString('en', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })})`
                    }
                    onClick={() => {
                      if (getDaysRemaining(stakeTime, lockDuration) <= 0) {
                        console.log('redeem', stakeResolutionThreadId);
                        handleRemoveLockedStake(
                          tokenSymbol,
                          resolved,
                          stakeResolutionThreadId,
                          lockedStakeIndex,
                        );
                      }
                    }}
                  />
                </td>
              </tr>
            ),
          )}
      </tbody>
    </table>
  );
}
