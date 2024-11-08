import { BN } from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import { useCallback, useEffect, useState } from 'react';

import { setWalletTokenBalancesAction } from '@/actions/walletBalancesActions';
import { SOL_DECIMALS } from '@/constant';
import { selectWalletPublicKey } from '@/selectors/wallet';
import { useDispatch, useSelector } from '@/store/store';
import { TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

// TODO: Make it responsive to wallet token balance change
// FIXME: This hook is used in multiple places throughout the app,
//        and isn't viable as a React (effect-based) hook,
//        as multiple concurrent fetches will happen, triggerred by
//        multiple consumers.
//        As instead, this function should be implemented as
//        Redux Thunk (async) action, populating a store.
//        This might a good opportunity to use RTK Query or equivalent, to
//        track the status of the query.
export default function useWatchWalletBalance() {
  const [trickReload, triggerReload] = useState<number>(0);
  const dispatch = useDispatch();

  const walletPublicKey = useSelector(selectWalletPublicKey);

  const loadWalletBalances = useCallback(async () => {
    const connection = window.adrena.client.connection;

    if (!walletPublicKey || !connection) {
      dispatch(setWalletTokenBalancesAction(null));
      return;
    }

    console.log('Load user wallet token balances');

    const tokens = [
      ...window.adrena.client.tokens,
      window.adrena.client.alpToken,
      window.adrena.client.adxToken,
      { mint: NATIVE_MINT, symbol: 'SOL' },
    ];

    const balances = await Promise.all(
      tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(walletPublicKey, mint);

        // in case of SOL, consider both SOL in the wallet + WSOL in ATA
        if (mint.equals(NATIVE_MINT)) {
          try {
            const [wsolBalance, solBalance] = await Promise.all([
              // Ignore ATA error if any, consider there are 0 WSOL
              connection.getTokenAccountBalance(ata).catch(() => null),
              connection.getBalance(walletPublicKey),
            ]);

            return (
              wsolBalance?.value.uiAmount ??
              0 + nativeToUi(new BN(solBalance), SOL_DECIMALS)
            );
          } catch {
            // Error loading info
            return null;
          }
        }

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
          acc[tokens[index].symbol] = balance;

          return acc;
        }, {} as Record<TokenSymbol, number | null>),
      ),
    );
    // extra `trickReload` dependency (temporary hack pending refactoring)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletPublicKey, trickReload, dispatch]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);

  const triggerWalletTokenBalancesReload = useCallback(() => {
    triggerReload((prevState) => prevState + 1);
  }, []);

  return triggerWalletTokenBalancesReload;
}
