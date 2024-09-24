import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import useAssetsUnderManagement from '@/hooks/useAssetsUnderManagement';
import { formatPriceInfo } from '@/utils';

export default function AUM({
  titleClassName,
  bodyClassName,
  connected,
}: {
  titleClassName?: string;
  bodyClassName?: string;
  connected: boolean;
}) {
  const aumUsd = useAssetsUnderManagement();

  return (
    <StyledContainer
      title="AUM"
      headerClassName="text-center justify-center"
      className="grow flex items-center min-w-[22em] w-[22em]"
      titleClassName={titleClassName}
    >
      <div className={twMerge('flex', bodyClassName)}>
        {aumUsd !== null ? formatPriceInfo(aumUsd, 0) : '-'}
        {!connected ? <div className="text-txtfade">*</div> : null}
      </div>

      {!connected ? (
        <div className="text-txtfade text-xs ml-auto mr-auto relative bottom-3">
          Expect up to a 5-minute delay in the data
        </div>
      ) : null}
    </StyledContainer>
  );
}
