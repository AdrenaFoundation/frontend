import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionHistoryApi, PositionHistoryExtended } from '@/types';

export default function usePositionsHistory({
  walletAddress,
}: {
  walletAddress?: string;
}): {
  positionsHistory: PositionHistoryExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positionsHistory, setPositionsHistory] = useState<
    PositionHistoryExtended[] | null
  >(null);

  const loadPositionsHistory = useCallback(async () => {
    if (!wallet) {
      return setPositionsHistory(null);
    }

    async function fetchPositionsHistory(): Promise<
      PositionHistoryExtended[] | null
    > {
      if (!wallet) return null;

      const tokens = window.adrena.client.tokens;

      const response = await fetch(
        `https://datapi.adrena.xyz/position?user_wallet=${
          walletAddress ? walletAddress : wallet.walletAddress
        }&status=liquidate&status=close`,
      );

      if (!response.ok) {
        console.log('API response was not ok');
      }

      const apiBody = await response.json();

      const apiData: PositionHistoryApi[] | undefined = apiBody.data;

      if (typeof apiData === 'undefined' || (apiData && apiData.length === 0))
        return [];

      const enrichedDataWithTokens: PositionHistoryExtended[] = apiData
        .map((data) => {
          const token = tokens.find(
            (t) =>
              t.mint.toBase58() === data.token_account_mint &&
              t.symbol.toUpperCase() === data.symbol.toUpperCase(),
          );

          if (typeof token === 'undefined') {
            return null;
          }

          return {
            position_id: data.position_id,
            user_id: data.user_id,
            side: data.side,
            status: data.status,
            pubkey: new PublicKey(data.pubkey),
            entry_leverage: data.entry_leverage,
            entry_collateral_amount: data.entry_collateral_amount,
            size: data.size,
            entry_price: data.entry_price,
            exit_price: data.exit_price,
            entry_date: new Date(data.entry_date),
            exit_date: data.exit_date ? new Date(data.exit_date) : null,
            pnl: data.pnl,
            fees: data.fees,
            borrow_fees: data.borrow_fees,
            exit_fees: data.exit_fees,
            created_at: new Date(data.created_at),
            updated_at: data.updated_at ? new Date(data.updated_at) : null,
            profile: data.profile,
            symbol: data.symbol,
            token_account_mint: data.token_account_mint,
            token,
            last_tx: data.last_ix,
            final_collateral_amount: data.collateral_amount,
          } as PositionHistoryExtended;
        })
        .filter((data) => data !== null) as PositionHistoryExtended[];

      return enrichedDataWithTokens;
    }

    try {
      setPositionsHistory(await fetchPositionsHistory());
    } catch (e) {
      console.log('Error loading positions history', e, String(e));
      throw e;
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [wallet]);

  useEffect(() => {
    loadPositionsHistory();

    const interval = setInterval(() => {
      loadPositionsHistory();
    }, 10000);

    return () => {
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loadPositionsHistory,
    trickReload,
    window.adrena.client.readonlyConnection,
  ]);

  return {
    positionsHistory,
    triggerPositionsReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
