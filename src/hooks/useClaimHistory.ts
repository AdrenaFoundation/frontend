import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { ClaimHistoryApi, ClaimHistoryExtended } from '@/types';

export default function useClaimHistory(): {
  claimsHistoryAdx: ClaimHistoryExtended[] | null;
  claimsHistoryAlp: ClaimHistoryExtended[] | null;
  triggerClaimsReload: () => void;
} {
  const wallet = useSelector((s) => s.walletState.wallet);
  const [claimsHistoryAdx, setClaimsHistoryAdx] = useState<
    ClaimHistoryExtended[] | null
  >(null);
  const [claimsHistoryAlp, setClaimsHistoryAlp] = useState<
    ClaimHistoryExtended[] | null
  >(null);

  async function fetchClaimsHistory(): Promise<ClaimHistoryExtended[] | null> {
    if (!wallet) return null;

    const response = await fetch(
      `https://datapi.adrena.xyz/claim?user_wallet=${wallet.walletAddress}&start_date=2024-09-01T00:00:00Z`,
    );

    if (!response.ok) {
      console.log('API response was not ok');
    }

    const apiBody = await response.json();

    const apiData: ClaimHistoryApi | undefined = apiBody.data;

    if (typeof apiData === 'undefined') {
      console.log('apiData is undefined');
      return [];
    }

    const enrichedClaimsWithSymbol: ClaimHistoryExtended[] = apiData.claims
      .map((claim) => {
        const symbol =
          claim.mint === window.adrena.client.lmTokenMint.toBase58()
            ? 'ADX'
            : 'ALP';

        return {
          claim_id: claim.claim_id,
          rewards_adx: claim.rewards_adx,
          rewards_adx_genesis: claim.rewards_adx_genesis ?? 0,
          rewards_usdc: claim.rewards_usdc,
          signature: claim.signature,
          transaction_date: new Date(claim.transaction_date),
          created_at: new Date(claim.created_at),
          stake_mint: claim.mint,
          symbol: symbol,
          source: claim.source,
        } as ClaimHistoryExtended;
      })
      .filter((claim) => claim !== null)
      .reverse() as ClaimHistoryExtended[];

    return enrichedClaimsWithSymbol;
  }

  const loadClaimsHistory = useCallback(async () => {
    if (!wallet) {
      setClaimsHistoryAdx(null);
      setClaimsHistoryAlp(null);
      return;
    }

    try {
      const claimsHistory = await fetchClaimsHistory();

      if (claimsHistory === null) {
        setClaimsHistoryAdx(null);
        setClaimsHistoryAlp(null);
        return;
      }

      setClaimsHistoryAdx(claimsHistory.filter((c) => c.symbol === 'ADX'));
      setClaimsHistoryAlp(claimsHistory.filter((c) => c.symbol === 'ALP'));
    } catch (e) {
      console.log('Error loading claims history', e, String(e));
      throw e;
    }
  }, [wallet]);

  useEffect(() => {
    loadClaimsHistory();
  }, [loadClaimsHistory]);

  return {
    claimsHistoryAdx,
    claimsHistoryAlp,
    triggerClaimsReload: fetchClaimsHistory,
  };
}
