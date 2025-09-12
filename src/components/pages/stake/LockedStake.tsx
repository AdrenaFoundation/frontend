import Tippy from '@tippyjs/react';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import { LockedStakeExtended } from '@/types';
import { nativeToUi } from '@/utils';

import RemainingTimeToDate from '../monitoring/RemainingTimeToDate';

export default function LockedStake({
  lockedStake,
  className,
  readonly = false,
  handleRedeem,
  handleClickOnUpdateLockedStake,
}: {
  lockedStake: LockedStakeExtended;
  className?: string;
  readonly?: boolean;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnUpdateLockedStake: (lockedStake: LockedStakeExtended) => void;
}) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

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

  return (
    <div key={lockedStake.id.toString()} className={twMerge('flex flex-col p-2 w-full', className)}>
      <div className={twMerge('flex w-full items-center gap-4 pb-4 sm:pl-2 sm:pr-2 flex-col sm:flex-row', !readonly ? 'sm:pb-2' : 'sm:pb-0')}>
        <div className='font-boldy text-xs border w-full sm:rounded-xl sm:w-16 h-6 items-center justify-center bg-[#1e272e] flex text-txtfade'>Stake #{lockedStake.index}</div>

        <div className='ml-0 flex gap-0 items-center'>
          <div className='flex gap-1'>
            <FormatNumber
              nb={nativeToUi(lockedStake.amount, lockedStake.tokenSymbol === 'ADX' ? window.adrena.client.adxToken.decimals : window.adrena.client.alpToken.decimals)}
              className='text-base'
              isDecimalDimmed={true}
            />

            <div className='text-base'>{lockedStake.tokenSymbol}</div>
          </div>

          {lockedStake.isGenesis ?
            <div className='text-xxs bg-[#068862a0] font-boldy pt-[0.1em] pb-[0.1em] px-2 ml-4 rounded w-14 text-center'>genesis</div> : null}
        </div>

        <div className='flex gap-2 items-center sm:ml-auto'>
          <div className='text-xs font-boldy text-txtfade'>Unlocks in</div>
          <RemainingTimeToDate timestamp={lockedStake.endTime.toNumber()} className='text-xs' />
        </div>
      </div>

      {!readonly ? <div className='flex w-full gap-2'>
        {timeRemaining !== null && timeRemaining <= 0 ? <Button
          variant="secondary"
          size="lg"
          title="Redeem"
          className="rounded-lg rounded-t-none border-none py-2 bg-green text-white w-full"
          onClick={() => handleRedeem(lockedStake, false)}
        /> : <>
          {!lockedStake.isGenesis ? (
            <Tippy
              disabled={lockedStake.qualifiedForRewardsInResolvedRoundCount !== 0}
              content={
                <div className="flex flex-col justify-around items-center">
                  To upgrade a locked stake, it must have been locked for at least one round, generated rewards, and had those rewards claimed. This process can take up to 12 hours.
                </div>
              }
              placement="auto"
            >
              <div className='flex grow'>
                <Button
                  variant="outline"
                  size="xs"
                  disabled={lockedStake.qualifiedForRewardsInResolvedRoundCount === 0}
                  className="py-2 border-l-0 w-20 text-txtfade border-bcolor bg-[#a8a8a810] grow h-6"
                  title="Upgrade"
                  onClick={() => {
                    handleClickOnUpdateLockedStake(lockedStake)
                  }}
                />
              </div>
            </Tippy>) : null}
        </>}
      </div> : null}
    </div>
  );
}
