import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function StakingRewardVaults({
  alpStakingAccount,
  adxStakingAccount,
  alpStakingRewardsAccumulated,
  adxStakingRewardsAccumulated,
  titleClassName,
  bodyClassName,
}: {
  alpStakingAccount: Staking;
  adxStakingAccount: Staking;
  alpStakingRewardsAccumulated: {
    usdcRewards: number | null;
    adxRewards: number | null;
  } | null;
  adxStakingRewardsAccumulated: {
    usdcRewards: number | null;
    adxRewards: number | null;
  } | null;
  titleClassName?: string;
  bodyClassName?: string;
}) {

  let nextAlpRoundUsdcRewards = 0;
  let nextAdxRoundUsdcRewards = 0;
  let nextAlpRoundAdxRewards = 0;
  let nextAdxRoundAdxRewards = 0;


  if (
    alpStakingRewardsAccumulated !== null &&
    alpStakingRewardsAccumulated.usdcRewards !== null &&
    adxStakingRewardsAccumulated !== null &&
    adxStakingRewardsAccumulated.usdcRewards !== null &&
    alpStakingAccount !== null &&
    adxStakingAccount !== null &&
    alpStakingAccount.resolvedRewardTokenAmount !== null &&
    adxStakingAccount.resolvedRewardTokenAmount !== null
  ) {
    // USDC rewards
    nextAlpRoundUsdcRewards =
      alpStakingRewardsAccumulated.usdcRewards -
      nativeToUi(
        alpStakingAccount.resolvedRewardTokenAmount,
        alpStakingAccount.rewardTokenDecimals,
      );
    nextAdxRoundUsdcRewards =
      adxStakingRewardsAccumulated.usdcRewards -
      nativeToUi(
        adxStakingAccount.resolvedRewardTokenAmount,
        adxStakingAccount.rewardTokenDecimals,
      );

    // ADX rewards
    nextAlpRoundAdxRewards = nativeToUi(
      alpStakingAccount.currentMonthEmissionAmountPerRound,
      window.adrena.client.adxToken.decimals,
    );
    nextAdxRoundAdxRewards = nativeToUi(
      adxStakingAccount.currentMonthEmissionAmountPerRound,
      window.adrena.client.adxToken.decimals,
    );
  }

  return (
    <StyledContainer
      title="Current round rewards"
      subTitle="Rewards accruing that will become available at the end of the current staking round."
      className="grow w-[40em]"
      titleClassName={titleClassName}
      bodyClassName="flex flex-col sm:flex-row grow items-center justify-center"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP STAKING</div>

        <div className={twMerge('m-auto flex-col', bodyClassName)}>
          <div className="flex items-center">
            <div>
              {nextAlpRoundUsdcRewards !== 0
                ? formatNumber(nextAlpRoundUsdcRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">USDC</div>
          </div>

          <div className="flex items-center">
            <div>
              {nextAlpRoundAdxRewards !== 0
                ? formatNumber(nextAlpRoundAdxRewards, 2)
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
              {nextAdxRoundUsdcRewards !== 0
                ? formatNumber(nextAdxRoundUsdcRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">USDC</div>
          </div>

          <div className="flex items-center">
            <div>
              {nextAdxRoundAdxRewards !== 0
                ? formatNumber(nextAdxRoundAdxRewards, 2)
                : '-'}
            </div>

            <div className="ml-1 text-base">ADX</div>
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
