import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { Staking } from '@/types';
import { formatNumber, nativeToUi } from '@/utils';

export default function LockedStakedADX({
  adxStakingAccount,
  titleClassName,
  bodyClassName,
  className,
}: {
  adxStakingAccount: Staking;
  titleClassName?: string;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="LOCKED STAKED ADX"
      className={twMerge("grow flex items-center", className)}
      titleClassName={titleClassName}
    >
      <div className="flex items-center justify-center">
        <div className={bodyClassName}>
          {formatNumber(
            nativeToUi(
              adxStakingAccount.nbLockedTokens,
              adxStakingAccount.stakedTokenDecimals,
            ),
            0,
          )}
        </div>
        <div className="ml-1">ADX</div>
      </div>
    </StyledContainer>
  );
}
