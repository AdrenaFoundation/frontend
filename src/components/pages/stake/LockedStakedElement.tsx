import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended, Token } from '@/types';
import {
  formatMilliseconds,
  getLockedStakeRemainingTime,
  nativeToUi,
} from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';

export default function LockedStakedElement({
  token,
  lockedStake,
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
}: {
  token: Token;
  lockedStake: LockedStakeExtended;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  const calculateTimeRemaining = useCallback(() => {
    const timeRemaining = getLockedStakeRemainingTime(
      lockedStake.stakeTime,
      lockedStake.lockDuration,
    );

    setTimeRemaining(timeRemaining);
  }, [lockedStake.lockDuration, lockedStake.stakeTime]);

  useEffect(() => {
    calculateTimeRemaining();

    const interval = setInterval(() => {
      calculateTimeRemaining();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [calculateTimeRemaining]);

  const today = new Date();
  const endDate = timeRemaining
    ? new Date(today.getTime() + timeRemaining)
    : null;

  const isLessThan30Days =
    timeRemaining && timeRemaining < 30 * 3600 * 24 * 1000;

  const remainingDaysDiv = (
    <div className="mt-2">
      <p className="opacity-50">
        Ends{' '}
        {!isLessThan30Days
          ? endDate?.toLocaleString('en', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })
          : `in ${formatMilliseconds(timeRemaining)}`}
      </p>
    </div>
  );

  return (
    <div
      className={twMerge(
        'flex flex-col gap-3 border justify-between items-center bg-secondary rounded-xl shadow-lg flex-1',
        lockedStake.resolved && 'border-green',
      )}
      ref={containerRef}
    >
      <div className="flex flex-col w-full p-3 pb-0">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center opacity-50">
            <Image src={lockIcon} width={10} height={10} alt="Lock icon" />

            <span className="ml-1 font-boldy">
              {Number(lockedStake.lockDuration) / 3600 / 24}
              <span> days</span>
            </span>
          </div>
          {endDate && timeRemaining && remainingDaysDiv}
        </div>
        <FormatNumber
          nb={nativeToUi(lockedStake.amount, token.decimals)}
          className="text-xl inline-block"
          suffix={` ${token.symbol}`}
        />{' '}
      </div>

      <div className="flex-col w-full flex items-center flex-none">
        <ul className="flex flex-row border-y border-bcolor w-full items-center flex-none">
          <li className="flex-1 p-3">
            <p className="font-mono">
              {Math.floor((lockedStake.lmRewardMultiplier / 10_000) * 100)}%
            </p>
            <p className="opacity-50">ADX</p>
          </li>

          <li
            className={twMerge(
              lockedStake.voteMultiplier > 0
                ? 'border-x px-5'
                : 'border-l pl-5',
              'flex-1 p-3 border-bcolor',
            )}
          >
            <p className="font-mono">
              {Math.floor((lockedStake.rewardMultiplier / 10_000) * 100)}%
            </p>
            <p className="opacity-50">USDC yield</p>
          </li>

          {lockedStake.voteMultiplier > 0 && (
            <li className="flex-1 p-3">
              <p className="font-mono">
                {Math.floor((lockedStake.voteMultiplier / 10_000) * 100)}%
              </p>
              <p className="opacity-50">Voting power</p>
            </li>
          )}
        </ul>
        <div className="w-full">
          {(() => {
            if (timeRemaining === null) return null;

            if (timeRemaining <= 0) {
              if (lockedStake.resolved) {
                // Redeem now
                return (
                  <Button
                    variant="secondary"
                    size="lg"
                    title="Redeem"
                    className="rounded-lg rounded-t-none border-none py-3 bg-green text-white w-full"
                    onClick={() => handleRedeem(lockedStake, false)}
                  />
                );
              }
            }

            return (
              <Button
                variant="outline"
                size="xs"
                title="Early Exit"
                className="rounded-lg rounded-t-none border-none py-3 w-full text-txtfade border-bcolor border-b-0 bg-[#a8a8a810]"
                onClick={() =>
                  handleClickOnFinalizeLockedRedeem(lockedStake, true)
                }
              />
            );
          })()}
        </div>
      </div>
    </div>
  );
}
