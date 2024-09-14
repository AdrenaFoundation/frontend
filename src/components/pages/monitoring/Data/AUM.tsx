import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { formatPriceInfo } from '@/utils';

export default function AUM({
  titleClassName,
  bodyClassName,
}: {
  titleClassName?: string;
  bodyClassName?: string;
}) {
  const aumUsd = useAssetsUnderManagement();

  return (
    <StyledContainer
      title="AUM"
      headerClassName="text-center justify-center"
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div className={bodyClassName}>
        {aumUsd !== null ? formatPriceInfo(aumUsd, 0) : '-'}
      </div>
    </StyledContainer>
  );
}
