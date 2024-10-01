import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { formatNumber } from '@/utils';

export default function CurrentStakingRoundFees({
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
  titleClassName,
  bodyClassName,
}: {
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
      headerClassName="text-center justify-center"
      title="CURRENT STAKING ROUND FEES"
      subTitle="Accumulating fees to be redistributed to stakers at the end of the current staking round. ALP and ADX staking rewards combined."
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          <div className="flex items-center">
            <div>
              {alpStakingCurrentRoundRewards !== null &&
              adxStakingCurrentRoundRewards !== null &&
              alpStakingCurrentRoundRewards.usdcRewards !== null &&
              adxStakingCurrentRoundRewards.usdcRewards !== null
                ? formatNumber(
                    alpStakingCurrentRoundRewards.usdcRewards +
                      adxStakingCurrentRoundRewards.usdcRewards,
                    2,
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
