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
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  console.log(
    ' alpStakingAccount.currentStakingRound.startTime',
    alpStakingAccount.currentStakingRound.startTime.toString(),
    getNextStakingRoundStartTime(
      alpStakingAccount.currentStakingRound.startTime,
    ).getTime() / 1000,
  );

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
            timestamp={
              getNextStakingRoundStartTime(
                alpStakingAccount.currentStakingRound.startTime,
              ).getTime() / 1000
            }
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX TOKEN STAKING ROUND ENDS IN</div>

        <div className="m-auto">
          <RemainingTimeToDate
            timestamp={
              getNextStakingRoundStartTime(
                adxStakingAccount.currentStakingRound.startTime,
              ).getTime() / 1000
            }
            className="items-center"
            classNameTime={bodyClassName}
            tippyText="The call is overdue, please check the thread."
          />
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
