import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { formatNumber } from '@/utils';

export default function PendingUsdcStakingRewards({
  alpStakingRewardsAccumulated,
  adxStakingRewardsAccumulated,
  titleClassName,
  bodyClassName,
}: {
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
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="Pending Staking Rewards"
      subTitle="Shows the total amount of unclaimed USDC rewards, combining ALP and ADX staking rewards."
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          <div className="flex items-center">
            <div>
              {alpStakingRewardsAccumulated !== null &&
                adxStakingRewardsAccumulated !== null &&
                alpStakingRewardsAccumulated.usdcRewards !== null &&
                adxStakingRewardsAccumulated.usdcRewards !== null
                ? formatNumber(
                  alpStakingRewardsAccumulated.usdcRewards +
                  adxStakingRewardsAccumulated.usdcRewards,
                  0,
                )
                : '-'}
            </div>

            <div className="ml-1 text-base">USDC</div>
          </div>
        </div>
      </div>
    </StyledContainer>
  );
}
