import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { PoolInfo } from '@/hooks/usePoolInfo';
import { formatPriceInfo } from '@/utils';

export default function AUM({
  poolInfo,
  titleClassName,
  bodyClassName,
}: {
  poolInfo: PoolInfo | null;
  titleClassName?: string;
  bodyClassName?: string;
}) {
  return (
    <StyledContainer
      title="AUM"
      headerClassName="text-center justify-center"
      className="w-auto grow flex items-center min-w-[22em]"
      titleClassName={titleClassName}
    >
      <div className={bodyClassName}>
        {poolInfo ? formatPriceInfo(poolInfo.aumUsd, 0) : '-'}
      </div>
    </StyledContainer>
  );
}
