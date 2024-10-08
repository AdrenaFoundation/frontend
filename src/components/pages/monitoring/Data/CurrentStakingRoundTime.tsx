import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { getNextStakingRoundStartTime } from '@/utils';

import RemainingTimeToDate from '../RemainingTimeToDate';
import Button from '@/components/common/Button/Button';
import { PublicKey } from '@solana/web3.js';
import MultiStepNotification from '@/components/common/MultiStepNotification/MultiStepNotification';

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

  const nextAlpTimestamp =
    getNextStakingRoundStartTime(
      alpStakingAccount.currentStakingRound.startTime,
    ).getTime() / 1000;

  const nextAdxTimestamp =
    getNextStakingRoundStartTime(
      adxStakingAccount.currentStakingRound.startTime,
    ).getTime() / 1000;

  return (
    <StyledContainer
      title="CURRENT STAKING ROUND TIME"
      className="grow w-[30em]"
      bodyClassName="flex grow"
      titleClassName={titleClassName}
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP TOKEN STAKING ROUND ENDS IN</div>

        <div className="m-auto">
          <RemainingTimeToDate
            timestamp={nextAlpTimestamp}
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />

          {nextAlpTimestamp < 0 ? (
            <Button
              className="text-xs"
              title="Trigger manually"
              onClick={() => triggerManually(window.adrena.client.lpTokenMint)}
            />
          ) : null}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX TOKEN STAKING ROUND ENDS IN</div>

        <div className="m-auto flex items-center justify-center gap-4">
          <RemainingTimeToDate
            timestamp={nextAdxTimestamp}
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />

          {nextAdxTimestamp < 0 ? (
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
