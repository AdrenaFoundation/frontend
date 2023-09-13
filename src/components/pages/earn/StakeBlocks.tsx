import BN from 'bn.js';
import Image from 'next/image';
import { useState } from 'react';

import Button from '@/components/common/Button/Button';
import Menu from '@/components/common/Menu/Menu';
import MenuItem from '@/components/common/Menu/MenuItem';
import MenuItems from '@/components/common/Menu/MenuItems';
import MenuSeperator from '@/components/common/Menu/MenuSeperator';
import { UserStaking } from '@/types';
import { formatNumber, formatPriceInfo, nativeToUi } from '@/utils';

export default function StakeBlocks({
  stakePositions,
  handleRemoveLockedStake,
}: {
  stakePositions: UserStaking | null;
  handleRemoveLockedStake: (lockedStakeIndex: BN) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {stakePositions?.lockedStakes?.map(
        (
          {
            amount,
            stakeTime,
            claimTime,
            lockDuration,
            lmRewardMultiplier,
            voteMultiplier,
            amountWithLmRewardMultiplier,
            amountWithRewardMultiplier,
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
                  {formatNumber(lmRewardMultiplier, 2)}
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">Vote Multiplier</p>
                <p className="font-mono text-sm">
                  {formatNumber(voteMultiplier, 2)}
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">
                  Amount With LM Reward Multiplier
                </p>
                <p className="font-mono text-sm">
                  {formatNumber(
                    nativeToUi(
                      amountWithLmRewardMultiplier,
                      window.adrena.client.adxToken.decimals,
                    ),
                    2,
                  )}{' '}
                  ADX
                </p>
              </li>

              <li className="flex flex-row gap-3 justify-between">
                <p className="text-sm opacity-50">
                  Amount With Reward Multiplier
                </p>
                <p className="font-mono text-sm">
                  {formatNumber(
                    nativeToUi(
                      amountWithRewardMultiplier,
                      window.adrena.client.adxToken.decimals,
                    ),
                    2,
                  )}{' '}
                  ADX
                </p>
              </li>

              <li>
                <Button
                  className="w-full mt-3"
                  variant="secondary"
                  rightIcon={resolved ? undefined : '/images/Icons/lock.svg'}
                  disabled={resolved}
                  title={
                    resolved
                      ? 'Redeem'
                      : `${Number(lockDuration) / 3600 / 24} days remaining`
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
