import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';

import Positions from '../trading/Positions/Positions';

export default function PositionsStats({
  connected,
  positions,
  title,
  triggerPositionsReload,
  triggerUserProfileReload,
}: {
  connected: boolean;
  positions: PositionExtended[] | null;
  title?: string;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
}) {
  const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');

  return (
    <StyledContainer
      title={title}
      titleClassName="text-2xl"
      bodyClassName={
        isBigScreen && positions && positions.length
          ? 'border rounded-lg'
          : 'gap-0'
      }
    >
      <Positions
        bodyClassName="bg-third"
        className="bg-secondary rounded-lg"
        connected={connected}
        positions={positions}
        triggerPositionsReload={triggerPositionsReload}
        triggerUserProfileReload={triggerUserProfileReload}
        wrapped={false}
      />
    </StyledContainer>
  );
}
