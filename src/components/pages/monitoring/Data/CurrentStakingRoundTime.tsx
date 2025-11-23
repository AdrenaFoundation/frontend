import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import { Staking } from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import RemainingTimeToDate from '../RemainingTimeToDate';

export default function CurrentStakingRoundTime({
  alpStakingAccount,
  adxStakingAccount,
  titleClassName,
  triggerAlpStakingAccountReload,
  triggerAdxStakingAccountReload,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
  triggerAlpStakingAccountReload: () => void;
  triggerAdxStakingAccountReload: () => void;
}) {
  const [alpRoundPassed, setAlpRoundPassed] = useState<boolean>(false);
  const [adxRoundPassed, setAdxRoundPassed] = useState<boolean>(false);

  useEffect(() => {
    if (!alpStakingAccount) {
      return;
    }

    const interval = setInterval(() => {
      const nextRound = getNextStakingRoundStartTime(
        alpStakingAccount.currentStakingRound.startTime,
      ).getTime();

      if (nextRound - Date.now() < 0) {
        setAlpRoundPassed(true);
      } else if (alpRoundPassed) {
        setAlpRoundPassed(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [alpRoundPassed, alpStakingAccount]);

  useEffect(() => {
    if (!adxStakingAccount) {
      return;
    }

    const interval = setInterval(() => {
      const nextRound = getNextStakingRoundStartTime(
        adxStakingAccount.currentStakingRound.startTime,
      ).getTime();

      if (nextRound - Date.now() < 0) {
        setAdxRoundPassed(true);
      } else if (adxRoundPassed) {
        setAdxRoundPassed(false);
      }
    }, 500);

    return () => {
      clearInterval(interval);
    };
  }, [adxRoundPassed, adxStakingAccount]);

  const triggerManually = async (stakedTokenMint: PublicKey) => {
    const isALP =
      stakedTokenMint.toBase58() ===
      window.adrena.client.lpTokenMint.toBase58();

    const notification = MultiStepNotification.newForRegularTransaction(
      `Resolve ${isALP ? 'ALP' : 'ADX'} Staking Round`,
    ).fire();

    try {
      await window.adrena.client.resolveStakingRound({
        stakedTokenMint,
        notification,
      });

      setTimeout(() => {
        if (isALP) {
          triggerAlpStakingAccountReload();
        } else {
          triggerAdxStakingAccountReload();
        }
      }, 0);
    } catch (error) {
      console.error('error', error);
    }
  };

  return (
    <div className="bg-[#050D14] border rounded-md flex-1 flex grow flex-col shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>Staking Rounds Time</p>

        <p className="text-xs opacity-50">Next staking rounds starting in</p>
      </div>

      <div className="flex flex-col sm:flex-row grow">
        <div className="flex-1 p-3 border-t sm:border-t-0 sm:border-l flex items-center justify-center flex-col">
          <div className="mb-3 text-xs sm:text-sm text-txtfade font-semibold uppercase">
            ADX Staking
          </div>

          <div className="flex items-center flex-wrap gap-5">
            <RemainingTimeToDate
              timestamp={
                getNextStakingRoundStartTime(
                  adxStakingAccount.currentStakingRound.startTime,
                ).getTime() / 1000
              }
              className="items-center text-xl"
              tippyText="The call is overdue."
            />

            {adxRoundPassed ? (
              <Button
                className="text-xs"
                title="Trigger manually"
                onClick={() =>
                  triggerManually(window.adrena.client.lmTokenMint)
                }
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
