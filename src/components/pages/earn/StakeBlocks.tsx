import Image from 'next/image';

import Button from '@/components/common/Button/Button';
import { STAKE_MULTIPLIERS } from '@/constant';
import { LockPeriod, UserStaking } from '@/types';
import { formatNumber, getDaysRemaining, nativeToUi } from '@/utils';

export default function StakeBlocks({
  stakePositions,
}: {
  stakePositions: { ADX: UserStaking | null; ALP: UserStaking | null } | null;
}) {
  const today = new Date();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {stakePositions?.ADX?.lockedStakes.map(
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
          <div
            key={Number(stakeResolutionThreadId)}
            className="bg-[#242424] p-3 rounded-lg border border-gray-300"
          >
            <div className="pb-2 flex flex-row justify-between border-b border-b-gray-300">
              <div className="flex flex-row gap-2 items-center">
                <Image src="/images/adx.png" width={32} height={32} alt="ADX" />
                <p className="text-sm font-medium">ADX</p>
              </div>
            </div>
            <ul className="flex flex-col gap-2 pt-3">
              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Amount</p>
                <p className="font-mono text-sm">
                  {formatNumber(
                    nativeToUi(amount, window.adrena.client.adxToken.decimals),
                    2,
                  )}{' '}
                  ADX
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Stake Time</p>
                <p className="font-mono text-sm">
                  {new Date(Number(stakeTime) * 1000).toLocaleString('en', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Claim Time</p>
                <p className="font-mono text-sm">
                  {Number(claimTime) !== 0
                    ? new Date(Number(claimTime) * 1000).toLocaleString('en', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Not Claimed'}
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Lock Duration</p>
                <p className="font-mono text-sm">
                  {Number(lockDuration) / 3600 / 24}
                  <span className="opacity-50"> days</span>
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">LM Reward Multiplier</p>
                <p className="font-mono text-sm">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].adx}
                  x
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Reward Multiplier</p>
                <p className="font-mono text-sm">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].usdc}
                  x
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Vote Multiplier</p>
                <p className="font-mono text-sm">
                  {lockDuration &&
                    STAKE_MULTIPLIERS[
                      (Number(lockDuration) / 3600 / 24) as LockPeriod
                    ].votes}
                  x
                </p>
              </li>

              <li>
                <Button
                  className="w-full mt-3"
                  variant="secondary"
                  rightIcon={resolved ? undefined : '/images/Icons/lock.svg'}
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
              </li>
            </ul>
          </div>
        ),
      )}
    </div>
  );
}
