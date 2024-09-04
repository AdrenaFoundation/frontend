import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';

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

  return (
    <div className="flex flex-col sm:flex-row border pt-2 pb-2 pl-3 pr-2 sm:pr-1 justify-between bg-third rounded-lg">
      <div className="flex flex-row sm:flex-col justify-between">
        <div>
          <FormatNumber
            nb={nativeToUi(lockedStake.amount, token.decimals)}
            className="text-lg inline-block"
          />{' '}
          <span className="text-lg ml-1">{token.symbol}</span>
        </div>

        <div className="flex items-center">
          <Image src={lockIcon} width={10} height={10} alt="Lock icon" />

          <span className="text-xs ml-1">
            Locked for {Number(lockedStake.lockDuration) / 3600 / 24}
            <span> days</span>
          </span>
        </div>
      </div>

      <div className="flex flex-col mt-4 mb-4 sm:mt-0 sm:mb-0 justify-center">
        <span className="text-xs text-txtfade">
          {Math.floor((lockedStake.lmRewardMultiplier / 10_000) * 100)}% bonus
          ADX
        </span>
        <span className="text-xs text-txtfade">
          {Math.floor((lockedStake.rewardMultiplier / 10_000) * 100)}% bonus
          USDC yield
        </span>
        {lockedStake.voteMultiplier > 0 ? (
          <span className="text-xs text-txtfade">
            {Math.floor((lockedStake.voteMultiplier / 10_000) * 100)}% bonus
            voting power
          </span>
        ) : null}
      </div>

      <>
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
                  onClick={() => handleRedeem(lockedStake, false)}
                />
              );
            }
          }

          // Display a specific date if it's more than in 30 days
          if (timeRemaining > 30 * 3600 * 24 * 1000) {
            const today = new Date();
            const endDate = new Date(today.getTime() + timeRemaining);

            return (
              <>
                <div className="flex items-center w-full sm:w-[8em] md:w-[7em] lg:w-[8em] sm:justify-center">
                  <span className="text-xs">Ends the</span>&nbsp;
                  <span className="text-xs">
                    {endDate.toLocaleString('en', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center w-full sm:w-[8em] h-full sm:justify-center">
                  <Button
                    variant="outline"
                    size="md"
                    title="Early Exit"
                    className="opacity-80 mt-4 mb-4 sm:ml-4 md:ml-2 w-full"
                    onClick={() =>
                      handleClickOnFinalizeLockedRedeem(lockedStake, true)
                    }
                  />
                </div>
              </>
            );
          }

          return (
            <>
              <div className="flex sm:flex-col items-center w-full sm:w-[8em] md:w-[7em] sm:justify-center">
                <span className="text-xs">Ends in</span>&nbsp;
                <span className="text-xs ml-1 sm:ml-0">
                  {formatMilliseconds(timeRemaining)}
                </span>
              </div>
              <Button
                variant="outline"
                size="md"
                title="Early Exit"
                className="opacity-80 mt-4 sm:mt-0 sm:ml-4 md:ml-2 h-[70%]"
                onClick={() =>
                  handleClickOnFinalizeLockedRedeem(lockedStake, true)
                }
              />
            </>
          );
        })()}
      </>
    </div>
  );
}
