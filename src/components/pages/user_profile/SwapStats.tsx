import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

export default function SwapStats({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  return (
    <StyledContainer
      title="Swap Stats"
      titleClassName="text-2xl"
      className={twMerge(className)}
    >
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-start justify-between">
          <div className="text-sm">Swap Count</div>

          <FormatNumber nb={userProfile.swapCount} precision={1} />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Swap Volume</div>

          <FormatNumber
            nb={userProfile.swapVolumeUsd}
            format="currency"
            precision={3}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Fees Paid</div>

          <FormatNumber
            nb={userProfile.swapFeePaidUsd}
            format="currency"
            precision={3}
          />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
