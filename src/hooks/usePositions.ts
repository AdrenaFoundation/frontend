import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';

// TODO: Reload periodically?
export default function usePositions(): {
  positions: PositionExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positions, setPositions] = useState<PositionExtended[] | null>(null);

  const loadPositions = useCallback(async () => {
    if (!wallet) {
      setPositions(null);
      return;
    }

    try {
      setPositions(
        await window.adrena.client.loadUserPositions(
          new PublicKey(wallet.walletAddress),
        ),
      );
    } catch (e) {
      console.log('Error loading positions', e, String(e));
      throw e;
    }
  }, [wallet]);

  useEffect(() => {
    loadPositions();

    const interval = setInterval(() => {
      loadPositions();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPositions, trickReload, window.adrena.client.readonlyConnection]);

  return {
    positions,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
