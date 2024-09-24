import { PublicKey } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { useSelector } from '@/store/store';
import { PositionHistoryApi, PositionHistoryExtended } from '@/types';

export default function usePositionsHistory(): {
  positionsHistory: PositionHistoryExtended[];
  triggerPositionsReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const wallet = useSelector((s) => s.walletState.wallet);
  const [positionsHistory, setPositionsHistory] = useState<
    PositionHistoryExtended[]
  >([]);

  async function fetchPositionsHistory(): Promise<PositionHistoryExtended[]> {
    const tokens = await window.adrena.client.tokens;

    const response = await fetch(
      'https://datapi.adrena.xyz/position?user_wallet=' + wallet?.walletAddress,
    );

    if (!response.ok) {
      console.log('API response was not ok');
    }
    const apiBody = await response.json();
    const apiDataTmp: PositionHistoryApi[] = apiBody.data;

    const apiData = [
      {
        position_id: 1,
        user_id: 123,
        custody_id: 456,
        side: 'long',
        status: 'open',
        pubkey: '3iGzr6qvQR5fPJWBMdfB9uX8YES3drvyPaS3GtLn7n4q',
        entry_price: 100.5,
        exit_price: null,
        pnl: 10.5,
        entry_leverage: 2,
        entry_collateral_amount: 500,
        size: 1000,
        entry_date: new Date(new Date().setHours(0)).toISOString(),
        exit_date: new Date().toISOString(),
        fees: 1.5,
        borrow_fees: 0.5,
        exit_fees: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: 'FakeProfile1',
        symbol: 'BONK',
        token_account_mint: '2eU7sUxhpQuBaUrjd6oPTzoFZNPEaawrAka4zqowMzbJ',
      },
      {
        position_id: 2,
        user_id: 123,
        custody_id: 789,
        side: 'short',
        status: 'closed',
        pubkey: '3iGzr6qvQR5fPJWBMdfB9uX8YES3drvyPaS3GtLn7n4q',
        entry_price: 200.5,
        exit_price: 180.5,
        pnl: -20,
        entry_leverage: 3,
        entry_collateral_amount: 500,
        size: 1500,
        entry_date: new Date(new Date().setHours(19)).toISOString(),
        exit_date: new Date().toISOString(),
        fees: 2.5,
        borrow_fees: 1,
        exit_fees: 0.5,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        profile: 'FakeProfile2',
        symbol: 'BONK',
        token_account_mint: '2eU7sUxhpQuBaUrjd6oPTzoFZNPEaawrAka4zqowMzbJ',
      },
    ];
    if (typeof apiData === 'undefined' || (apiData && apiData.length === 0))
      return [];
    const enrichedDataWithTokens: PositionHistoryExtended[] = apiData
      .map((data) => {
        const token = tokens.find(
          (t) =>
            t.mint.toBase58() === data.token_account_mint &&
            t.symbol === data.symbol,
        );

        if (typeof token === 'undefined') return null;

        return {
          position_id: data.position_id,
          user_id: data.user_id,
          custody_id: data.custody_id,
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
        } as PositionHistoryExtended;
      })
      .filter((data) => data !== null) as PositionHistoryExtended[];

    return enrichedDataWithTokens.sort((a, b) => {
      return a.position_id - b.position_id;
    });
  }

  const loadPositionsHistory = useCallback(async () => {
    if (!wallet) {
      setPositionsHistory([]);
      return;
    }

    try {
      setPositionsHistory(await fetchPositionsHistory());
    } catch (e) {
      console.log('Error loading positions history', e, String(e));
      throw e;
    }
  }, [wallet]);

  useEffect(() => {
    loadPositionsHistory();

    const interval = setInterval(() => {
      loadPositionsHistory();
    }, 30000);

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
