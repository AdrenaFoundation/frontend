import { BN } from '@coral-xyz/anchor';
import type { ThunkAction } from '@reduxjs/toolkit';
import { NATIVE_MINT } from '@solana/spl-token';

import { SOL_DECIMALS } from '@/constant';
import { selectWalletPublicKey } from '@/selectors/wallet';
import type { RootState } from '@/store/store';
import type { TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

import { setWalletTokenBalances } from './walletBalances';

export const fetchWalletTokenBalances =
  (): ThunkAction<
    Promise<void>,
    RootState,
    never,
    ReturnType<typeof setWalletTokenBalances>
  > =>
  async (dispatch, getState) => {
    const connection = window.adrena.client.connection;
    const walletPublicKey = selectWalletPublicKey(getState());

    if (!walletPublicKey || !connection) {
      dispatch(setWalletTokenBalances(null));
      return;
    }

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
      setWalletTokenBalances(
        balances.reduce((acc, balance, index) => {
          acc[tokens[index].symbol] = balance;

          return acc;
        }, {} as Record<TokenSymbol, number | null>),
      ),
    );
  };
