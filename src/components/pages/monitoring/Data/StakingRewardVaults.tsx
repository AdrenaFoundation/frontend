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
      title="Current round accrued usdc"
      subTitle="USDC rewards accruing to be redistributed to stakers at the end of the staking round."
      className="grow w-[40em]"
      titleClassName={titleClassName}
      bodyClassName="flex flex-col sm:flex-row grow items-center justify-center"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP STAKING</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {alpStakingCurrentRoundRewards !== null
            ? formatPriceInfo(alpStakingCurrentRoundRewards)
            : '-'}
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX STAKING</div>

        <div className={twMerge('m-auto', bodyClassName)}>
          {adxStakingCurrentRoundRewards !== null
            ? formatPriceInfo(adxStakingCurrentRoundRewards)
            : '-'}
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
