import { BN } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { ADRENA_PROGRAM_ID } from "./hooks/useAdrenaProgram";
import { MAIN_POOL } from "./hooks/useMainPool";
import { Custody } from "./types";

export const DISPLAY_NUMBER_PRECISION = 6;
export const INPUT_PRECISION = 8;

export function findATAAddressSync(
  wallet: PublicKey,
  mint: PublicKey
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0];
}

export function formatNumber(nb: number, precision: number): string {
  return Number(nb.toFixed(precision)).toLocaleString();
}

export function getCustodyLiquidity(
  custody: Custody,
  tokenCurrentPrice: number
): number {
  return (
    (tokenCurrentPrice *
      Number(custody.assets.owned.sub(custody.assets.locked))) /
    10 ** custody.decimals
  );
}

export function formatPriceInfo(price: number) {
  // If the price is very low, display it as it is, to not display $0
  if (price < 0.00999999999999) {
    return `$${price}`;
  }

  return `$${formatNumber(price, 2)}`;
}

export function findCustodyAddress(mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("custody"), MAIN_POOL.toBuffer(), mint.toBuffer()],
    ADRENA_PROGRAM_ID
  )[0];
}

export function nativeToUi(nb: BN, decimals: number): number {
  return nb / 10 ** decimals;
}

export function uiToNative(nb: number, decimals: number): BN {
  const exp = new BN(10 ** decimals);

  return new BN(nb).mul(exp);
}
