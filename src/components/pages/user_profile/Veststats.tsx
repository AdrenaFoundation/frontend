import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubSubContainer from '@/components/common/StyledSubSubContainer/StyledSubSubContainer';
import FormatNumber from '@/components/Number/FormatNumber';
import { UserProfileExtended } from '@/types';

export default function VestStats({
  userProfile,
  className,
}: {
  userProfile: UserProfileExtended;
  className?: string;
}) {
  console.log(userProfile);
  return (
    <StyledContainer title={<h2>Vest Stats</h2>} className={twMerge(className)}>
      <StyledSubSubContainer className="flex-col">
        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Vesting Status</div>

          <FormatNumber nb={0} format="currency" precision={3} />
        </div>

        <div className="flex w-full items-center justify-between">
          <div className="text-sm">Claimable</div>

          <FormatNumber nb={0} format="currency" precision={3} />
        </div>
      </StyledSubSubContainer>
    </StyledContainer>
  );
}
