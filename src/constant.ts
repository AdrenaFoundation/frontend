import { Adapter } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterName } from "./types";

export const TOKEN_INFO_LIBRARY = {
  "4ZY3ZH8bStniqdCZdR14xsWW6vrMsCJrusobTdy4JipC": {
    name: "USDC",
    image: "/images/usdc.svg",
  },
  "3AHAG1ZSUnPz43XBFKRqnLwhdyz29WhHvYQgVrcheCwr": {
    name: "ETH",
    image: "/images/eth.svg",
  },
  HRvpfs8bKiUbLzSgT4LmKKugafZ8ePi5Vq7icJBC9dnM: {
    name: "BTC",
    image: "/images/btc.svg",
  },
  EtX1Uagb44Yp5p4hsqjwAwF3mKaQTMizCyvC1CsyHAQN: {
    name: "SOL",
    image: "/images/sol.svg",
  },
} as Record<
  string,
  {
    name: string;
    image: string;
  }
>;

export const walletAdapters: Record<WalletAdapterName, Adapter> = {
  phantom: new PhantomWalletAdapter(),
};
