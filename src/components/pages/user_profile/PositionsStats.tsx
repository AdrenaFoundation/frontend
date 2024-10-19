import { PublicKey } from '@solana/web3.js';

import StyledContainer from '@/components/common/StyledContainer/StyledContainer';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { PositionExtended, UserProfileExtended } from '@/types';

import Positions from '../trading/Positions/Positions';

export default function PositionsStats({
  connected,
  positions,
  title,
  triggerPositionsReload,
  triggerUserProfileReload,
  removeOptimisticPosition,
  userProfile,

}: {
  connected: boolean;
  positions: PositionExtended[] | null;
  title?: string;
  triggerPositionsReload: () => void;
  triggerUserProfileReload: () => void;
  removeOptimisticPosition: (positionSide: 'long' | 'short', positionCustody: PublicKey) => void;
  userProfile: UserProfileExtended | null | false;
}) {
  const isBigScreen = useBetterMediaQuery('(min-width: 1100px)');

  return (
    <StyledContainer
      title={title}
      titleClassName="text-2xl"
      bodyClassName={
        isBigScreen && positions && positions.length
          ? 'border rounded-lg'
          : 'gap-3 flex-row flex-wrap justify-center'
      }
    >
      <Positions
        bodyClassName="bg-third"
        borderColor="border-inputcolor"
        className="bg-secondary rounded-lg"
        connected={connected}
        positions={positions}
        triggerPositionsReload={triggerPositionsReload}
        triggerUserProfileReload={triggerUserProfileReload}
        removeOptimisticPosition={removeOptimisticPosition}
        isBigScreen={isBigScreen}
        userProfile={userProfile}
      />
    </StyledContainer>
  );
}
