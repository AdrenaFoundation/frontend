import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionExtended } from '@/types';
import { AdrenaClient } from '@/AdrenaClient';

export default function useSablierDanglingThreads(
  positions: PositionExtended[] | null,
): PublicKey[] | null {
  const wallet = useSelector((s) => s.walletState.wallet);

  const [danglingThreads, setDanglingThreads] = useState<PublicKey[] | null>(
    null,
  );

  const fetchDanglingThreads = useCallback(async () => {
    if (!wallet || positions === null) return;

    const notDanglingSablierThreads = positions.reduce((list, position) => {
      return [
        ...list,

        window.adrena.client.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.takeProfitThreadId,
          user: position.owner,
        }).publicKey,

        window.adrena.client.getTakeProfitOrStopLossThreadAddress({
          authority: AdrenaClient.transferAuthorityAddress,
          threadId: position.nativeObject.stopLossThreadId,
          user: position.owner,
        }).publicKey,
      ];
    }, [] as PublicKey[]);

    // Load dangling threads which are SL/TP threads that have been executed
    const threads =
      await window.adrena.sablierClient.loadSablierDanglingThreads(
        new PublicKey(wallet.walletAddress),
      );

    if (!threads) return setDanglingThreads([]);

    setDanglingThreads(
      threads.filter((x) => notDanglingSablierThreads.includes(x)),
    );
  }, [wallet, positions]);

  useEffect(() => {
    fetchDanglingThreads();

    const intervalId = setInterval(() => {
      fetchDanglingThreads();
    }, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, [fetchDanglingThreads]);

  return danglingThreads;
}
