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
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>
          Staking rewards (available next round)
        </p>
        <p className="text-base opacity-50">
          Accruing, will be available at the end of the current round.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="p-5 flex-1">
          <div className={titleClassName}>ALP Staking</div>

          <div className={twMerge('flex flex-col', bodyClassName)}>
            <div className="flex items-center">
              <div>
                {nextAlpRoundUsdcRewards !== 0
                  ? formatNumber(nextAlpRoundUsdcRewards, 0)
                  : '-'}
              </div>

              <div className="ml-1 text-base opacity-50">USDC</div>
            </div>

            <div className="flex items-center">
              <div>
                {nextAlpRoundAdxRewards !== 0
                  ? formatNumber(nextAlpRoundAdxRewards, 2)
                  : '-'}
              </div>

              <div className="ml-1 text-base opacity-50">ADX</div>
            </div>
          </div>
        </div>

        <div className="p-5 flex-1 border-t sm:border-l">
          <div className={titleClassName}>ADX Staking</div>

          <div className={twMerge('flex flex-col', bodyClassName)}>
            <div className="flex items-center">
              <div>
                {nextAdxRoundUsdcRewards !== 0
                  ? formatNumber(nextAdxRoundUsdcRewards, 0)
                  : '-'}
              </div>

              <div className="ml-1 text-base opacity-50">USDC</div>
            </div>

            <div className="flex items-center">
              <div>
                {nextAdxRoundAdxRewards !== 0
                  ? formatNumber(nextAdxRoundAdxRewards, 2)
                  : '-'}
              </div>

              <div className="ml-1 text-base opacity-50">ADX</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
