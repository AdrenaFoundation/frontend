
import { twMerge } from 'tailwind-merge';

import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended } from '@/types';

import Positions from '../trading/Positions/Positions';

export default function PositionsStats({
  connected,
  positions,
  className,
  triggerUserProfileReload,
  showFeesInPnl,
}: {
  connected: boolean;
  positions: PositionExtended[] | null;
  className?: string;
  triggerUserProfileReload: () => void;
  showFeesInPnl: boolean;
}) {
  const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');

  return (
    <div
      className={twMerge('gap-3 flex-row flex-wrap justify-center', className)}
    >
      <Positions
        bodyClassName="bg-third"
        borderColor="border-inputcolor"
        className="bg-secondary rounded-lg"
        connected={connected}
        positions={positions}
        triggerUserProfileReload={triggerUserProfileReload}
        isBigScreen={isBigScreen}
        showFeesInPnl={showFeesInPnl}
      />
    </div>
  );
}
