import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { formatPriceInfo } from '@/utils';

export default function CurrentStakingRoundFees({
  alpStakingCurrentRoundRewards,
  adxStakingCurrentRoundRewards,
  titleClassName,
  bodyClassName,
}: {
  alpStakingCurrentRoundRewards: number | null;
  adxStakingCurrentRoundRewards: number | null;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="CURRENT STAKING ROUND FEES"
      subTitle="Accumulating fees to be redistributed to stakers at the end of the current staking round."
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          {alpStakingCurrentRoundRewards !== null &&
          adxStakingCurrentRoundRewards !== null
            ? formatPriceInfo(
                alpStakingCurrentRoundRewards + adxStakingCurrentRoundRewards,
              )
            : '-'}
        </div>
      </div>
    </StyledContainer>
  );
}
