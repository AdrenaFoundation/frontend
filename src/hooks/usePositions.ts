import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { AdrenaClient } from '@/AdrenaClient';
import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

// TODO: Reload periodically?
const usePositions = (client: AdrenaClient | null) => {
  const wallet = useSelector((s) => s.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const loadPositions = useCallback(async () => {
    if (!client || !wallet?.walletAddress) return;

    setPositions(
      await client.loadUserPositions(new PublicKey(wallet.walletAddress)),
    );
  }, [client, wallet]);

  useEffect(() => {
    loadPositions();
  }, [loadPositions]);

  return positions;
};

export default usePositions;
