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
          <div className="text-sm text-txtfade">Swaps count</div>

          <FormatNumber nb={userProfile.swapCount} precision={1} />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade">All time swap volume</div>

          <FormatNumber
            nb={userProfile.swapVolumeUsd}
            format="currency"
            precision={2}
          />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm text-txtfade">Total fees</div>

          <FormatNumber
            nb={userProfile.swapFeePaidUsd}
            format="currency"
            precision={2}
            className="text-red"
          />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
