import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PoolExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function AllTimeSwapVolume({
  mainPool,
  titleClassName,
  bodyClassName,
}: {
  mainPool: PoolExtended;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="All Time Swap Volume"
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div
        className={twMerge('items-center justify-center flex', bodyClassName)}
      >
        {formatPriceInfo(mainPool.totalSwapVolume, 0)}
      </div>
    </StyledContainer>
  );
}
