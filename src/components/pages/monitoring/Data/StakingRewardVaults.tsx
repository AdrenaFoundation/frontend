import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { Staking } from '@/types';
import { nativeToUi } from '@/utils';

export default function StakingRewardVaults({
  alpStakingAccount,
  adxStakingAccount,
  alpStakingRewardsAccumulated,
  adxStakingRewardsAccumulated,
  titleClassName,
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
}) {
  let nextAdxRoundUsdcRewards = 0;
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
    nextAdxRoundUsdcRewards =
      adxStakingRewardsAccumulated.usdcRewards -
      nativeToUi(
        adxStakingAccount.resolvedRewardTokenAmount,
        adxStakingAccount.rewardTokenDecimals,
      );

    // ADX rewards
    nextAdxRoundAdxRewards = nativeToUi(
      adxStakingAccount.currentMonthEmissionAmountPerRound,
      window.adrena.client.adxToken.decimals,
    );
  }

  return (
    <div className="bg-[#050D14] border rounded-md flex-1 shadow-xl">
      <div className="w-full border-b p-3">
        <p className={titleClassName}>
          ADX Staking Rewards (available next round)
        </p>

        <p className="text-xs opacity-50">
          Accruing, will be available at the end of the current round.
        </p>
      </div>

      <div className="flex pl-5 pt-3 pb-1 pr-3 flex-col grow items-center justify-center w-full">
        <NumberDisplay
          nb={nextAdxRoundUsdcRewards}
          precision={0}
          suffix="USDC"
          className="border-0 p-0"
        />

        <NumberDisplay
          nb={nextAdxRoundAdxRewards}
          precision={0}
          suffix="ADX"
          className="border-0 p-0"
        />
      </div>
    </div>
  );
}
