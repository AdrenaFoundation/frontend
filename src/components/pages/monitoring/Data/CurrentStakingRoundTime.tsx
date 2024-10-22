import { PublicKey } from '@solana/web3.js';
import { useEffect, useState } from 'react';

import Button from '@/components/common/Button/Button';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';
import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import RemainingTimeToDate from '../RemainingTimeToDate';

export default function CurrentStakingRoundTime({
  alpStakingAccount,
  adxStakingAccount,
  titleClassName,
  bodyClassName,
  triggerAlpStakingAccountReload,
  triggerAdxStakingAccountReload,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
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

      if ((nextRound - Date.now()) < 0) {
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

      if ((nextRound - Date.now()) < 0) {
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
    <StyledContainer
      title="Next staking rounds starting in"
      className="grow w-[30em]"
      bodyClassName="flex grow"
      titleClassName={titleClassName}
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP Staking</div>

        <div className="m-auto">
          <RemainingTimeToDate
            timestamp={getNextStakingRoundStartTime(
              alpStakingAccount.currentStakingRound.startTime,
            ).getTime() / 1000}
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />

          {alpRoundPassed ? (
            <Button
              className="text-xs"
              title="Trigger manually"
              onClick={() => triggerManually(window.adrena.client.lpTokenMint)}
            />
          ) : null}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX Staking</div>

        <div className="m-auto flex items-center justify-center gap-4">
          <RemainingTimeToDate
            timestamp={getNextStakingRoundStartTime(
              adxStakingAccount.currentStakingRound.startTime,
            ).getTime() / 1000}
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />

          {adxRoundPassed ? (
            <Button
              className="text-xs"
              title="Trigger manually"
              onClick={() => triggerManually(window.adrena.client.lmTokenMint)}
            />
          ) : null}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
