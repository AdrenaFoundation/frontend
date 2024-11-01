import { BN } from '@coral-xyz/anchor';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { RATE_DECIMALS } from '@/constant';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function StakingRewardsWaitingToBeClaimed({
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
  const alpStakingPendingRewards = alpStakingAccount.resolvedStakingRounds.reduce((acc, round) => {
    if (!round.rate) return acc;

    const totalToClaim = round.rate.mul(round.totalStake.sub(round.totalClaim)).div(new BN(10 ** RATE_DECIMALS));

    return acc + nativeToUi(
      totalToClaim,
      alpStakingAccount.rewardTokenDecimals,
    );
  }, 0);

  const adxStakingPendingRewards = adxStakingAccount.resolvedStakingRounds.reduce((acc, round) => {
    if (!round.rate) return acc;

    const totalToClaim = round.rate.mul(round.totalStake.sub(round.totalClaim)).div(new BN(10 ** RATE_DECIMALS));

    return acc + nativeToUi(
      totalToClaim,
      adxStakingAccount.rewardTokenDecimals,
    );
  }, 0);

  const alpStakingPendingLmRewards = alpStakingAccount.resolvedStakingRounds.reduce((acc, round) => {
    if (!round.lmRate) return acc;

    const lmTotalToClaim = round.lmRate.mul(round.lmTotalStake.sub(round.lmTotalClaim)).div(new BN(10 ** RATE_DECIMALS));

    return acc + nativeToUi(
      lmTotalToClaim,
      window.adrena.client.adxToken.decimals,
    );
  }, 0);

  const adxStakingPendingLmRewards = adxStakingAccount.resolvedStakingRounds.reduce((acc, round) => {
    if (!round.lmRate) return acc;

    const lmTotalToClaim = round.lmRate.mul(round.lmTotalStake.sub(round.lmTotalClaim)).div(new BN(10 ** RATE_DECIMALS));

    return acc + nativeToUi(
      lmTotalToClaim,
      window.adrena.client.adxToken.decimals,
    );
  }, 0);

  return (
    <div className="bg-[#050D14] border rounded-lg flex-1 shadow-xl">
      <div className="w-full border-b p-5">
        <p className={titleClassName}>
          Staking rewards (available, pending claims)
        </p>
        <p className="text-base opacity-50">
          Rewards from past rounds (resolved), waiting to be claimed.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row">
        <div className="p-5 flex-1">
          <div className={titleClassName}>ALP Staking</div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(alpStakingPendingRewards, 0)
                : '-'}
            </div>
            <div className="ml-1 opacity-50">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(alpStakingPendingLmRewards, 0)
                : '-'}
            </div>
            <div className="ml-1 opacity-50">ADX</div>
          </div>
        </div>

        <div className="p-5 flex-1 border-t sm:border-t-0 sm:border-l">
          <div className={titleClassName}>ADX Staking</div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(adxStakingPendingRewards, 0)
                : '-'}
            </div>
            <div className="ml-1 opacity-50">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(adxStakingPendingLmRewards, 0)
                : '-'}
            </div>
            <div className="ml-1 opacity-50">ADX</div>
          </div>
        </div>
      </div>
    </div>
  );
}
