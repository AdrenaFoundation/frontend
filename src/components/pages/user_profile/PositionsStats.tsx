import { twMerge } from 'tailwind-merge';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { PositionExtended } from '@/types';

import Positions from '../trading/Positions/Positions';

export default function PositionsStats({
  className,
  positions,
  title,
  triggerPositionsReload,
}: {
  className?: string;
  positions: PositionExtended[] | null;
  title?: string;
  triggerPositionsReload: () => void;
}) {
  return (
    <StyledContainer title={<h2>{title}</h2>} className={twMerge(className)}>
      <StyledSubContainer className="pt-0 pl-0 pb-0 pr-1 min-h-[5em]">
        <Positions
          positions={positions}
          triggerPositionsReload={triggerPositionsReload}
        />
      </StyledSubContainer>
    </StyledContainer>
  );
}
