import { Connection, PublicKey } from '@solana/web3.js';
import { useCallback, useEffect } from 'react';

import { setWalletTokenBalancesAction } from '@/actions/walletBalancesActions';
import { AdrenaClient } from '@/AdrenaClient';
import { useDispatch, useSelector } from '@/store/store';
import { TokenName } from '@/types';
import { findATAAddressSync } from '@/utils';

// TODO: Make it responsive to wallet token balance change
const useWatchWalletBalance = (
  client: AdrenaClient | null,
  connection: Connection | null,
) => {
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);

  const loadWalletBalances = useCallback(async () => {
    if (!connection || !wallet || !dispatch || !client) return;

    console.log('Load balance changes');

    const balances = await Promise.all(
      client.tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(
          new PublicKey(wallet.walletAddress),
          mint,
        );

        try {
          const balance = await connection.getTokenAccountBalance(ata);
          return balance.value.uiAmount;
        } catch {
          // Cannot find ATA
          return null;
        }
      }),
    );

    dispatch(
      setWalletTokenBalancesAction(
        balances.reduce((acc, balance, index) => {
          acc[client.tokens[index].name] = balance;

          return acc;
        }, {} as Record<TokenName, number | null>),
      ),
    );
  }, [connection, wallet, dispatch, client]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);
};

export default useWatchWalletBalance;
