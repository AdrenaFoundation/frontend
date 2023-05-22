import { BN } from '@project-serum/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey, RpcResponseAndContext, TokenAmount } from '@solana/web3.js';
import { useCallback, useEffect, useState } from 'react';

import { setWalletTokenBalancesAction } from '@/actions/walletBalancesActions';
import { AdrenaClient } from '@/AdrenaClient';
import { SOL_DECIMALS } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { TokenName } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

// TODO: Make it responsive to wallet token balance change
const useWatchWalletBalance = (
  client: AdrenaClient | null,
): {
  triggerWalletTokenBalancesReload: () => void;
} => {
  const [trickReload, triggerReload] = useState<number>(0);
  const dispatch = useDispatch();
  const wallet = useSelector((s) => s.walletState.wallet);

  const loadWalletBalances = useCallback(async () => {
    if (!wallet || !dispatch || !client) {
      return;
    }

    const connection = client.connection;

    if (!connection) {
      return;
    }

    console.log('Load user wallet token balances');

    const tokens = [...client.tokens, AdrenaClient.alpToken];

    const balances = await Promise.all(
      tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(
          new PublicKey(wallet.walletAddress),
          mint,
        );

        // in case of SOL, consider both SOL in the wallet + WSOL in ATA
        if (mint.equals(NATIVE_MINT)) {
          try {
            const [wsolBalance, solBalance] = await Promise.all([
              // Ignore ATA error if any, consider there are 0 WSOL
              new Promise((resolve) => {
                connection
                  .getTokenAccountBalance(ata)
                  .then(resolve)
                  .catch(() => resolve(null));
              }) as Promise<RpcResponseAndContext<TokenAmount> | null>,

              connection.getBalance(new PublicKey(wallet.walletAddress)),
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
          acc[tokens[index].name] = balance;

          return acc;
        }, {} as Record<TokenName, number | null>),
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, dispatch, client, client?.connection, trickReload]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);

  return {
    triggerWalletTokenBalancesReload: () => {
      triggerReload(trickReload + 1);
    },
  };
};

export default useWatchWalletBalance;
