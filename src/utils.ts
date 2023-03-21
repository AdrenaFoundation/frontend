import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

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
