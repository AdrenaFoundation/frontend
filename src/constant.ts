import { PublicKey } from "@solana/web3.js";
import { Adapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { NonStableToken, StableToken, Token, WalletAdapterName } from "./types";

// devnet addresses of spl-tokens created to represent real token
export const tokenAddresses = {
  USDC: new PublicKey("4ZY3ZH8bStniqdCZdR14xsWW6vrMsCJrusobTdy4JipC"),
  ETH: new PublicKey("3AHAG1ZSUnPz43XBFKRqnLwhdyz29WhHvYQgVrcheCwr"),
  BTC: new PublicKey("HRvpfs8bKiUbLzSgT4LmKKugafZ8ePi5Vq7icJBC9dnM"),
  SOL: new PublicKey("EtX1Uagb44Yp5p4hsqjwAwF3mKaQTMizCyvC1CsyHAQN"),
} as Record<Token, PublicKey>;

export const tokenList = ["USDC", "ETH", "BTC", "SOL"] as Token[];

export const stableTokenList = ["USDC"] as StableToken[];
export const nonStableTokenList = ["ETH", "BTC", "SOL"] as NonStableToken[];

export const walletAdapters: Record<WalletAdapterName, Adapter> = {
  phantom: new PhantomWalletAdapter(),
};
