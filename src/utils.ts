import { BN } from "@project-serum/anchor";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_INFO_LIBRARY } from "./constant";
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
  return Number(nb.toFixed(precision)).toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });
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
  if (price < 0.00999999999999 && price > 0) {
    return `$${price}`;
  }

  if (price < 0) {
    return `-$${formatNumber(price * -1, 2)}`;
  }

  return `$${formatNumber(price, 2)}`;
}

export function nativeToUi(nb: BN, decimals: number): number {
  return nb.div(new BN(10 ** decimals)).toNumber();
}

export function uiToNative(nb: number, decimals: number): BN {
  return new BN(Math.floor(nb * 10 ** decimals));
}

export function getTokenNameByMint(mint: PublicKey): string {
  return TOKEN_INFO_LIBRARY[mint.toBase58()]?.name ?? "Unknown";
}
