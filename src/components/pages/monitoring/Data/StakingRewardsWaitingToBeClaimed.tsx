import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { RATE_DECIMALS } from '@/constant';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';
import { BN } from '@coral-xyz/anchor';

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
    <StyledContainer
      title="Staking rewards (available, pending claims)"
      subTitle="Rewards from past rounds (resolved), waiting to be claimed."
      className="w-auto grow"
      titleClassName={titleClassName}
      bodyClassName="flex sm:flex-row grow flex-col"
    >
      <StyledSubContainer>
        <div className={titleClassName}>ALP Staking</div>

        <div className="m-auto flex-col">
          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  alpStakingPendingRewards,
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {alpStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  alpStakingPendingLmRewards,
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">ADX</div>
          </div>
        </div>
      </StyledSubContainer>

      <StyledSubContainer>
        <div className={titleClassName}>ADX Staking</div>

        <div className="m-auto flex-col">
          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  adxStakingPendingRewards,
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">USDC</div>
          </div>

          <div className="flex items-center">
            <div className={bodyClassName}>
              {adxStakingAccount.resolvedRewardTokenAmount !== null
                ? formatNumber(
                  adxStakingPendingLmRewards,
                  0,
                )
                : '-'}
            </div>
            <div className="ml-1">ADX</div>
          </div>
        </div>
      </StyledSubContainer>
    </StyledContainer>
  );
}
