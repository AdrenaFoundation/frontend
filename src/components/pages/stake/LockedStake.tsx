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
  handleRedeem,
  handleClickOnFinalizeLockedRedeem,
  handleClickOnUpdateLockedStake,
}: {
  lockedStake: LockedStakeExtended;
  className?: string;
  handleRedeem: (lockedStake: LockedStakeExtended, earlyExit: boolean) => void;
  handleClickOnFinalizeLockedRedeem: (
    lockedStake: LockedStakeExtended,
    earlyExit: boolean,
  ) => void;
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
      <div className='flex w-full items-center gap-4 pb-4 sm:pb-2 sm:pl-2 sm:pr-2 flex-col sm:flex-row'>
        <div className='font-boldy text-xs border w-full sm:rounded-xl sm:w-6 h-6 items-center justify-center bg-[#1e272e] flex'>#{lockedStake.index}</div>

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

      <div className='flex w-full gap-2'>
        {timeRemaining !== null && timeRemaining <= 0 ? <Button
          variant="secondary"
          size="lg"
          title="Redeem"
          className="rounded-lg rounded-t-none border-none py-2 bg-green text-white w-full"
          onClick={() => handleRedeem(lockedStake, false)}
        /> : <>
          <Button
            variant="outline"
            size="xs"
            title="Early Exit"
            className="py-2 w-20 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
            onClick={() => {
              handleClickOnFinalizeLockedRedeem(lockedStake, true)
            }}
          />

          {!lockedStake.isGenesis && (
            <Button
              variant="outline"
              size="xs"
              title="Upgrade"
              className="py-2 border-l-0 w-20 text-txtfade border-bcolor bg-[#a8a8a810] grow h-8"
              onClick={() => {
                handleClickOnUpdateLockedStake(lockedStake)
              }}
            />
          )}
        </>}
      </div>
    </div>
  );
}
