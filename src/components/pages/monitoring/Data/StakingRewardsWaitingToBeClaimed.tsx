import { BN } from '@coral-xyz/anchor';

import NumberDisplay from '@/components/common/NumberDisplay/NumberDisplay';
import { RATE_DECIMALS } from '@/constant';
import { Staking } from '@/types';
import { nativeToUi } from '@/utils';

export default function StakingRewardsWaitingToBeClaimed({
  adxStakingAccount,
  titleClassName,
}: {
  adxStakingAccount: Staking;
  titleClassName?: string;
}) {
  const adxStakingPendingRewards = adxStakingAccount.resolvedStakingRounds.reduce((acc, round) => {
    if (!round.rate) return acc;

    const totalToClaim = round.rate.mul(round.totalStake.sub(round.totalClaim)).div(new BN(10 ** RATE_DECIMALS));

    return acc + nativeToUi(
      totalToClaim,
      adxStakingAccount.rewardTokenDecimals,
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
      <div className="w-full border-b p-3">
        <p className={titleClassName}>
          ADX Staking Rewards (available, pending claims)
        </p>
        <p className="text-xs opacity-50">
          Rewards from past rounds (resolved), waiting to be claimed.
        </p>
      </div>

      <div className="flex pl-5 pt-3 pb-1 pr-3 flex-col grow border-t sm:border-l">
        <NumberDisplay
          nb={adxStakingPendingRewards}
          precision={0}
          suffix='USDC'
          className='border-0 p-0 items-start'
        />

        <NumberDisplay
          nb={adxStakingPendingLmRewards}
          precision={0}
          suffix='ADX'
          className='border-0 p-0 items-start'
        />
      </div>
    </div>
  );
}
