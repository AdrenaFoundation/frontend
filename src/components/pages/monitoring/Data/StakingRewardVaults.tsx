import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function StakingRewardVaults({
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
  titleClassName,
  bodyClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      title="STAKING REWARD VAULTS"
      subTitle="Rewards accruing to be redistributed to stakers at the end of the staking round."
      className="w-auto grow"
      titleClassName={titleClassName}
      bodyClassName="flex flex-col sm:flex-row grow items-center justify-center"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP TOKEN STAKING</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {alpStakingCurrentRoundRewards !== null
            ? formatPriceInfo(alpStakingCurrentRoundRewards)
            : '-'}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX TOKEN STAKING</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {adxStakingCurrentRoundRewards !== null
            ? formatPriceInfo(adxStakingCurrentRoundRewards)
            : '-'}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
