import { BN } from '@coral-xyz/anchor';
import type { ThunkAction } from '@reduxjs/toolkit';
import { NATIVE_MINT } from '@solana/spl-token';

import { SOL_DECIMALS } from '@/constant';
import { selectWalletPublicKey } from '@/selectors/wallet';
import { type RootState, useSelector } from '@/store/store';
import type { TokenSymbol } from '@/types';
import { findATAAddressSync, nativeToUi } from '@/utils';

export const SET_TOKEN_BALANCES_ACTION_TYPE = 'setTokenBalances' as const;

export const setWalletTokenBalances = (
  balances: Record<TokenSymbol, number | null> | null,
) => ({
  type: SET_TOKEN_BALANCES_ACTION_TYPE,
  payload: balances,
});

export type WalletBalancesActions = ReturnType<typeof setWalletTokenBalances>;
