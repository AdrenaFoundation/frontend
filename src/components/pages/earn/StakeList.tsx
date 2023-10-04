import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import { STAKE_MULTIPLIERS } from '@/constant';
import { LockPeriod, UserStaking } from '@/types';
import { formatNumber, getDaysRemaining, nativeToUi } from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';

export default function StakeList({
  stakePositions,
}: {
  stakePositions: { ADX: UserStaking | null; ALP: UserStaking | null } | null;
}) {
  const positions =
    stakePositions?.ADX?.lockedStakes?.concat(
      stakePositions?.ALP?.lockedStakes || [],
    ) || [];

  const today = new Date();
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
            <th className="text-xs text-left opacity-50" key={header}>
              {header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {positions.map(
          (
            {
              amount,
              stakeTime,
              claimTime,
              lockDuration,
              resolved,
              stakeResolutionThreadId,
            },
            i,
          ) => (
            <tr
              key={String(stakeResolutionThreadId)}
              className={twMerge(
                i !== positions.length - 1 && 'border-b border-b-gray-300',
              )}
            >
              <td className="py-5 text-sm font-mono">
                <div className="flex flex-row gap-2 items-center">
                  <Image
                    src={window.adrena.client.adxToken.image}
                    width={32}
                    height={32}
                    alt="ADX"
                  />
                  <div>
                    <p className="text-xs font-medium opacity-50">ADX</p>
                    <p>Adrena LM Token</p>
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
                  className="w-full max-w-[200px] mt-3 text-xs"
                  variant="secondary"
                  rightIcon={resolved ? undefined : lockIcon}
                  disabled={!resolved}
                  title={
                    resolved
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
                />
              </td>
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}
