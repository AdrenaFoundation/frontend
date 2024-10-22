import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function StakingLockedTokens({
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
  return (
    <StyledContainer
      title="Locked Stakes amounts"
      subTitle="Tokens locked in the staking program."
      className="w-auto grow"
      bodyClassName="flex flex-col sm:flex-row grow items-center justify-center"
      titleClassName={titleClassName}
    >
      <StyledSubContainer>
        <div className={titleClassName}>Locked ALP</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {formatNumber(
            nativeToUi(
              alpStakingAccount.nbLockedTokens,
              alpStakingAccount.stakedTokenDecimals,
            ),
            0,
          )}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>Locked ADX</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {formatNumber(
            nativeToUi(
              adxStakingAccount.nbLockedTokens,
              adxStakingAccount.stakedTokenDecimals,
            ),
            0,
          )}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
