import { PublicKey } from "@solana/web3.js";
import { NonStableToken, StableToken, Token } from "./types";

// mainnet addresses (cannot find devnet addresses matching pyth devnet data feeds)
export const tokenAddresses = {
  USDC: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  // Wrap ETH (sollet)
  ETH: new PublicKey("2FPyTwcZLUg1MDrwsyoP4D6s1tM7hAkHYRjkNb5w6Pxk"),
  // Wrap BTC (sollet)
  BTC: new PublicKey("9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E"),
  // Wrap SOL
  SOL: new PublicKey("So11111111111111111111111111111111111111112"),
} as Record<Token, PublicKey>;

export const tokenList = ["USDC", "ETH", "BTC", "SOL"] as Token[];

export const stableTokenList = ["USDC"] as StableToken[];
export const nonStableTokenList = ["ETH", "BTC", "SOL"] as NonStableToken[];
