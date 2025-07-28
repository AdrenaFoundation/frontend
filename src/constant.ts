import { Keypair, PublicKey } from '@solana/web3.js';

import { ResolutionString } from '../public/charting_library/charting_library';
import {
  AchievementInfo,
  AdrenaEvent,
  AdxLockPeriod,
  AlpLockPeriod,
  SupportedCluster,
  Token,
} from './types';

export const RATE_DECIMALS = 9;
export const PRICE_DECIMALS = 10;
export const USD_DECIMALS = 6;
export const LP_DECIMALS = 6;
export const SOL_DECIMALS = 9;

export const ADRENA_TEAM_WALLET = new PublicKey(
  'HxazXZVsy2Y63rUAVV9D6f3prWVh9M8qrZAGYMsx3GrV',
);

export const ADRENA_TEAM_PROFILE = new PublicKey(
  'ABNW2bGJtbBbQaNjoHvrGFabgLGtkB4ohfs1vq1htNrY',
);

// In ms
export const MINIMUM_POSITION_OPEN_TIME = 20_000;

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
  '1',
  '3',
  '5',
  '15',
  '30',
  '60',
  '120',
  '240',
  '1D',
] as ResolutionString[];

export const VEST_BUCKETS = [
  'Core Contributor',
  'Foundation',
  'Ecosystem',
] as const;

// if you add a new explorer, make sure to add the icon in settings component
export const SOLANA_EXPLORERS_OPTIONS = {
  'Solana Beach': {
    url: 'https://solanabeach.io',
    // TODO: support devnet
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      cluster === 'devnet'
        ? `https://explorer.solana.com/address/${address}?cluster=devnet` // redirection vers Solana Explorer pour devnet
        : `https://solanabeach.io/address/${address}`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solanabeach.io/transaction/${tx}${
        cluster === 'devnet' ? '?cluster=devnet' : ''
      }`,
  },
  Solscan: {
    url: 'https://solscan.io',
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://solscan.io/account/${address}${
        cluster === 'devnet' ? '?cluster=devnet' : ''
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solscan.io/tx/${tx}${
        cluster === 'devnet' ? '?cluster=devnet' : ''
      }`,
  },
  'Solana Explorer': {
    url: 'https://explorer.solana.com',
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://explorer.solana.com/address/${address}${
        cluster === 'devnet' ? '?cluster=devnet' : ''
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://explorer.solana.com/tx/${tx}${
        cluster === 'devnet' ? '?cluster=devnet' : ''
      }`,
  },
  'Solana FM': {
    url: 'https://solana.fm',
    getWalletAddressUrl: (address: PublicKey, cluster: SupportedCluster) =>
      `https://solana.fm/address/${address}${
        cluster === 'devnet' ? '?cluster=devnet-solana' : ''
      }`,
    getTxUrl: (tx: string, cluster: SupportedCluster) =>
      `https://solana.fm/tx/${tx}${
        cluster === 'devnet' ? '?cluster=devnet-solana' : ''
      }`,
  },
} as const;

export const greenColor = '#07956be6';
export const redColor = '#F23645';
export const greyColor = '#78828e';
export const whiteColor = '#ffffff';
export const orangeColor = '#f77f00';
export const blueColor = '#3a86ff';
export const purpleColor = '#9333ea';

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
    label: '',
    time: '9/17',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Genesis phase: liquidity pool raises 10m to bootstrap trading.`,
    type: 'Global',
  },
  {
    label: '',
    time: '9/25',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Trading goes live.`,
    type: 'Global',
  },
  {
    label: '',
    time: '10/15',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase WBTC and JitoSOL max position size to $500k.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '10/30',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase WBTC and JitoSOL max position size to $750k.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '11/2',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Update pool target ratios to [15% USDC, 7% BONK, 54% jitoSOL, 24% WBTC].`,
    type: 'Global',
  },
  {
    label: '',
    time: '11/2',
    color: '#ffffff40',
    labelPosition: 'insideTopLeft',
    description: 'BONK borrow rate increased from 0.008%/h to 0.016%/h',
    type: 'Trading',
  },
  {
    label: '',
    time: '11/11',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `"Pre-season: AWAKENING" trading competition starts.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '11/13',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase WBTC and jitoSOL max position size to $1m.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '11/20',
    color: '#ffffff40',
    labelPosition: 'insideTopLeft',
    description: 'BONK borrow rate increased from 0.016%/h to 0.032%/h',
    type: 'Trading',
  },
  {
    label: '',
    time: '11/23',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase WBTC and jitoSOL max position size to $2m.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '12/8',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase WBTC and jitoSOL max position size to $4m.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '12/10',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Increase liquidity pool soft cap to $30m.`,
    type: 'Global',
  },
  {
    label: '',
    time: '12/23',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `"Pre-season: AWAKENING" trading competition ends. 876 participants fought for 2.27M ADX and 25k JTO rewards.`,
    type: 'Global',
  },
  {
    label: '',
    time: '1/5',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Adrena is now supported by Solana AgentKit from SendAI.`,
    type: 'Trading',
  },
  {
    label: '',
    time: '2/1',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Season 1: Expanse trading competition starts.`,
    type: 'Global',
  },
  {
    label: '',
    time: '3/6',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Referral Fees are now live.`,
    type: 'Global',
  },
  {
    label: '',
    time: '3/19',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `ALP becomes liquid.`,
    type: 'Global',
  },
  {
    label: '',
    time: '4/11',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Season 1: Expanse trading competition ends.`,
    type: 'Global',
  },
  {
    label: '',
    time: '4/26',
    color: '#ffffff40',
    labelPosition: 'insideTopRight',
    description: `Season 2: Factions trading competition starts.`,
    type: 'Global',
  },
];

export const TRADING_COMPETITION_SEASONS = {
  awakening: {
    img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/awakening/comp-banner-I4GlDkseidl72PgFvy8rbqb4Ktxr9s.jpg',
    title: 'Awakening',
    subTitle: 'pre-season',
    startDate: new Date('11/11/2024'),
    endDate: new Date('12/23/2024'),
    gradient: 'bg-[linear-gradient(110deg,#E5B958,45%,#fff,55%,#E5B958)]',
    primaryColor: '#E5B958',
    adxRewards: 2270000,
    jtoRewards: 25000,
    bonkRewards: 0,
    description: [
      "Welcome to Adrena's trading pre-season, anon! This six-week event is the introduction to our upcoming recurring trading seasons. From November 11th 12pm UTC to December 23rd 12pm UTC, traders will vie for PnL-based ranks in one of four volume-based divisions. Your total trading volume during the six-week event determines your division qualification. Check out the divisions below, continuously updated based on onchain events.",
      "Only positions open after the start date and closed before the end date qualify. Each weekly periods ends on Monday 12am UTC, except the last one ending at 12pm UTC. Volume is determined by Open/Increase and Close positions. It's accounted for when the position closes (close or liquidation).",
    ] as string[],
    bannerClassName: 'h-[30em] justify-center',
  },

  expanse: {
    img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/expanse/expanse-banner-M4jVXVtzATa0P36KUpVvc1hXFNkznk.jpg',
    title: 'The Expanse',
    subTitle: 'new season',
    startDate: new Date('2025-01-31T23:59:59.999Z'),
    endDate: new Date('2025-04-11T23:59:59.999Z'),
    gradient: 'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
    primaryColor: '#FA6724',
    adxRewards: 5000000,
    jtoRewards: 50000,
    bonkRewards: 0,
    description: [
      `Adrena's first Trading Season: The Expanse. Get ready for Adrena's inaugural trading season, The Expanse. Engage in our division-based trading competition where you can:`,
      `- Farm Mutagen through daily and weekly quests. By accumulating Mutagen through leverage trading, you can improve your ranking in the upcoming season and secure a share in the upcoming $ADX Airdrop. Can only generate through trading activities.`,
      `- Earn Streaks, leverage daily Mutations, and unlock Exclusive Achievement Titles.`,
      `Important Dates and Details:`,
      `Mutagen Accrual starts on February 1st for the Season rankings. However, all trading activity prior to this date will retroactively provide you Mutagen that will solely count towards the airdrop. Eligible Trades: Only positions opened after February 1st and closed before the season's end will qualify for the season rankings. Weekly Periods: Each week ends at 12:00 AM UTC on Monday, with the exception of the final week, which concludes at 12:00 PM UTC.`,

      `Come get some.`,
    ] as string[],
    bannerClassName: 'h-[30em] justify-center',
  },

  factions: {
    img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/factions/factions-banner-OKwsUEBqusOest7hhIPaKsklmSlNdh.jpg',
    title: 'Factions',
    subTitle: 'Season 2',
    startDate: new Date('2025-04-25T23:59:59.999Z'),
    endDate: new Date('2025-07-04T23:59:59.999Z'),
    gradient: '', // Not used. Specific if in CompetitionBanner component
    primaryColor: '#247CFA',
    adxRewards: 12000000,
    jtoRewards: 25000,
    bonkRewards: 4200000000,
    description: [``] as string[],
    bannerClassName: 'h-[32em] pt-20',
  },

  interseason3: {
    img: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/summerEvent/summer-event.jpg',
    title: 'Summer Event',
    subTitle: 'Interseason',
    startDate: new Date('2025-07-04T23:59:59.999Z'),
    endDate: new Date('2025-09-05T23:59:59.999Z'),
    gradient: 'bg-[linear-gradient(110deg,#FA6724,45%,#FAD524,55%,#FA6724)]',
    primaryColor: '#247CFA',
    adxRewards: 0,
    jtoRewards: 21200,
    bonkRewards: 3160000000,
    description: [`Welcome to the Summer Event!`] as string[],
    bannerClassName: 'h-[32em] pt-20',
  },
} as const;

export const QUESTS = {
  daily: {
    title: 'Daily Quests',
    tasks: [
      {
        type: 'checkbox',
        description: 'Do 3 trades',
        reward: 0.25,
      },
      {
        type: 'checkbox',
        description: 'Open a short and long trade with at least 25x leverage',
        reward: 0.25,
      },
    ],
  },

  dailyMutations: {
    title: 'Daily Mutations',
    description:
      'Each day, 2 mutations will be affecting the mutagen gained that day. The daily mutations are selected randomly.',
    tasks: [
      {
        type: 'checkbox',
        title: 'Frenzy',
        description: 'Bonus mutagen per position',
        reward: 0.015,
      },
      {
        type: 'checkbox',
        title: 'Corruption',
        description: 'Bonus mutagen per x50+ leveraged position',
        reward: 0.02,
      },
      {
        type: 'checkbox',
        title: 'Madness',
        description: 'Bonus mutagen per x80+ leveraged position',
        reward: 0.03,
      },
      {
        type: 'checkbox',
        title: 'Celerity',
        description:
          'Bonus mutagen for a position that lived less than 5 minutes',
        reward: 0.015,
      },
      {
        type: 'checkbox',
        title: 'Tempo',
        description:
          'Bonus mutagen for a position that lived more than 30 minutes',
        reward: 0.001,
      },
      {
        type: 'checkbox',
        title: 'Growth',
        description: 'Bonus mutagen per 0.1% positive trade performance',
        reward: '0.015 - 0.04',
      },
      {
        type: 'checkbox',
        title: 'Regeneration',
        description: 'Bonus mutagen per 0.1% negative trade performance',
        reward: '0.001 - 0.015',
      },
      {
        type: 'checkbox',
        title: 'Telepathy',
        description: 'Bonus mutagen per triggered SL/TP',
        reward: 0.01,
      },
    ],
  },

  weekly: {
    title: 'Weekly Quests',
    tasks: [
      {
        type: 'checkbox',
        description: 'Have 50% win-rate on at least 50 trades',
        reward: 2,
        completed: false,
      },
      {
        type: 'checkbox',
        description: 'Reach 1M volume',
        reward: 2,
        completed: false,
      },
    ],
  },
  perpetual: {
    title: 'Perpetual Quest (rewards on each trade)',
    description:
      'Each trade done during the season will score mutagen based on its performance/duration and is close size.',
    tasks: [
      {
        type: 'checkbox',
        title: 'Trade Performance (PnL / volume * 100)',
        description: '0.1% → 7.5%',
        reward: '0.01 - 0.3',
      },
      {
        type: 'checkbox',
        title: 'Trade Duration',
        description: '10s → 72h',
        reward: '0 - 0.05',
      },
      {
        type: 'progressive',
        title: 'Size Multiplier',
        description:
          'A multiplier is then applied to the mutagen score based on the trade size (non linear)',
        levels: [
          {
            description: '$10 → $1k',
            multiplier: '0.00025x – 0.05x',
            completed: false,
          },
          {
            description: '$1k → $5k',
            multiplier: '0.05x – 1x',
            completed: false,
          },
          {
            description: '$5k → $50k',
            multiplier: '1x – 5x',
            completed: false,
          },
          {
            description: '$50k → $100k',
            multiplier: '5x – 9x',
            completed: false,
          },
          {
            description: '$100k → $250k',
            multiplier: '9x – 17.5x',
            completed: false,
          },
          {
            description: '$250k → $500k',
            multiplier: '17.5x – 25x',
            completed: false,
          },
          {
            description: '$500k → $1M',
            multiplier: '25x – 30x',
            completed: false,
          },
          {
            description: '$1M → $4.5M',
            multiplier: '30x – 45x',
            completed: false,
          },
        ],
      },
    ],
  },
};

export const TEAMS_MAPPING = {
  DEFAULT: 0,
  BONK: 1,
  JITO: 2,
} as const;

export const TEAMS = {
  0: 'Default',
  1: 'Bonk',
  2: 'Jito',
} as const;

export const CONTINENTS = {
  0: 'Default',
  1: 'Europe',
  2: 'North America',
  3: 'South America',
  4: 'Asia',
  5: 'Africa',
  6: 'Australia',
  7: 'Antarctica',
} as const;

export const USER_PROFILE_TITLES = {
  0: 'Nameless One',
  1: 'Golden Hands',
  2: 'Diamond Hands',
  3: 'Pre-season Winner',
  4: 'Pre-season Challenger',
  5: 'Pre-season Contender',
  6: 'Season 1 Winner',
  7: 'Season 1 Challenger',
  8: 'Season 1 Contender',
  9: 'Trader',
  10: 'Emerging Trader',
  11: 'Top Tier',
  12: 'Volume King',
  13: 'Future McDonalds Employee',
  14: 'Highly Unprofitable Trader',
  15: 'Severely Wounded',
  16: "Daddy's Money",
  17: 'All In, All Gone',
  18: 'Highly Profitable Trader',
  19: 'Certified Money Printer',
  20: 'Whale Among Men',
  21: 'Apex Trader',
  22: 'Unstoppable',
  23: 'Free Kebab',
  24: 'Passive Income',
  25: 'Adrena Stakeholder',
  26: 'Board Member',
  27: 'Liquidity King',
  28: 'Bad Luck Brian',
  29: 'Le Cramer',
  30: 'The Chameleon',
  31: 'Soldier',
  32: 'Sergeant',
  33: 'Lieutenant',
  34: 'General',
  35: 'Bonk Operative',
  36: 'Jito Juggernaut',
  37: 'Season 2 Champion',
  38: 'Season 2 Destroyer',
  39: 'Crown-Sniffer',
  40: 'Certified Menace',
  41: 'Tomb Raider',
  42: 'Saboteur',
  43: 'Traitor',
  44: 'Opportunist',
  45: 'Relentless',
  46: 'Wet and Losing',
  47: 'Underwater',
  48: 'Boss Muncher',
  49: 'Scratcher',
  50: 'Paper Beat Rock',
  51: 'The Painmaker',
  52: 'Chicken Wings',
  53: 'Nice Guy',
} as const;

export const PROFILE_PICTURES = {
  0: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/0-profile-picture-Sai0uwLWpbLfMDXL48PnGdsGtGvsfo.jpg',
  1: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/1-profile-picture-rAZfGdMaFgg11X4iZdj0tpHbtvnUEB.jpg',
  2: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/2-profile-picture-vdbh5zbkcnWxffdnHFq4tllswWxv03.jpg',
  3: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/3-profile-picture-MWX88IAuSguCjy9SiDUijMmdc5D9mB.jpg',
  4: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/4-profile-picture-tVeXt2txKPv5v3mhGEuFj6pe584En2.jpg',
  5: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/5-pfp-thats-hot-8gpzLrdjEhrsLMMMhAETXEJLL6DTIz.jpg',
  6: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/6-pfp-moby-dick-5RAmIKXc0j8LmZ0QJIelgph4j3QEJF.png',
  7: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/7-pfp-strike-z7GdI3G1Dorp2hcnWqG2CcRho2yeSF.jpg',
  8: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/8-pfp-prison-Qnl20EbJ5KsfKMKRFxpL6GcILngDbm.jpg',
  9: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/9-pfp-call-of-muty-YSKShonOkwWMmVtc8WMQDQzFrcpFdH.jpg',
  10: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/10-pfp-sarge-D4KUMMVjA0ShdhDXFxaHvnxOevEeDS.jpg',
  11: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/11-pfp-lieutenant-hOHSwWm4kXDiE46hVnl2U0LgnvOt6E.jpg',
  12: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/12-pfp-general-Y0fqtroRsXFdtt43J4Mzg1eZXaIjiR.jpg',
  13: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/13-pfp-bonk-team-VkmuMYSqzAzQcsxZ9yGFEhPqQ2iFdm.jpg',
  14: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/14-pfp-jito-team-MLizGfqXvQ9owRNAoCj5HIk8SAjh3u.jpg',
  15: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/15-pfp-king-of-the-hill-9OcD3XyW7X86mFqnxc3ECJCTxo8N1i.jpg',
  16: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/16-pfp-pressing-the-attack-9YBUNShqXt17ViAZlvzRJjj26peFqM.jpg',
  17: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/17-pfp-sabotage-0CdMJvJqDhoMTPBVVB6OJ4uxxKmA1D.jpg',
  18: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/18-pfp-traitor-iifgsy1wCbCinnbESV9zZH011C5ywJ.jpg',
  19: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/19-pfp-stop-U58xEO7YQodQGfdSXjAsdMEimsqAi0.jpg',
  20: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/20-pfp-show%27em-wGfr4bpVRGgB2cZmpagViWyrkdHHa8.jpg',
  21: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/21-pfp-painmaker-THdmLYLP3SmLzvEkXuo67AQ4AfJSjM.jpg',
  22: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/22-pfp-nice-guy-nLGtHD96mHRp51JnfiIxsDebeeKrem.jpg',
  23: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/23-pfp-golden-hands-occI1rGgXsUlxrm3YKnsjoDiV626LV.jpg',
  24: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/profile-pictures/24-pfp-diamond-hands-AureSewhVLVFQEUfJpHQiOb1tjcGcp.jpg',
} as const;

export const WALLPAPERS = {
  0: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/0-wallpaper-2yVhJbhqwV4UqFJH1bbBk1jjvCpInf.jpg',
  1: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/1-wallpaper-YkO2m6dNQFZI3vk5K00D29ZgTpGPtl.jpg',
  2: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/2-wallpaper-8YeEpx3met1eoovyXf764Rq8Emvw5N.jpg',
  3: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/3-wallpaper-PoG6eJjrnp72oDGb3uTzytN01Lzsau.jpg',
  4: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/4-wallpaper-IlGz8KZHUzxDbooXzxuBVAXHLwpgST.jpg',
  5: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/5-wallpaper-bank-i0YXhqCzvVOTWVMxbCjApsULLbcEWg.jpg',
  6: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/6-wallpaper-beast-k3nXlpiTRf30vDAZHRTRL9LNshF16W.jpg',
  7: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/7-wallpaper-soldier-JJ3e6nbhAKXAzQ62FvfEcH1JhI5ysC.jpg',
  8: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/8-wallpaper-seargent-47gcP6lHwPu1ZiIEI2U0XY2Q9a1Cq8.jpg',
  9: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/9-wallpaper-lieutenant-LcN0ZPAts1ZLNVPpKTuMrIq15QIciy.jpg',
  10: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/10-wallpaper-general-Lc73heKd5DbW2LoSvbM1kCE3DNB3DC.jpg',
  11: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/11-wallpaper-bonk-team-HsLXFXe3Cn46FSkZ2IXL1fk2OkuTDH.jpg',
  12: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/12-wallpaper-jito-team-0KPMRDeRQH3JPevvR0FXLdI3IzGoYa.jpg',
  13: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/13-wallpaper-king-A6njrefqoKwGzjU6sL4J5obH9iKupS.jpg',
  14: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/14-wallpaper-painmaker-A9ya49YXLk8tuPeNX88coAWzmaMCAE.jpg',
  15: 'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/wallpapers/15-wallpaper-nice-guy-M6ZGRR6z3oX4BlEQWxH50EMY4eb1ag.jpg',
} as const;

export const ACHIEVEMENTS: AchievementInfo[] = [
  {
    index: 0,
    title: "Look at me, I'm the trader now!",
    description: 'Execute your first perpetuals trade',
    story:
      "Congratulations! You've completed your first trade. The markets awaits your next move.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/1-look-at-me-now-pekTSNjN2sGH2JzlPIjK3tWREULk7D.jpg',
    points: 5,
    titleUnlock: 9,
    category: 'bronze',
  },
  {
    index: 1,
    title: 'The right type of gold digger',
    description:
      'Do not sell more than 50% of the ADX tokens received from ALP staking rewards',
    story:
      'While others dig for exits, you dig for glory. Golden hands, golden vision.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/2-golden-hands-td7i9DiSUQFzgWJl6nszw9e1ariMn1.jpg',
    points: 25,
    titleUnlock: 1,
    category: 'gold',
    pfpUnlock: 23,
  },
  {
    index: 2,
    title: 'B***s so heavy you can barely walk',
    description:
      'Sell less than 10% of the ADX earned from ALP staking rewards',
    story: "Walking is hard when you're carrying that much unshakable trust.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/3-diamond-hands-3RVLS24IdxiKe4ntjguhO2ylgHYaJa.jpg',
    points: 50,
    titleUnlock: 2,
    category: 'gold',
    pfpUnlock: 24,
  },
  {
    index: 3,
    title: 'Wake Me Up, Before You Trade-Trade',
    description: 'Rank top 5 of the highest volume division during pre-season',
    story: "You're awake... Now the markets fear you.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/4-babe-wake-up-oqZKa6E2swQGYbXP1JznHgT3OKEpfW.jpg',
    points: 25,
    titleUnlock: 4,
    category: 'gold',
  },
  {
    index: 4,
    title: 'Master of the Awakening',
    description: 'Reach rank #1 during the pre-season',
    story:
      'Fully awakened and ready to rule! The trading world bows to its new champion.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/5-master-of-the-awakening-q5yUElviV2RTCCaIfXmMAyYG2GBays.jpg',
    points: 25,
    titleUnlock: 3,
    category: 'gold',
  },
  {
    index: 5,
    title: 'Time to wake up, Sleepy Beast',
    description: 'Traded during the during pre-season',
    story:
      "Still rubbing your eyes but making moves. You're a contender, even half-asleep!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/6-time-to-wake-up-IxV5VRhtyCeSFERdLoqklUa26rZfFZ.jpg',
    points: 5,
    titleUnlock: 5,
    category: 'bronze',
  },
  {
    index: 6,
    title: 'Dare to Mutate',
    description: 'Rank top 10 during season 1',
    story:
      "You're a challenger, ready to evolve and wreak havoc. The markets trembles at your presence.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/7-dare-to-mutate-t3DnfboCXHK1tUNzcUCg1ibmEhRHYq.jpg',
    points: 25,
    titleUnlock: 7,
    category: 'gold',
  },
  {
    index: 7,
    title: 'Big Mutant in a Small Pond',
    description: 'Rank top 1 during season 1',
    story:
      "You've conquered the first rank! Now don't let the pond fool you into thinking you're the ocean's ruler.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/8-big-mutant-in-small-pond-3d9Qr4vhYByHGlS57FD9DDQCP56pJY.jpg',
    points: 25,
    titleUnlock: 6,
    category: 'gold',
  },
  {
    index: 8,
    title: 'Mutant on the Rise',
    description: 'Rank top 100 during season 1',
    story:
      'Contender status unlocked! Keep going, because this mutation is just getting started.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/9-mutant-on-the-rise-uewucKXwfPcjrOtGMXxrYH03X6xi93.jpg',
    points: 5,
    titleUnlock: 8,
    category: 'bronze',
  },
  {
    index: 9,
    title: 'First Blood',
    description: 'Close your first trade in profit.',
    story:
      "You made it out alive! That's more than most can say after their first battle.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/10-first-blood-1oUwmOxgyE8LiIahU5cn8H3v088A8D.jpg',
    points: 5,
    category: 'bronze',
  },
  {
    index: 10,
    title: 'One Million and Counting…',
    description: 'Achieve $1,000,000 in trading volume',
    story:
      "You're still small, but the mutation is kicking in. Keep going, baby beast!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/11-who-is-counting-iRsdHMcespgxqa8ksltjaRbmp3q2Re.jpg',
    points: 5,
    titleUnlock: 10,
    category: 'bronze',
  },
  {
    index: 11,
    title: 'Swimming in Cash',
    description: 'Reach $10,000,000 in trading volume.',
    story:
      "Starting to look more chaotic and less cute now. Don't stop, the world is watching.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/12-pool-filled-with-dollars-Nf9QMJGL50yqYSPxrskZWoZnOq83Z9.jpg',
    points: 15,
    category: 'silver',
  },
  {
    index: 12,
    title: 'The market is your playground',
    description: 'Achieve $100,000,000 in volume.',
    story:
      "Congrats, you're now a certified giant! Careful where you step, big guy.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/13-personnal-playground-QAJJLpsFe16eCcK9vfN10VJkBY0Kvr.jpg',
    points: 25,
    category: 'gold',
  },
  {
    index: 13,
    title: 'I bought the bank',
    description: 'Reach $250,000,000 in total volume',
    story:
      "You're literally shaking the markets. Hope you've got a good insurance plan!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/14-i-bought-the-bank-4bcnHoGqQydV1BAgApuJp479GJTFus.jpg',
    points: 50,
    wallpaperUnlock: 5,
    category: 'gold',
  },
  {
    index: 14,
    title: "That's hot",
    description: 'Reach $500,000,000 in total volume.',
    story:
      "At this point, you're either a genius or you invested early in memecoins. Maybe both.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/15-thats-hot-5ISN0W3DjRWKUxzh9nzudqP0inkRMY.jpg',
    points: 100,
    titleUnlock: 11,
    pfpUnlock: 5,
    category: 'platinum',
  },
  {
    index: 15,
    title: 'Just like that, a Legend was born',
    description: 'Hit $1,000,000,000 in total volume.',
    story:
      "Bow down, mortals! The market has a new ruler, and it's you. Long live the king!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/16-legend-nIvtYSkOolzupilzWQifWtuY9IwH91.jpg',
    points: 200,
    titleUnlock: 12,
    category: 'diamond',
    // + ability to upload own PFP
  },
  {
    index: 16,
    title: 'Oops!',
    description: 'Lose $5,000',
    story: "So... when does your McDonald's shift start?",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/17-mcdo-pZYjwBzwDwf6vDdeCpMxMiyauJEEGm.jpg',
    points: 5,
    titleUnlock: 13,
    category: 'bronze',
  },
  {
    index: 17,
    title: 'It happened so fast...',
    description: 'Lose $10,000.',
    story: 'Welcome to the danger zone. Check your wallet for survivors.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/18-happened-so-fast-KIt1ck2Sy7qgNqOBxs3T4vpNTORaFl.jpg',
    points: 15,
    category: 'silver',
  },
  {
    index: 18,
    title: 'Is There A Refund Button for This?',
    description: 'Lose $50,000.',
    story:
      "Oof, that mutation didn't go as planned. But hey, at least you're scoring high at something.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/19-refund-r75guD0MQXjRQgaEAJHx8ANKTKxmxs.jpg',
    points: 25,
    titleUnlock: 14,
    category: 'gold',
  },
  {
    index: 19,
    title: 'I swear, one more trade to make it all back!',
    description: 'Lose $200,000.',
    story:
      "Market slapped you that hard? Don't worry, you'r one trade away to make it all back.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/20-one-win-X2TJ1UZ0f2RvT2PACf9u0x7wbKTRs4.jpg',
    points: 50,
    titleUnlock: 15,
    category: 'gold',
  },
  {
    index: 20,
    title: "Daddy's money",
    description: 'Lose $500,000',
    story:
      "You didn't think you needed that half-million, did you? Thanks, Dad!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/21-daddy-money-4iLFVlVVt8DXbCfcytQS1BZclWv2Vd.jpg',
    points: 100,
    titleUnlock: 16,
    category: 'platinum',
  },
  {
    index: 21,
    title: 'All Chips Gone!',
    description: 'Lose $1,000,000',
    story: 'Well… that escalated quickly. All in? All gone',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/22-lose-1m-yzb22qDaBRu1qjcGLTHk6sagNI2iDp.jpg',
    points: 200,
    titleUnlock: 17,
    category: 'diamond',
  },
  {
    index: 22,
    title: 'You guys are getting gains?',
    description: 'Reach $5,000 in realized profits.',
    story: "You caught something! Let's hope it's not beginner's luck.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/23-you-guys-are-getting-paid-owNoteCLB5Z6TN8J73RkPlF1pCOgFA.jpg',
    points: 5,
    category: 'bronze',
  },
  {
    index: 23,
    title: 'Slow grind is the best grind',
    description: 'Reach $10,000 in realized profits.',
    story: 'Careful, the markets bite back.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/24-slow-grind-PiLmxOAcDSKLUHazU29PiOjmfAOwd4.jpg',
    points: 15,
    category: 'silver',
  },
  {
    index: 24,
    title: 'Time to flex',
    description: 'Reach $50,000 in realized profits.',
    story:
      'The beast has learned to hunt. The fortune is real, but the flex is even better.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/25-time-to-flex-1XuayhxSnAWeqSz2z7aMfY9ptgMt4w.jpg',
    points: 25,
    titleUnlock: 18,
    category: 'gold',
  },
  {
    index: 25,
    title: 'Packed your things yet?',
    description: 'Reach $200,000 in realized profits.',
    story: 'Printer has been activated. Please avoid hyperinflation.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/26-packed-your-things-yet-IpZBGnB46Lhut3G5thSYJAnzSPJMRP.jpg',
    points: 50,
    titleUnlock: 19,
    category: 'gold',
  },
  {
    index: 26,
    title: 'Moby Dick would be jealous',
    description: 'Reach $500,000 in realized profits.',
    story: "Whale alert! Careful, don't capsize the boat with all that profit.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/27-moby-dick-Lr0avxHgUHbIgx5upXO84l6DGQ6Cj2.jpg',
    points: 100,
    titleUnlock: 20,
    pfpUnlock: 6,
    category: 'platinum',
  },
  {
    index: 27,
    title: 'Reached the Apex',
    description: 'Reach $1,000,000 in realized profits.',
    story: "You're at the top of the food chain!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/28-apex-Q9J81YMxgh2nm12so0K8p7frwcmBf4.jpg',
    points: 200,
    titleUnlock: 21,
    category: 'diamond',
  },
  {
    index: 28,
    title: 'Beast Tamer... For Now',
    description: 'Complete 5 consecutive trades with no losses',
    story:
      "You're taming the markets like a circus trainer. Hope they stay obedient!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/29-book-Z3AXeSaEt1TpHoPNwuadRENYTjZyU7.jpg',
    points: 10,
    wallpaperUnlock: 6,
    category: 'bronze',
  },
  {
    index: 29,
    title: 'Strike!',
    description: 'Complete 10 consecutive trades with no losses',
    story: 'You got them all in one streak.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/30-strike-mfHfdJ0Wryyrej2m9eVZ9JEVqW4MAM.jpg',
    points: 50,
    pfpUnlock: 7,
    category: 'gold',
  },
  {
    index: 30,
    title: 'Unstoppable',
    description: 'Complete 20 consecutive trades with no losses',
    story: 'Who can stop him?',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/31-unstoppable-cj1ncGJ5pCykjcHoUv43GVJENiJ192.jpg',
    points: 200,
    titleUnlock: 22,
    category: 'diamond',
  },
  {
    index: 31,
    title: 'Salade, tomates & oignons, chef',
    description: 'Earn $10 from Staked ADX',
    story: "You earned a kebab's worth of income!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/32-free-kebab-jHIaLAppPnO2FSiGX0H9K3o0FeOo9t.jpg',
    points: 5,
    titleUnlock: 23,
    category: 'bronze',
  },
  {
    index: 32,
    title: 'I can buy a Lambo... in Monopoly',
    description: 'Earn $1,000 from Staked ADX',
    story: "A thousand bucks? You're hoarding mutagen like a true monster.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/33-monopoly-NC7wsUMeKB37s99lqKr8baP982Q2lX.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 33,
    title: 'Blood, sweat, and some coins',
    description: 'Earn $5,000 from Staked ADX',
    story:
      "That's enough to buy some real monster snacks. Keep bleeding them dry!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/34-blood-and-sweat-0qOp1ZrMQjDitzANo67vlnSzE2akQy.jpg',
    points: 15,
    category: 'silver',
  },
  {
    index: 34,
    title: 'Finally, enough to trade x100',
    description: 'Earn $10,000 from Staked ADX',
    story:
      "Your collection is growing. Soon you'll need a vault for all those profits!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/35-100x-TobyYt1CZMYvElzdGe8a60iSttJicD.jpg',
    points: 25,
    category: 'gold',
  },
  {
    index: 35,
    title: "I'm not saying I'm rich, but...",
    description: 'Earn $50,000 from Staked ADX',
    story:
      "You've got trophies, and they're all in your bank account. Cha-ching!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/36-not-saying-im-rich-but-lg5pXXXviv7PvXxYjiHe4uFMyKyItD.jpg',
    points: 50,
    category: 'gold',
  },
  {
    index: 36,
    title: 'The money grows on trees, I swear',
    description: 'Earn $100,000 from Staked ADX',
    story:
      "Ruling over spoils? You've mastered the art of doing nothing while getting rich!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/37-money-growing-on-trees-TxiKxYJYvnMHYM0pCbIIw4BdIloPsc.jpg',
    points: 100,
    titleUnlock: 24,
    category: 'platinum',
  },
  {
    index: 37,
    title: 'One million reasons to love me',
    description: 'Have 1,000,000 staked ADX',
    story: 'A million staked ADX. Your mutant collection is looking strong!',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/38-one-million-reasons-0uIio4G396XM4k6trESB7gqvR2AnuC.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 38,
    title: 'Locked and ADXed',
    description: 'Have 3,000,000 staked ADX',
    story:
      '3 million ADX staked? Welcome to the maximum security staking club!',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/39-out-of-hands-3kjW1ZOrBq4QDOoRkIkWWuOcoesHgs.jpg',
    points: 15,
    pfpUnlock: 8,
    category: 'silver',
  },
  {
    index: 39,
    title: 'Watch out, retirement is coming',
    description: 'Have 6,000,000 staked ADX',
    story: 'The stake beasts bow to you. Can you handle the power?',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/40-retirement-is-coming-Gv3p6fvuS3HuLQmnRz8X5iVcMGFoqm.jpg',
    points: 25,
    titleUnlock: 25,
    category: 'gold',
  },
  {
    index: 40,
    title: "Where's my private island?",
    description: 'Have 10,000,000 staked ADX',
    story: "That's a lot of ADX. You're starting to scare the markets!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/41-private-island-bv5BnFbBWemnuVltYCulBKxyFsJAId.jpg',
    points: 50,
    category: 'gold',
  },
  {
    index: 41,
    title: 'Is this staking, or is this overkill?',
    description: 'Have 20,000,000 staked ADX',
    story:
      "You've become the Kraken of the staked ADX world. There's no stopping you!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/42-kraken-bDQPT4BeERtDyCIm827BwOM9LPQI8w.jpg',
    points: 100,
    category: 'platinum',
  },
  {
    index: 42,
    title: 'I have enough ADX to buy your soul',
    description: 'Have 50,000,000 staked ADX',
    story: 'Your ADX empire is vast. The board awaits your command, Overlord.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/43-buy-our-soul-XOCwE3F6VXYTRz1D5mYjgNYPTgb9iT.jpg',
    points: 200,
    titleUnlock: 26,
    category: 'diamond',
  },
  {
    index: 43,
    title: 'Just dip my toes in the pool',
    description: 'Add $1,000 of liquidity at once',
    story:
      'Just a ripple in the liquidity pool… though even tidal waves start small!',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/44-tip-a-toe-GLl6rxIIQF1WmYSgF1IpCAUeQOdDC8.jpg',
    points: 5,
    category: 'bronze',
  },
  {
    index: 44,
    title: 'Storming the liquidity pool',
    description: 'Add $50,000 of liquidity at once',
    story: "You've summoned a storm, but are you ready for the downpour?",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/45-tornado-mP5d8o5l79cXnzYJkMegyQT4ONHZIK.jpg',
    points: 5,
    category: 'bronze',
  },
  {
    index: 45,
    title: 'Making waves in the market',
    description: 'Add $100,000 of liquidity at once',
    story: 'The ocean is roaring! Hold on tight, or you might get swept away.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/46-waves-WvzBDFgBSH4rs7j8m8jupl6xQ4rrcS.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 46,
    title: "I'm the storm now",
    description: 'Add $250,000 of liquidity at once',
    story: "You've become a force of nature. Don't let it go to your head!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/47-storm-CaprSEA1qW1xefBoJSOdhrKtWWOLa4.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 47,
    title: 'Tsunami bringer',
    description: 'Add $500,000 of liquidity at once',
    story: "A tsunami of liquidity! Hope you've got flood insurance.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/48-tsunami-9LzKOIPrPXW0SSWvtMZq8S1YhysRU3.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 48,
    title: 'Bigger than the Kraken',
    description: 'Add $1,000,000 of liquidity at once',
    story:
      "You're reshaping the seas. The market bows to you now, liquidity king!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/49-kraken-XMpMV1VInrDzc2u7jINZTJV3je8aad.jpg',
    points: 15,
    titleUnlock: 27,
    category: 'silver',
  },
  {
    index: 49,
    title: 'Patiently waiting for the bus',
    description: 'Keep a trade open for 30 days (Long-Term Vision)',
    story:
      'Patience is a virtue... or maybe you just forgot about the trade. Either way, well done!',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/50-waiting-the-bus-2qRgkjQCxMbFy0W0ttI1JH9jJO7ZB3.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 50,
    title: 'Oops! There goes my wallet',
    description: 'Get liquidated once',
    story: 'Well, that went horribly wrong. Welcome to the void, Brian.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/51-wallet-b8kkZjbxBrlYxzBOceITq712QwihR6.jpg',
    points: 5,
    titleUnlock: 28,
    category: 'bronze',
  },
  {
    index: 51,
    title: 'I am the fallen... and the floor',
    description: 'Get liquidated 25 times',
    story: "If at first you don't succeed... get liquidated 25 more times!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/52-fallen-BZDcb6p0zacpso4oIrGII2cNw34rQ6.jpg',
    points: 5,
    category: 'bronze',
  },
  {
    index: 52,
    title: 'Flaming out, but still kicking',
    description: 'Get liquidated 50 times',
    story: "You're on fire! Though not the right kind of fire...",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/53-burning-BafBZ7ifJzOjNvIyhvhx9msZGXDNWO.jpg',
    points: 10,
    category: 'bronze',
  },
  {
    index: 53,
    title: 'Return to dust',
    description: 'Get liquidated 100 times',
    story: "Burned a hundred times? You must be Cramer's biggest fan!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/54-cramer-e5yTIHWTYdoN6s4i8pvzYim9p1zyDu.jpg',
    points: 25,
    titleUnlock: 29,
    category: 'gold',
  },
  {
    index: 54,
    title: 'Who am I again?',
    description: 'Change your username 10 times',
    story:
      "You've changed more times than I can count. Ever thought about sticking with one name?",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/55-who-am-i-again-IsO6vuXv3TLcRcQDpROjAlT0zGo0yE.jpg',
    points: 5,
    titleUnlock: 30,
    category: 'bronze',
  },
  {
    index: 55,
    title: 'Call of Muty',
    description: 'Open a trade during season 2',
    story: 'Report for duty, soldier. Your first mission starts now',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/56-call-of-muty-m6HdtIp3QIp7dNkXyihIOv9rg1s4Gc.jpg',
    points: 5,
    titleUnlock: 31,
    pfpUnlock: 9,
    wallpaperUnlock: 7,
    category: 'bronze',
  },
  {
    index: 56,
    title: "What's up, Sarge?",
    description: 'Become a Sergeant during season 2',
    story: "You've earned your stripes, Sergeant. Now, lead with honor",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/57-sarge-IHpa36NFcS8eYogU8S6UWcunK4Tv2b.jpg',
    points: 15,
    titleUnlock: 32,
    pfpUnlock: 10,
    wallpaperUnlock: 8,
    category: 'silver',
  },
  {
    index: 57,
    title: 'Lieutenant Dan-ish',
    description: 'Become a Lieutenant during season 2.',
    story:
      "You've braved chaos and kept your head. Some say you're destined for shrimp and glory",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/58-lieutenant-twDgt3YUjxH5VUwGMbbnUL5uDVmrfC.jpg',
    points: 50,
    titleUnlock: 33,
    pfpUnlock: 11,
    wallpaperUnlock: 9,
    category: 'gold',
  },
  {
    index: 58,
    title: 'General-Gate',
    description: 'Become a General during season 2',
    story:
      "You've led squads through chaos, rallied worlds, and stood at the edge of the unknown. Command suits you",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/59-general-eTLcZlzVIVBYOPZjGz5sI5bwXLligg.jpg',
    points: 100,
    titleUnlock: 34,
    pfpUnlock: 12,
    wallpaperUnlock: 10,
    category: 'platinum',
  },
  {
    index: 59,
    title: 'The BONKing Dead',
    description: 'Join the BONK team in Season 2',
    story:
      'An army forged in chaos, barking through the smoke of liquidations. You are the BONKing Dead — and every trade is a step closer to victory',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/60-bonk-team-JTFbin6qiHvus053mJGClkr2kjB0dI.jpg',
    points: 5,
    titleUnlock: 35,
    pfpUnlock: 13,
    wallpaperUnlock: 11,
    category: 'bronze',
  },
  {
    index: 60,
    title: 'The LST Legion',
    description: 'Be a part of the JITO team during season 2',
    story:
      'Strength. Loyalty. Arms like Jito nodes. You chose gains over games',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/61-jito-team-BhRwnHrBIjX6A5qb5DXFSe1YfFCyLK.jpg',
    points: 5,
    titleUnlock: 36,
    pfpUnlock: 14,
    wallpaperUnlock: 12,
    category: 'bronze',
  },
  {
    index: 61,
    title: 'King of the Hill',
    description: 'Rank top 1 during season 2',
    story: 'As the king, your dominance is undisputed. All hail the new king',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/63-king-of-the-hill-mdzBh13hkt9bbbn80vn8j4kLSOqCot.jpg',
    points: 100,
    titleUnlock: 37,
    pfpUnlock: 15,
    wallpaperUnlock: 13,
    category: 'platinum',
  },
  {
    index: 62,
    title: 'Pressing the attack',
    description: 'Rank top 1 on a week during season 2',
    story: 'They followed your lead. And your lead was carnage',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/64-pressing-the-attack-oMeZ4UvVi56GxWgRj1QlEsu4slZEz7.jpg',
    points: 25,
    pfpUnlock: 16,
    titleUnlock: 38,
    category: 'silver',
  },
  {
    index: 63,
    title: 'Calife à la place du calife',
    description: 'Rank top 5 during season 2',
    story: 'So close you can smell the throne. Just one more step...',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/65-calife-tccziEh6ZIrAKFUViiNyc5QC0TvVi2.jpg',
    points: 50,
    titleUnlock: 39,
    category: 'gold',
  },
  {
    index: 64,
    title: 'High Five!',
    description: 'Rank top 5 on a week during season 2',
    story: 'You are a remarkable member of your team',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/66-high-five-bQf2GEGTa64QWdEwyDC47O5myZsoa7.jpg',
    points: 10,
    titleUnlock: 40,
    category: 'bronze',
  },
  {
    index: 65,
    title: 'Breaking Bags',
    description: "Pillage 30% of the enemy's team rewards",
    story:
      "You didn't just win—you ravaged their coffers. It is a feast for tonight",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/67-breaking-bags-jJMoBafIjloclGB4bkdOrQiG1CtSCt.jpg',
    points: 50,
    titleUnlock: 41,
    category: 'gold',
  },
  {
    index: 66,
    title: 'Sabotage',
    description:
      'Open 5 trades with the other faction assets with max size 4.4M on JitoSol asset or >240k on BONK',
    story:
      "A silent strike. You didn't just disrupt them — you poisoned the whole plan.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/68-sabotage-glLt7G1sLdckP9Rzwgznet3cfDmQor.jpg',
    points: 25,
    titleUnlock: 42,
    pfpUnlock: 17,
    category: 'silver',
  },
  {
    index: 67,
    title: 'Traitor!',
    description: 'Trade with the enemy faction asset only',
    story:
      'You crossed over. You took their deals. Hope the snacks were worth it',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/69-traitor-GyrrYb0yNLjNzIpk1jMTURogYLtwEH.jpg',
    points: 5,
    titleUnlock: 43,
    pfpUnlock: 18,
    category: 'bronze',
  },
  {
    index: 68,
    title: 'Back-to-Back',
    description: 'Win against the enemy faction two times in a row.',
    story:
      "Two strikes. No mercy. The enemy's morale is cracking—and you're just getting started",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/70-back-to-back-7AuN3UHeg5LY0qIjHEmdYcfD80bP07.jpg',
    points: 25,
    titleUnlock: 44,
    category: 'silver',
  },
  {
    index: 69,
    title: "Stop! He's already dead",
    description: 'Win against the enemy faction five times in a row.',
    story:
      "For you, the battlefield is a playground. For them it's a no monster's land. Run",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/71-stop-rPc9gINLbwbsEo55Xi39QnUvBhyqSW.jpg',
    points: 50,
    titleUnlock: 45,
    pfpUnlock: 19,
    category: 'gold',
  },
  {
    index: 70,
    title: 'Your Worst Day... So Far',
    description: 'Lose against the enemy faction two times in a row',
    story:
      'Son, this may seem like your worst day... *so far*. Get back up and prove them wrong',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/72-worst-day-so-far-R7Ol75O1ptrIzlcZBDARzaB3PhhXKe.jpg',
    points: 5,
    titleUnlock: 46,
    category: 'bronze',
  },
  {
    index: 71,
    title: 'You Died',
    description: 'Lose against the enemy faction five times in a row',
    story: "Five defeats later… it's still not game over. Git gud.",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/73-died-HapENmkoRNxR7RdBm71XSSHXAcHxB4.jpg',
    points: 15,
    titleUnlock: 47,
    category: 'silver',
  },
  {
    index: 72,
    title: "Show 'em",
    description: 'Kill the weekly boss',
    story: "You're a boss killer. Time to show them who's boss",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/74-show%27em-IJOPKiwtXuFNp54Ns6QXT9hXoG1fu9.jpg',
    points: 15,
    titleUnlock: 48,
    pfpUnlock: 20,
    category: 'silver',
  },
  {
    index: 73,
    title: 'Just a Scratch',
    description: 'Generate 100 mutagens during season 2',
    story: 'You called it a scratch. The boss called in sick.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/75-just-a-scratch-V8yjFxCGmCgBxeKI8ZTsawt1rvEr0R.jpg',
    points: 50,
    titleUnlock: 49,
    category: 'gold',
  },
  {
    index: 74,
    title: 'It’s Super Effective!',
    description: 'Generate 500 mutagens during season 2',
    story:
      'When legends speak of this fight, they’ll start with your blow. Clean. Brutal. Super effective.',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/76-super-effective-CUN6NIPvcnVR6IdT5lZvaKg3SM0QRV.jpg',
    points: 100,
    titleUnlock: 50,
    category: 'platinum',
  },
  {
    index: 75,
    title: 'The Painmaker',
    description: 'Generate 1000 mutagens during season 2',
    story:
      'Not to be confused with a Peacemaker. You showed up, dealt 1k mutagens, and left a crater',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/77-painmaker-OpwkbU9fEdkdJixU1AhnqWt9cwXpBC.jpg',
    points: 200,
    titleUnlock: 51,
    pfpUnlock: 21,
    wallpaperUnlock: 14,
    category: 'diamond',
  },
  {
    index: 76,
    title: 'Colonel Sanders of Solana',
    description:
      'Complete the officer steps for a week. Your leadership is commendable',
    story: "You cooked up a 7-step combo bucket of glory. Finger-lickin' good!",
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/78-sanders-I0OMTH4NdhPr4VIeWMhmRrrqhcrL7I.jpg',
    points: 15,
    titleUnlock: 52,
    category: 'silver',
  },
  {
    index: 77,
    title: 'Nice Guy',
    description: 'Complete the officer steps for the entire of season 2.',
    story:
      'Didn’t chase glory. Didn’t farm for self. Just showed up, did the job, and made life better for everyone',
    image:
      'https://iyd8atls7janm7g4.public.blob.vercel-storage.com/achievements/79-nice-guy-rLi4pZy0g4b6aek9nUoID8In4dgnkB.jpg',
    points: 100,
    titleUnlock: 53,
    pfpUnlock: 22,
    wallpaperUnlock: 15,
    category: 'platinum',
  },
];

export const SOLANA_ID_TIERS_MUTAGEN = {
  tier_1: { mutagen: 10, title: 'Tier 1' },
  tier_2: { mutagen: 5, title: 'Tier 2' },
  tier_3: { mutagen: 3, title: 'Tier 3' },
  tier_4: { mutagen: 1, title: 'Tier 4' },
} as const;

export const GENERAL_CHAT_ROOM_ID = 0;
export const JITO_CHAT_ROOM_ID = 1;
export const BONK_CHAT_ROOM_ID = 2;
export const ANNOUNCEMENTS_CHAT_ROOM_ID = 3;

export const ALL_CHAT_ROOMS = {
  0: {
    id: GENERAL_CHAT_ROOM_ID,
    name: 'General',
    description: 'General chat room for all players',
    group: 'channels',
  },
  1: {
    id: JITO_CHAT_ROOM_ID,
    name: 'Team Jito',
    description: 'Jito chat room for Jito players',
    group: 'channels',
  },
  2: {
    id: BONK_CHAT_ROOM_ID,
    name: 'Team Bonk',
    description: 'Bonk chat room for Bonk players',
    group: 'channels',
  },
  3: {
    id: ANNOUNCEMENTS_CHAT_ROOM_ID,
    name: 'Announcements',
    description: 'Announcements chat room for all players',
    group: 'information',
  },
} as const;

export const ALTERNATIVE_SWAP_TOKENS: Token[] = [
  // {
  //   mint: new PublicKey('4yCLi5yWGzpTWMQ1iWHG5CrGYAdBkhyEdsuSugjDUqwj'),
  //   symbol: 'ALP',
  //   color: '#130AAA',
  //   name: 'Adrena Liquidity Pool Token',
  //   decimals: 6,
  //   displayAmountDecimalsPrecision: 2,
  //   displayPriceDecimalsPrecision: 2,
  //   isStable: false,
  //   image: 'https://arweave.net/fRrkJvBTj9ZMa3j1sy5HMEvBNVIP0MDfonXXyKfbSW4',
  //   additionalSwapToken: true,
  // },
  // {
  //   mint: new PublicKey('AuQaustGiaqxRvj2gtCdrd22PBzTn8kM3kEPEkZCtuDw'),
  //   symbol: 'ADX',
  //   color: '#130AAA',
  //   name: 'Adrena Governance Token',
  //   decimals: 6,
  //   displayAmountDecimalsPrecision: 2,
  //   displayPriceDecimalsPrecision: 2,
  //   isStable: false,
  //   image: 'https://arweave.net/8HohRjBW7P5uMUR0Cz9eHxLfOO2PcnLzciyvhhgNkck',
  //   additionalSwapToken: true,
  // },
  {
    mint: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
    symbol: 'USDT',
    color: '#26A17B',
    name: 'USDT',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: true,
    image:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL'),
    symbol: 'JTO',
    color: '#26A17B',
    name: 'Jito',
    decimals: 9,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://metadata.jito.network/token/jto/image',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS'),
    symbol: 'KMNO',
    color: '#130AAA',
    name: 'Kamino Finance',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://cdn.kamino.finance/kamino.svg',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('vSoLxydx6akxyMD9XEcPvGYNGq6Nn66oqVb3UkGkei7'),
    symbol: 'vSOL',
    color: '#130AAA',
    name: 'The Vault',
    decimals: 9,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'https://gateway.irys.xyz/DTBps6awrJWectiBhMubYke4TBnE9kkVqyCVP4MB4irB',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3'),
    symbol: 'PYTH',
    color: '#26A17B',
    name: 'Pyth Network',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://pyth.network/token.svg',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4'),
    symbol: 'JLP',
    color: '#26A17B',
    name: 'Jupiter Perps',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://static.jup.ag/jlp/icon.png',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'),
    symbol: 'TRUMP',
    color: '#26A17B',
    name: 'TRUMP',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://arweave.net/VQrPjACwnQRmxdKBTqNwPiyo65x7LAT773t8Kd7YBzw',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump'),
    symbol: 'FARTCOIN',
    color: '#26A17B',
    name: 'FARTCOIN',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'https://ipfs.io/ipfs/QmQr3Fz4h1etNsF7oLGMRHiCzhB5y9a7GjyodnF7zLHK1g',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7'),
    symbol: 'DRIFT',
    color: '#26A17B',
    name: 'DRIFT',
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://metadata.drift.foundation/drift.png',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
    symbol: 'mSOL',
    color: '#26A17B',
    name: 'Marinade staked SOL',
    decimals: 9,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs'),
    symbol: 'WETH',
    color: '#26A17B',
    name: 'Wrapped Ether (Wormhole)',
    decimals: 8,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs/logo.png',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('SNS8DJbHc34nKySHVhLGMUUE72ho6igvJaxtq9T3cX3'),
    symbol: 'SNS',
    color: '#26A17B',
    name: 'Solana Name Service',
    decimals: 5,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image: 'https://www.sns.id/token/image.png',
    additionalSwapToken: true,
  },
  {
    mint: new PublicKey('CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s'),
    symbol: 'CRT',
    color: '#F98635',
    name: 'Carrot',
    decimals: 9,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'https://shdw-drive.genesysgo.net/7G7ayDnjFoLcEUVkxQ2Jd4qquAHp5LiSBii7t81Y2E23/carrot.png',
    additionalSwapToken: true,
  },
];
