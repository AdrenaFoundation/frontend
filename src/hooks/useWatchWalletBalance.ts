import { BN } from '@coral-xyz/anchor';
import { NATIVE_MINT } from '@solana/spl-token';
import { PublicKey, RpcResponseAndContext, TokenAmount } from '@solana/web3.js';
import { useWeb3ModalProvider } from '@web3modal/solana/react';
import { useCallback, useEffect, useState } from 'react';

import { setWalletTokenBalancesAction } from '@/actions/walletBalancesActions';
import { SOL_DECIMALS } from '@/constant';
import { useDispatch } from '@/store/store';
import { TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

// TODO: Make it responsive to wallet token balance change
export default function useWatchWalletBalance(): {
  triggerWalletTokenBalancesReload: () => void;
} {
  const [trickReload, triggerReload] = useState<number>(0);
  const dispatch = useDispatch();
  const { walletProvider } = useWeb3ModalProvider();

  const loadWalletBalances = useCallback(async () => {
    const connection = window.adrena.client.connection;

    if (!walletProvider || !dispatch || !connection) {
      dispatch(setWalletTokenBalancesAction(null));
      return;
    }

    console.log('Load user wallet token balances');

    const tokens = [
      ...window.adrena.client.tokens,
      window.adrena.client.alpToken,
      window.adrena.client.adxToken,
    ];

    const balances = await Promise.all(
      tokens.map(async ({ mint }) => {
        const ata = findATAAddressSync(
          new PublicKey(walletProvider.publicKey),
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

              connection.getBalance(new PublicKey(walletProvider.publicKey)),
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletProvider, dispatch, trickReload, window.adrena.client.connection]);

  useEffect(() => {
    loadWalletBalances();
  }, [loadWalletBalances]);

  return {
    triggerWalletTokenBalancesReload: () => {
      triggerReload(trickReload + 1);
    },
  };
}
