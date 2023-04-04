import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

// TODO: Reload periodically?
const usePositions = (
  client: AdrenaClient | null,
): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
} => {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const loadPositions = useCallback(async () => {
    if (!client || !wallet?.walletAddress) return;

    setPositions(
      await client.loadUserPositions(new PublicKey(wallet.walletAddress)),
    );
  }, [client, wallet]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions, trickReload]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
};

export default usePositions;
