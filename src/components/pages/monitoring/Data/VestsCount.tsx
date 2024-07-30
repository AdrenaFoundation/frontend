import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { VestRegistry } from '@/types';
import { formatNumber } from '@/utils';

export default function VestsCount({
  vestRegistry,
  titleClassName,
  bodyClassName,
}: {
  vestRegistry: VestRegistry;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center min-w-[10em]"
      title="VESTS COUNT"
      className="w-auto grow"
      bodyClassName="items-center"
      titleClassName={titleClassName}
    >
      <div
        className={twMerge('items-center justify-center flex', bodyClassName)}
      >
        {formatNumber(vestRegistry.vests.length, 2)}
      </div>
    </StyledContainer>
  );
}
