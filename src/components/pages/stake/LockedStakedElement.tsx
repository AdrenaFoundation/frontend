import Tippy from '@tippyjs/react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended, Token } from '@/types';
import { formatMilliseconds, formatNumber, nativeToUi } from '@/utils';

import lockIcon from '../../../../public/images/Icons/lock.svg';

export default function LockedStakedElement({
  token,
  lockedStake,
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
}: {
  token: Token;
  lockedStake: LockedStakeExtended;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const calculateTimeRemaining = useCallback(() => {
    const timeRemaining = lockedStake.endTime.toNumber() * 1000 - Date.now();

    setTimeRemaining(timeRemaining);
  }, [lockedStake.endTime]);

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

  const remainingDaysDiv = (
    <div>
      <Tippy content={`Precisely on ${endDate?.toLocaleString()}`}>
        <span className="opacity-50 underline-dashed">
          {`Unlocks in ${Math.ceil(timeRemaining / (3600 * 24 * 1000))} days`}
        </span>
      </Tippy>
    </div>
  );

  const lockStakedAmount = nativeToUi(lockedStake.amount, token.decimals);

  return (
    <div
      className={twMerge(
        'flex flex-col gap-2 border justify-between items-center bg-secondary rounded-xl shadow-lg flex-1 overflow-hidden',
        lockedStake.resolved && 'border-green',
      )}
      ref={containerRef}
    >
      <div className="flex flex-col w-full p-2 pb-0">
        <div className="flex flex-row items-center justify-between">
          <div className="flex items-center opacity-50">
            <Image src={lockIcon} width={10} height={10} alt="Lock icon" />

            <span className="ml-1 font-boldy">
              {Number(lockedStake.lockDuration) / 3600 / 24}
              <span> days</span>
            </span>
          </div>

          {endDate && timeRemaining && remainingDaysDiv
            ? remainingDaysDiv
            : null}
        </div>

        <div className="flex justify-between items-center">
          <FormatNumber
            nb={lockStakedAmount}
            className="text-xl inline-block"
            suffix={` ${token.symbol}`}
            isSuffixDimmed={true}
            isAbbreviate={lockStakedAmount >= 100_000}
            isDecimalDimmed={lockStakedAmount < 100_000}
            precision={lockStakedAmount < 1000 ? 2 : 0}
            minimumFractionDigits={lockStakedAmount < 1000 ? 2 : 0}
            info={formatNumber(lockStakedAmount, 2, 0, 6)}
          />

          {lockedStake.isGenesis ? (
            <Tippy
              content={
                <div className="text-sm w-60 flex flex-col justify-around">
                  <div>
                    This stake has been made during the genesis campaign.
                  </div>

                  <div>
                    It gets a share of 5% of the total ADX supply as an extra
                    reward.
                  </div>
                </div>
              }
              placement="auto"
            >
              <div className="text-xs border-b-[#068862] border pr-1 pl-1 rounded bg-[#068862] text-white font-mono">
                genesis
              </div>
            </Tippy>
          ) : null}
        </div>
      </div>

      <div className="flex-col w-full flex items-center flex-none">
        <ul className="flex flex-row border-y border-bcolor w-full items-center flex-none">
          <li className="flex-1 p-2 text-center">
            <p className="font-mono">
              {Math.floor((lockedStake.lmRewardMultiplier / 10_000) * 100)}%
            </p>
            <p className="opacity-50 text-xs">ADX Emissions</p>
          </li>

          <li
            className={twMerge(
              lockedStake.voteMultiplier > 0
                ? 'border-x px-4'
                : 'border-l pl-4',
              'flex-1 p-2 border-bcolor text-center',
            )}
          >
            <p className="font-mono">
              {Math.floor((lockedStake.rewardMultiplier / 10_000) * 100)}%
            </p>
            <p className="opacity-50 text-xs">USDC yield</p>
          </li>

          {lockedStake.voteMultiplier > 0 && (
            <li className="flex-1 p-2 text-center">
              <p className="font-mono">
                {Math.floor((lockedStake.voteMultiplier / 10_000) * 100)}%
              </p>

              <p className="opacity-50 text-xs">Voting Power</p>
            </li>
          )}
        </ul>

        <div className="w-full flex">
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
                    className="rounded-lg rounded-t-none border-none py-2 bg-green text-white w-full"
                    onClick={() => handleRedeem(lockedStake, false)}
                  />
                );
              }
            }

            return (
              <>
                <Button
                  variant="outline"
                  size="xs"
                  title="Early Exit"
                  className="rounded-none border-none py-2 w-20 grow text-txtfade border-bcolor border-b-0 bg-[#a8a8a810]"
                  onClick={() =>
                    handleClickOnFinalizeLockedRedeem(lockedStake, true)
                  }
                />
                <div className="w-px bg-bcolor" />
                {!lockedStake.isGenesis && (
                  <Button
                    variant="outline"
                    size="xs"
                    title="Upgrade"
                    className="rounded-none border-none py-2 w-20 grow text-txtfade border-bcolor border-b-0 bg-[#a8a8a810]"
                    onClick={() => handleClickOnUpdateLockedStake(lockedStake)}
                  />
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
