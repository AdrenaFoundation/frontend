import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatNumber } from '@/utils';

export default function StakingRewardVaults({
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
  titleClassName,
  bodyClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  alpStakingCurrentRoundRewards: {
    usdcRewards: number | null;
    adxRewards: number | null;
  } | null;
  adxStakingCurrentRoundRewards: {
    usdcRewards: number | null;
    adxRewards: number | null;
  } | null;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      title="Current round rewards"
      subTitle="Rewards accruing to be redistributed to stakers at the end of the staking round."
      className="grow w-[40em]"
      titleClassName={titleClassName}
      bodyClassName="flex flex-col sm:flex-row grow items-center justify-center"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP STAKING</div>

        <div className={twMerge('m-auto flex-col', bodyClassName)}>
          <div className="flex items-center">
            <div>
              {alpStakingCurrentRoundRewards !== null &&
              alpStakingCurrentRoundRewards.usdcRewards !== null
                ? formatNumber(alpStakingCurrentRoundRewards.usdcRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">USDC</div>
          </div>

          <div className="flex items-center">
            <div>
              {alpStakingCurrentRoundRewards !== null &&
              alpStakingCurrentRoundRewards.adxRewards !== null
                ? formatNumber(alpStakingCurrentRoundRewards.adxRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">ADX</div>
          </div>
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX STAKING</div>

        <div className={twMerge('m-auto flex-col', bodyClassName)}>
          <div className="flex items-center">
            <div>
              {adxStakingCurrentRoundRewards !== null &&
              adxStakingCurrentRoundRewards.usdcRewards !== null
                ? formatNumber(adxStakingCurrentRoundRewards.usdcRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">USDC</div>
          </div>

          <div className="flex items-center">
            <div>
              {adxStakingCurrentRoundRewards !== null &&
              adxStakingCurrentRoundRewards.adxRewards !== null
                ? formatNumber(adxStakingCurrentRoundRewards.adxRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">ADX</div>
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
