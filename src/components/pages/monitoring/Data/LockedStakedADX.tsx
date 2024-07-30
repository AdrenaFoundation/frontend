import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function LockedStakedADX({
  adxStakingAccount,
  titleClassName,
  bodyClassName,
}: {
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="LOCKED STAKED ADX"
      className="w-auto grow min-w-[22em]"
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          {formatNumber(
            nativeToUi(
              adxStakingAccount.nbLockedTokens,
              adxStakingAccount.stakedTokenDecimals,
            ),
            2,
          )}
        </div>
        <div className="ml-1">ADX</div>
      </div>
    </StyledContainer>
  );
}
