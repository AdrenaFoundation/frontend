import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { ClaimHistoryApi, ClaimHistoryExtended } from '@/types';

export default function useClaimHistory(): {
  claimsHistory: ClaimHistoryExtended[] | null;
  triggerClaimsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [claimsHistory, setClaimsHistory] = useState<
    ClaimHistoryExtended[] | null
  >(null);

  const loadClaimsHistory = useCallback(async () => {
    if (!wallet) {
      return setClaimsHistory(null);
    }

    async function fetchClaimsHistory(): Promise<
      ClaimHistoryExtended[] | null
    > {
      if (!wallet) return null;

      const tokens = window.adrena.client.tokens;

      const response = await fetch(
        `https://datapi.adrena.xyz/claim?user_wallet=${wallet.walletAddress}`,
      );

      if (!response.ok) {
        console.log('API response was not ok');
      }

      const apiBody = await response.json();

      const apiData: ClaimHistoryApi | undefined = apiBody.data;

      if (typeof apiData === 'undefined') return [];

      const enrichedClaimsWithSymbol: ClaimHistoryExtended[] = apiData.claims
        .map((claim) => {
          const token = tokens.find(
            (t) => t.mint.toBase58() === claim.user_staking_mint,
          );

          if (typeof token === 'undefined') return null;

          return {
            claim_id: claim.claim_id,
            rewards_adx: claim.rewards_adx,
            rewards_usdc: claim.rewards_usdc,
            signature: claim.signature,
            transaction_date: new Date(claim.transaction_date),
            created_at: new Date(claim.created_at),
            user_staking_mint: claim.user_staking_mint,
            symbol: token.symbol,
          } as ClaimHistoryExtended;
        })
        .filter((claim) => claim !== null) as ClaimHistoryExtended[];

      return enrichedClaimsWithSymbol;
    }

    try {
      setClaimsHistory(await fetchClaimsHistory());
    } catch (e) {
      console.log('Error loading claims history', e, String(e));
      throw e;
    }
  }, [wallet]);

  useEffect(() => {
    loadClaimsHistory();

    const interval = setInterval(() => {
      loadClaimsHistory();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadClaimsHistory, trickReload, window.adrena.client.readonlyConnection]);

  return {
    claimsHistory,
    triggerClaimsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
