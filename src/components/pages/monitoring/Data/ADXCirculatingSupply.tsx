import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import { formatNumber } from '@/utils';

export default function ADXCirculatingSupply({
  adxTotalSupply,
  titleClassName,
  bodyClassName,
  className,
}: {
  adxTotalSupply: number;
  titleClassName?: string;
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <StyledContainer
      title="ADX CIRCULATING SUPPLY"
      className={twMerge("grow flex items-center", className)}
      titleClassName={titleClassName}
      bodyClassName="items-center"
    >
      <div className="flex items-center">
        <div className={bodyClassName}>{formatNumber(adxTotalSupply, 0, 0)}</div>
        <div className="ml-1">ADX</div>
      </div>
    </StyledContainer>
  );
}
