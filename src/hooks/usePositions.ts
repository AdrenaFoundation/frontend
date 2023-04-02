import { useCallback, useEffect, useState } from 'react';
import { PositionExtended } from '@/types';
import { useSelector } from '@/store/store';
import { PublicKey } from '@solana/web3.js';
import { AdrenaClient } from '@/AdrenaClient';

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
