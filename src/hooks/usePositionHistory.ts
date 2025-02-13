import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { PositionHistoryApi, PositionHistoryExtended } from '@/types';

export default function usePositionsHistory({
  walletAddress,
}: {
  walletAddress: string | null;
}): {
  positionsHistory: PositionHistoryExtended[] | null;
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const [positionsHistory, setPositionsHistory] = useState<
    PositionHistoryExtended[] | null
  >(null);

  const loadPositionsHistory = useCallback(
    async () => {
      if (!walletAddress) {
        return setPositionsHistory(null);
      }

      async function fetchPositionsHistory(): Promise<
        PositionHistoryExtended[] | null
      > {
        if (!walletAddress) return null;

        const tokens = window.adrena.client.tokens;

        const response = await fetch(
          `https://datapi.adrena.xyz/position?user_wallet=${
            walletAddress
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
              positionId: data.position_id,
              userId: data.user_id,
              side: data.side,
              status: data.status,
              pubkey: new PublicKey(data.pubkey),
              entryLeverage: data.entry_leverage,
              entryCollateralAmount: data.entry_collateral_amount,
              size: data.size,
              exitSize: data.exit_size,
              entryPrice: data.entry_price,
              exitPrice: data.exit_price,
              entryDate: new Date(data.entry_date),
              exitDate: data.exit_date ? new Date(data.exit_date) : null,
              pnl: data.pnl,
              fees: data.fees,
              borrowFees: data.borrow_fees,
              exitFees: data.exit_fees,
              createdAt: new Date(data.created_at),
              updatedAt: data.updated_at ? new Date(data.updated_at) : null,
              profile: data.profile,
              symbol: data.symbol,
              tokenAccountMint: data.token_account_mint,
              token,
              lastTx: data.last_ix,
              finalCollateralAmount: data.collateral_amount,
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
    [walletAddress],
  );

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
