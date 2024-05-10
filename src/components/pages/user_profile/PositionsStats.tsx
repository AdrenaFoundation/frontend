import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import StyledSubContainer from '@/components/common/StyledSubContainer/StyledSubContainer';
import { PositionExtended } from '@/types';

import Positions from '../trading/Positions/Positions';

export default function PositionsStats({
  positions,
  triggerPositionsReload,
}: {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
}) {
  return (
    <StyledContainer title={<h2>My Opened Positions</h2>}>
      <StyledSubContainer className="pt-0 pl-0 pb-0 pr-1 bg-third min-h-[5em]">
        <Positions
          positions={positions}
          triggerPositionsReload={triggerPositionsReload}
        />
      </StyledSubContainer>
    </StyledContainer>
  );
}
