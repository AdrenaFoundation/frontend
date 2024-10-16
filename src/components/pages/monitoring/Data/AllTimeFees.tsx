import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PoolExtended } from '@/types';
import { formatPriceInfo } from '@/utils';

export default function AllTimeFees({
  mainPool,
  className,
  titleClassName,
  bodyClassName,
}: {
  mainPool: PoolExtended;
  className?: string;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      headerClassName="text-center justify-center"
      title="ALL TIME FEES"
      className={twMerge(
        'grow flex items-center min-w-[22em] w-[22em]',
        className,
      )}
      titleClassName={titleClassName}
    >
      <div
        className={twMerge('items-center justify-center flex', bodyClassName)}
      >
        {formatPriceInfo(mainPool.totalFeeCollected, 0)}
      </div>
    </StyledContainer>
  );
}
