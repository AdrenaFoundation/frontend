import { Keypair, PublicKey } from "@solana/web3.js";

import awakeningBanner from "@/../../public/images/comp-banner.png";
import expanseBanner from "@/../public/images/expanse-banner.jpg";

import { ResolutionString } from "../public/charting_library/charting_library";
import {
  AdrenaEvent,
  AdxLockPeriod,
  AlpLockPeriod,
  ProfilePicture,
  SupportedCluster,
  UserProfileTitle,
  Wallpaper,
} from "./types";

export const RATE_DECIMALS = 9;
export const PRICE_DECIMALS = 10;
export const USD_DECIMALS = 6;
export const LP_DECIMALS = 6;
export const SOL_DECIMALS = 9;

// Wallet HxazXZVsy2Y63rUAVV9D6f3prWVh9M8qrZAGYMsx3GrV
export const ADRENA_TEAM_PROFILE = new PublicKey(
  "ABNW2bGJtbBbQaNjoHvrGFabgLGtkB4ohfs1vq1htNrY",
);

// In ms
export const MINIMUM_POSITION_OPEN_TIME = 10_000;

export const BPS = 10_000;

export const GENESIS_REWARD_ADX_PER_USDC = 5;

// FL4KKyvANrRFsm8kRRCoUW9QJY5LixttpdFxEBEm7ufW
export const devnetFaucetBankWallet = Keypair.fromSecretKey(
  Uint8Array.from([
    118, 180, 111, 61, 83, 103, 53, 249, 88, 225, 182, 193, 49, 141, 195, 60,
    151, 170, 18, 132, 150, 11, 207, 9, 30, 62, 137, 148, 34, 131, 227, 185,
    212, 229, 102, 216, 113, 142, 121, 185, 142, 246, 249, 201, 195, 31, 76,
    204, 63, 230, 217, 230, 172, 238, 66, 175, 83, 59, 93, 7, 120, 229, 42, 217,
  ]),
);

export const DEFAULT_PERPS_USER = Keypair.fromSecretKey(
  Uint8Array.from([
    130, 82, 70, 109, 220, 141, 128, 34, 238, 5, 80, 156, 116, 150, 24, 45, 33,
    132, 119, 244, 40, 40, 201, 182, 195, 179, 90, 172, 51, 27, 110, 208, 61,
    23, 43, 217, 131, 209, 127, 113, 93, 139, 35, 156, 34, 16, 94, 236, 175,
    232, 174, 79, 209, 223, 86, 131, 148, 188, 126, 217, 19, 248, 236, 107,
  ]),
);

export const ALP_STAKE_MULTIPLIERS: {
  [K in AlpLockPeriod]: { usdc: number; adx: number };
} = {
  0: {
    usdc: 0,
    adx: 0,
  },
  90: {
    usdc: 0.75,
    adx: 1.0,
  },
  180: {
    usdc: 1.5,
    adx: 1.75,
  },
  360: {
    usdc: 2.25,
    adx: 2.5,
  },
  540: {
    usdc: 3.0,
    adx: 3.25,
  },
} as const;

export const ALP_LOCK_PERIODS: AlpLockPeriod[] = [90, 180, 360, 540];

export const ADX_STAKE_MULTIPLIERS: {
  [K in AdxLockPeriod]: { usdc: number; adx: number; votes: number };
} = {
  0: {
    usdc: 1,
    adx: 0,
    votes: 1,
  },
  90: {
    usdc: 1.75,
    adx: 1.0,
    votes: 1.75,
  },
  180: {
    usdc: 2.5,
    adx: 1.75,
    votes: 2.5,
  },
  360: {
    usdc: 3.25,
    adx: 2.5,
    votes: 3.25,
  },
  540: {
    usdc: 4.0,
    adx: 3.25,
    votes: 4.0,
  },
} as const;

export const ADX_LOCK_PERIODS: AdxLockPeriod[] = [0, 90, 180, 360, 540];

export const ROUND_MIN_DURATION_SECONDS = 3_600 * 6;

export const SUPPORTED_RESOLUTIONS = [
  "1",
  "3",
  "5",
  "15",
  "30",
  "60",
  "120",
  "240",
  "1D",
] as ResolutionString[];

export const VEST_BUCKETS = [
  "Core Contributor",
  "Foundation",
  "Ecosystem",
] as const;

// if you add a new explorer, make sure to add the icon in settings component
export const SOLANA_EXPLORERS_OPTIONS = {
  "Solana Beach": {
    url: "https://solanabeach.io",
    // TODO: support devnet
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      cluster === "devnet"
        ? `https://explorer.solana.com/address/${address}?cluster=devnet` // redirection vers Solana Explorer pour devnet
        : `https://solanabeach.io/address/${address}`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solanabeach.io/transaction/${tx}${
        cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
  },
  Solscan: {
    url: "https://solscan.io",
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://solscan.io/account/${address}${
        cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solscan.io/tx/${tx}${
        cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
  },
  "Solana Explorer": {
    url: "https://explorer.solana.com",
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://explorer.solana.com/address/${address}${
        cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://explorer.solana.com/tx/${tx}${
        cluster === "devnet" ? "?cluster=devnet" : ""
      }`,
  },
  "Solana FM": {
    url: "https://solana.fm",
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://solana.fm/address/${address}${
        cluster === "devnet" ? "?cluster=devnet-solana" : ""
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solana.fm/tx/${tx}${
        cluster === "devnet" ? "?cluster=devnet-solana" : ""
      }`,
  },
} as const;

export const greenColor = "#07956be6";
export const redColor = "#F23645";
export const greyColor = "#78828e";
export const whiteColor = "#ffffff";
export const orangeColor = "#f77f00";
export const blueColor = "#3a86ff";
export const purpleColor = "#9333ea";

export const normalize = (
  value: number,
  minRange: number,
  maxRange: number,
  minValue: number,
  maxValue: number,
) => {
  if (maxValue === minValue) {
    return maxRange;
  }
  if (value < minValue || value > maxValue) {
    return 0;
  }
  return (
    minRange +
    ((value - minValue) / (maxValue - minValue)) * (maxRange - minRange)
  );
};

export const ADRENA_EVENTS: AdrenaEvent[] = [
  {
    label: "",
    time: "9/17",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Genesis phase: liquidity pool raises 10m to bootstrap trading.`,
    type: "Global",
  },
  {
    label: "",
    time: "9/25",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Trading goes live.`,
    type: "Global",
  },
  {
    label: "",
    time: "10/15",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase WBTC and JitoSOL max position size to $500k.`,
    type: "Trading",
  },
  {
    label: "",
    time: "10/30",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase WBTC and JitoSOL max position size to $750k.`,
    type: "Trading",
  },
  {
    label: "",
    time: "11/2",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Update pool target ratios to [15% USDC, 7% BONK, 54% jitoSOL, 24% WBTC].`,
    type: "Global",
  },
  {
    label: "",
    time: "11/2",
    color: "#ffffff40",
    labelPosition: "insideTopLeft",
    description: "BONK borrow rate increased from 0.008%/h to 0.016%/h.",
    type: "Trading",
  },
  {
    label: "",
    time: "11/11",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `"Pre-season: AWAKENING" trading competition starts.`,
    type: "Trading",
  },
  {
    label: "",
    time: "11/13",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase WBTC and jitoSOL max position size to $1m.`,
    type: "Trading",
  },
  {
    label: "",
    time: "11/20",
    color: "#ffffff40",
    labelPosition: "insideTopLeft",
    description: "BONK borrow rate increased from 0.016%/h to 0.032%/h.",
    type: "Trading",
  },
  {
    label: "",
    time: "11/23",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase WBTC and jitoSOL max position size to $2m.`,
    type: "Trading",
  },
  {
    label: "",
    time: "12/8",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase WBTC and jitoSOL max position size to $4m.`,
    type: "Trading",
  },
  {
    label: "",
    time: "12/10",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Increase liquidity pool soft cap to $30m.`,
    type: "Global",
  },
  {
    label: "",
    time: "12/23",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `"Pre-season: AWAKENING" trading competition ends. 876 participants fought for 2.27M ADX and 25k JTO rewards.`,
    type: "Global",
  },
  {
    label: "",
    time: "1/5",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Adrena is now supported by Solana AgentKit from SendAI.`,
    type: "Trading",
  },
  {
    label: "",
    time: "2/1",
    color: "#ffffff40",
    labelPosition: "insideTopRight",
    description: `Season 1: Expanse trading competition starts.`,
    type: "Global",
  },
];

export const TRADING_COMPETITION_SEASONS = {
  awakening: {
    img: awakeningBanner,
    title: "Awakening",
    subTitle: "pre-season",
    startDate: new Date("11/11/2024"),
    endDate: new Date("12/23/2024"),
    gradient: "bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]",
    primaryColor: "#E5B958",
    adxRewards: 2270000,
    jtoRewards: 25000,
    description: [
      "Welcome to Adrena's trading pre-season, anon! This six-week event is the introduction to our upcoming recurring trading seasons. From November 11th 12pm UTC to December 23rd 12pm UTC, traders will vie for PnL-based ranks in one of four volume-based divisions. Your total trading volume during the six-week event determines your division qualification. Check out the divisions below, continuously updated based on onchain events.",
      "Only positions open after the start date and closed before the end date qualify. Each weekly periods ends on Monday 12am UTC, except the last one ending at 12pm UTC. Volume is determined by Open/Increase and Close positions. It's accounted for when the position closes (close or liquidation).",
    ] as string[],
  },

  expanse: {
    img: expanseBanner,
    title: "The Expanse",
    subTitle: "new season",
    startDate: new Date("2025-01-31T23:59:59.999Z"),
    endDate: new Date("04/12/2025"),
    gradient: "bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]",
    primaryColor: "#FA6724",
    adxRewards: 5000000,
    jtoRewards: 50000,
    description: [
      `Adrena's first Trading Season: The Expanse. Get ready for Adrena's inaugural trading season, The Expanse. Engage in our division-based trading competition where you can:`,
      `- Farm Mutagen through daily and weekly quests. By accumulating Mutagen through leverage trading, you can improve your ranking in the upcoming season and secure a share in the upcoming $ADX Airdrop. Can only generate through trading activities.`,
      `- Earn Streaks, leverage daily Mutations, and unlock Exclusive Achievement Titles.`,
      `Important Dates and Details:`,
      `Mutagen Accrual starts on February 1st for the Season rankings. However, all trading activity prior to this date will retroactively provide you Mutagen that will solely count towards the airdrop. Eligible Trades: Only positions opened after February 1st and closed before the season's end will qualify for the season rankings. Weekly Periods: Each week ends at 12:00 AM UTC on Monday, with the exception of the final week, which concludes at 12:00 PM UTC.`,

      `Come get some.`,
    ] as string[],
  },
} as const;

export const QUESTS = {
  daily: {
    title: "Daily Quests",
    tasks: [
      {
        type: "checkbox",
        description: "Do 3 trades",
        reward: 0.25,
      },
      {
        type: "checkbox",
        description: "Open a short and long trade with at least 25x leverage",
        reward: 0.25,
      },
    ],
  },

  dailyMutations: {
    title: "Daily Mutations",
    description:
      "Each day, 2 mutations will be affecting the mutagen gained that day. The daily mutations are selected randomly.",
    tasks: [
      {
        type: "checkbox",
        title: "Frenzy",
        description: "Bonus mutagen per position",
        reward: 0.015,
      },
      {
        type: "checkbox",
        title: "Corruption",
        description: "Bonus mutagen per x50+ leveraged position",
        reward: 0.02,
      },
      {
        type: "checkbox",
        title: "Madness",
        description: "Bonus mutagen per x80+ leveraged position",
        reward: 0.03,
      },
      {
        type: "checkbox",
        title: "Celerity",
        description:
          "Bonus mutagen for a position that lived less than 5 minutes",
        reward: 0.015,
      },
      {
        type: "checkbox",
        title: "Tempo",
        description:
          "Bonus mutagen for a position that lived more than 30 minutes",
        reward: 0.001,
      },
      {
        type: "checkbox",
        title: "Growth",
        description: "Bonus mutagen per 0.1% positive trade performance",
        reward: "0.015 - 0.04",
      },
      {
        type: "checkbox",
        title: "Regeneration",
        description: "Bonus mutagen per 0.1% negative trade performance",
        reward: "0.001 - 0.015",
      },
      {
        type: "checkbox",
        title: "Telepathy",
        description: "Bonus mutagen per triggered SL/TP",
        reward: 0.01,
      },
    ],
  },

  weekly: {
    title: "Weekly Quests",
    tasks: [
      {
        type: "checkbox",
        description: "Have 50% win-rate on at least 50 trades",
        reward: 2,
        completed: false,
      },
      {
        type: "checkbox",
        description: "Reach 1M volume",
        reward: 2,
        completed: false,
      },
    ],
  },
  perpetual: {
    title: "Perpetual Quest (rewards on each trade)",
    description:
      "Each trade done during the season will score mutagen based on its performance/duration and is close size.",
    tasks: [
      {
        type: "checkbox",
        title: "Trade Performance (PnL / volume * 100)",
        description: "0.1% → 7.5%",
        reward: "0.01 - 0.3",
      },
      {
        type: "checkbox",
        title: "Trade Duration",
        description: "10s → 72h",
        reward: "0 - 0.05",
      },
      {
        type: "progressive",
        title: "Size Multiplier",
        description:
          "A multiplier is then applied to the mutagen score based on the trade size (non linear)",
        levels: [
          {
            description: "$10 → $1k",
            multiplier: "0.00025x – 0.05x",
            completed: false,
          },
          {
            description: "$1k → $5k",
            multiplier: "0.05x – 1x",
            completed: false,
          },
          {
            description: "$5k → $50k",
            multiplier: "1x – 5x",
            completed: false,
          },
          {
            description: "$50k → $100k",
            multiplier: "5x – 9x",
            completed: false,
          },
          {
            description: "$100k → $250k",
            multiplier: "9x – 17.5x",
            completed: false,
          },
          {
            description: "$250k → $500k",
            multiplier: "17.5x – 25x",
            completed: false,
          },
          {
            description: "$500k → $1M",
            multiplier: "25x – 30x",
            completed: false,
          },
          {
            description: "$1M → $4.5M",
            multiplier: "30x – 45x",
            completed: false,
          },
        ],
      },
    ],
  },
};

export const USER_PROFILE_TITLES = {
  0: "Nameless One",
} as Record<UserProfileTitle, string>;

export const PROFILE_PICTURES = {
  0: "/images/profile-picture-1.jpg",
  1: "/images/profile-picture-2.jpg",
  2: "/images/profile-picture-3.jpg",
  3: "/images/profile-picture-4.jpg",
  4: "/images/profile-picture-5.jpg",
} as Record<ProfilePicture, string>;

export const WALLPAPER = {
  0: "/images/wallpaper-1.jpg",
  1: "/images/wallpaper-2.jpg",
  2: "/images/wallpaper-3.jpg",
  3: "/images/wallpaper-4.jpg",
  4: "/images/wallpaper-5.jpg",
} as Record<Wallpaper, string>;
