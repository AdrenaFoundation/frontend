import { BN, Program } from '@coral-xyz/anchor';
import { QuoteResponse } from '@jup-ag/api';
import { sha256 } from '@noble/hashes/sha256';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import { BigNumber } from 'bignumber.js';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { Adrena } from '@/target/adrena';

import arrowDown from '../public/images/arrow-down.png';
import arrowRightIcon from '../public/images/arrow-right.svg';
import arrowUp from '../public/images/arrow-up.png';
import btcLogo from '../public/images/btc.svg';
import solLogo from '../public/images/sol.svg';
import {
  ROUND_MIN_DURATION_SECONDS,
  SOLANA_EXPLORERS_OPTIONS,
} from './constant';
import { WalletStakingAccounts } from './hooks/useWalletStakingAccounts';
import { SettingsState } from './reducers/settingsReducer';
import {
  ImageRef,
  LimitedString,
  LockedStakeExtended,
  PositionExtended,
  Token,
  U128Split,
  UserProfileExtended,
} from './types';

export function getArrowElement(side: 'up' | 'down', className?: string) {
  const pxSize = 9;

  return (
    <Image
      className={twMerge(
        `grow-0 max-h-[${pxSize}px] max-w-[${pxSize}px] self-center absolute right-[0.6em]`,
        className,
      )}
      src={side === 'down' ? arrowDown : arrowUp}
      height={pxSize}
      width={pxSize}
      alt="Arrow"
    />
  );
}

export function getRightArrowElement() {
  return (
    <Image
      className="ml-2 mr-2 opacity-60"
      src={arrowRightIcon}
      height={16}
      width={16}
      alt="Arrow"
    />
  );
}

export function getNextSaturdayUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7; // Calculate days to next Saturday

  // Get next Saturday at 00:00:00 UTC
  const nextSaturday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + daysUntilSaturday,
      0,
      0,
      0,
      0,
    ),
  );

  return nextSaturday;
}

export function chunkArray<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size),
  );
}

export function getNextUTCDate() {
  const now = new Date();

  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
    ),
  );
}

export function formatNumAbbreviated(num: number, precision = 2): string {
  if (num > 999_999_999) {
    return (num / 1_000_000_000).toFixed(precision) + 'B';
  }

  if (num > 999_999) {
    return (num / 1_000_000).toFixed(precision) + 'M';
  }

  if (num > 999) {
    return (num / 1_000).toFixed(precision) + 'K';
  }

  return num.toFixed(precision);
}

export function findATAAddressSync(
  wallet: PublicKey,
  mint: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

// Transfer 12/25 into 25 December
export function formatToWeekOf(dateString: string, weeksOffset = 0): string {
  // Parse the date string (MM/DD format) as UTC in the current year
  const [month, day] = dateString.split('/').map(Number);
  const currentYear = new Date().getFullYear();

  // Create the initial date
  const date = new Date(Date.UTC(currentYear, month - 1, day));

  // Subtract weeks (7 days per week) if weeksAgo is provided
  date.setUTCDate(date.getUTCDate() + weeksOffset * 7);

  // Format the updated date
  const dayOfMonth = date.getUTCDate();
  const monthName = date.toLocaleString('default', {
    month: 'long',
    timeZone: 'UTC',
  });

  return `${dayOfMonth} ${monthName}`;
}

export function getLastMondayUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days since the last Monday

  const lastMonday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - diffToMonday, // Go back to last Monday
      0,
      0,
      0,
    ),
  );

  return lastMonday;
}

export function getLastSundayUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); // 0 = Sunday
  const diffToSunday = dayOfWeek === 0 ? 0 : dayOfWeek; // Days since the last Sunday

  const lastSunday = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - diffToSunday, // Go back to last Sunday
      23,
      59,
      59, // Set time to 23:59:59
    ),
  );

  return lastSunday;
}

export function formatNumber(
  nb: number,
  precision: number,
  minimumFractionDigits = 0,
  precisionIfPriceDecimalsBelow = 6,
): string {
  // If price is below decimals precision, display up to 6 decimals (override by minimumFractionDigits)
  if (Math.abs(nb) < 10 ** -precision)
    precision = Math.max(precisionIfPriceDecimalsBelow, minimumFractionDigits);

  if (precision < minimumFractionDigits) {
    precision = minimumFractionDigits;
  }

  return Number(nb.toFixed(precision)).toLocaleString('en-US', {
    minimumFractionDigits,
    maximumFractionDigits: precision,
  });
}

export function formatPriceInfo(
  price: number | null | undefined,
  decimals = 2,
  minimumFractionDigits = 0,
  precisionIfPriceDecimalsBelow = 8,
) {
  if (price === null || typeof price === 'undefined') {
    return '-';
  }

  if (price == 0) {
    return `$${formatNumber(
      price,
      decimals,
      minimumFractionDigits,
      precisionIfPriceDecimalsBelow,
    )}`;
  }

  if (price < 0) {
    return `-$${formatNumber(
      price * -1,
      decimals,
      minimumFractionDigits,
      precisionIfPriceDecimalsBelow,
    )}`;
  }

  return `$${formatNumber(
    price,
    decimals,
    minimumFractionDigits,
    precisionIfPriceDecimalsBelow,
  )}`;
}

export function formatGraphCurrency({
  tickItem,
  maxDecimals = 0,
  maxDecimalsIfToken = 4,
}: {
  tickItem: number;
  maxDecimals?: number;
  maxDecimalsIfToken?: number;
}): string {
  if (tickItem === 0) return '$0';

  const absValue = Math.abs(tickItem);
  const isNegative = tickItem < 0;

  let num;
  if (absValue > 999_999_999) {
    const billions = absValue / 1_000_000_000;
    num =
      (billions % 1 === 0 ? Math.floor(billions) : billions.toFixed(2)) + 'B';
  } else if (absValue > 999_999) {
    const millions = absValue / 1_000_000;
    num =
      (millions % 1 === 0 ? Math.floor(millions) : millions.toFixed(2)) + 'M';
  } else if (absValue > 999) {
    const thousands = absValue / 1_000;
    num =
      (thousands % 1 === 0
        ? Math.floor(thousands)
        : thousands.toFixed(maxDecimals)) + 'K';
  } else if (absValue < 100) {
    num =
      absValue % 1 === 0
        ? Math.floor(absValue)
        : absValue.toFixed(maxDecimalsIfToken);
  } else if (absValue <= 999) {
    num = absValue % 1 === 0 ? Math.floor(absValue) : absValue.toFixed(2);
  } else {
    num = String(Math.floor(absValue));
  }

  return isNegative ? `-$${num}` : `$${num}`;
}

export function formatNumberShort(
  nb: number | string,
  maxDecimals = 2,
): string {
  if (typeof nb === 'string') {
    nb = Number(nb);
  }
  if (nb < 1_000) return nb.toFixed(maxDecimals).toString();

  if (nb < 1_000_000) return `${(nb / 1_000).toFixed(maxDecimals)}K`; // Use maxDecimals

  if (nb < 1_000_000_000) return `${(nb / 1_000_000).toFixed(maxDecimals)}M`; // Use maxDecimals

  return `${(nb / 1_000_000_000).toFixed(maxDecimals)}B`; // Use maxDecimals
}

export function formatPercentage(
  nb: number | null | undefined,
  precision = 2,
): string {
  if (nb === null || typeof nb === 'undefined') {
    return '-';
  }

  return `${Number(nb).toFixed(precision)}%`;
}

export function stringToLimitedString(str: string): LimitedString {
  return {
    value: Array.from(str).map((char) => char.charCodeAt(0)),
    length: str.length,
  };
}

export function limitedStringToString(str: LimitedString): string {
  return String.fromCharCode(...str.value);
}

export function u128SplitToBN(u128: U128Split): BN {
  // Shift the high part 64 bits to the left
  const highShifted = u128.high.shln(64);

  // Combine the shifted high part with the low part
  return highShifted.add(u128.low);
}

export function nativeToUi(nb: BN, decimals: number): number {
  // stop displaying at hundred thousandth
  return new BigNumber(nb.toString()).shiftedBy(-decimals).toNumber();
}

// 10_000 = x1 leverage
// 500_000 = x50 leverage
export function uiLeverageToNative(leverage: number): number {
  return Math.floor(leverage * 10_000);
}

export function uiToNative(nb: number, decimals: number): BN {
  return new BN(Math.floor(nb * 10 ** decimals).toString());
}

export function getTokenNameByMint(mint: PublicKey): string {
  return window.adrena.config.tokensInfo[mint.toBase58()]?.symbol ?? 'Unknown';
}

export function getNextStakingRoundStartTime(timestamp: BN): Date {
  const d = new Date();

  d.setTime((timestamp.toNumber() + ROUND_MIN_DURATION_SECONDS) * 1000);

  return d;
}

// In microLamports, these values aren't very reliable, they are here in case the dynamic values are not available
export const DEFAULT_PRIORITY_FEES = {
  medium: 100_000,
  high: 250_000,
  ultra: 500_000,
} as const;

export const DEFAULT_PRIORITY_FEE_OPTION = 'high';

// in SOL
export const DEFAULT_MAX_PRIORITY_FEE = 0.0001;

export const DEFAULT_SETTINGS = {
  disableChat: false,
  showFeesInPnl: true,
  showPopupOnPositionClose: true,
  preferredSolanaExplorer: 'Solana Explorer',
  priorityFeeOption: DEFAULT_PRIORITY_FEE_OPTION,
  maxPriorityFee: DEFAULT_MAX_PRIORITY_FEE,
  openPositionCollateralSymbol: '',
  closePositionCollateralSymbol: '',
  depositCollateralSymbol: '',
  withdrawCollateralSymbol: '',
} as SettingsState;

export const PercentilePriorityFeeList = {
  medium: 3000,
  high: 5000,
  ultra: 7500,
} as const;

export function addNotification({
  title,
  message,
  type = 'info',
  duration = 'regular',
  position = 'bottom-left',
}: {
  title: string;
  type?: 'success' | 'error' | 'info';
  message?: ReactNode;
  duration?: 'fast' | 'regular' | 'long';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}) {
  const content = message ? (
    <div className="flex flex-col">
      <div className="border-b border-white/10 pb-2 text-sm font-medium font-mono">
        {title}
      </div>
      <div className="mt-4 text-sm font-mono">{message}</div>
    </div>
  ) : (
    <p className="text-sm font-mono font-medium">{title}</p>
  );

  toast[type](content, {
    position: position,
    autoClose: { fast: 1_000, regular: 2_000, long: 10_000 }[duration] ?? 5_000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    theme: 'colored',
    icon: false,
    style: {
      background: {
        success: 'var(--color-green-500)',
        error: 'var(--color-red-500)',
        info: '#162a3d',
      }[type],
    },
  });
}

export function addSuccessTxNotification({
  txHash,
  ...params
}: Omit<
  Parameters<typeof addNotification>[0],
  'message' | 'duration' | 'type'
> & {
  txHash: string | null;
}) {
  const message = txHash ? (
    <Link href={getTxExplorer(txHash)} target="_blank" className="underline">
      View transaction
    </Link>
  ) : (
    ''
  );

  addNotification({
    ...params,
    type: 'success',
    message,
    duration: 'long',
  });
}

export function safeJSONStringify(obj: unknown, space = 2): string {
  try {
    return JSON.stringify(obj, null, space);
  } catch {
    return String(obj);
  }
}

export function addFailedTxNotification({
  error,
  ...params
}: Omit<
  Parameters<typeof addNotification>[0],
  'message' | 'duration' | 'type'
> & {
  error: AdrenaTransactionError | unknown;
}) {
  const message = (() => {
    if (error instanceof AdrenaTransactionError) {
      return (
        <div className="flex flex-col">
          <div>{String(error.errorString)}</div>

          {error.txHash ? (
            <Link
              href={getTxExplorer(error.txHash)}
              target="_blank"
              className="underline mt-2"
            >
              View transaction
            </Link>
          ) : null}
        </div>
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // console.log('error with cause:', (error as any)?.cause);

    const errStr =
      typeof error === 'object' ? safeJSONStringify(error) : String(error);

    if (errStr === '{}' || !errStr.trim().length) {
      return 'Unknown error';
    }
  })();

  addNotification({
    ...params,
    type: 'error',
    message,
    duration: 'long',
  });
}

export function getTxExplorer(txHash: string): string {
  const cluster = window.adrena.cluster;
  return (
    SOLANA_EXPLORERS_OPTIONS[window.adrena.settings.solanaExplorer].getTxUrl(
      txHash,
      cluster,
    ) ?? SOLANA_EXPLORERS_OPTIONS['Solana Explorer'].getTxUrl(txHash, cluster)
  );
}

export function getAccountExplorer(address: PublicKey): string {
  const cluster = window.adrena.cluster;
  return (
    SOLANA_EXPLORERS_OPTIONS[
      window.adrena.settings.solanaExplorer
    ].getWalletAddressUrl(address, cluster) ??
    SOLANA_EXPLORERS_OPTIONS['Solana Explorer'].getWalletAddressUrl(
      address,
      cluster,
    )
  );
}

// Thrown as error when a transaction fails
export class AdrenaTransactionError {
  constructor(
    public txHash: string | null,
    public readonly errorString: string,
  ) {}

  public setTxHash(txHash: string): void {
    this.txHash = txHash;
  }
}

export function parseTransactionError(
  adrenaProgram: Program<Adrena>,
  err: unknown,
) {
  //
  // Check for Adrena Program Errors
  //

  //
  // Errors looks differently depending if they fail on preflight or executing the tx
  // Also depends what type of error, quite a lot of cases
  //

  if (err instanceof AdrenaTransactionError) {
    return err;
  }

  const errStr: string | null = (() => {
    const errCodeHex = (() => {
      const match = String(err).match(/custom program error: (0x[\da-fA-F]+)/);

      return match?.length ? parseInt(match[1], 16) : null;
    })();

    const errCodeDecimals = (() => {
      const match = safeJSONStringify(err).match(/"Custom": ([0-9]+)/);

      return match?.length ? parseInt(match[1], 10) : null;
    })();

    const errName = (() => {
      const match = safeJSONStringify(err).match(/Error Code: ([a-zA-Z]+)/);
      const match2 = safeJSONStringify(err).match(/"([a-zA-Z]+)"\n[ ]+]/);

      if (match?.length) return match[1];

      return match2?.length ? match2[1] : null;
    })();

    const errMessage = (() => {
      const match = safeJSONStringify(err).match(
        /Error Message: ([a-zA-Z '\.]+)"/,
      );

      return match?.length ? match[1] : null;
    })();

    if (safeJSONStringify(err) === '"BlockhashNotFound"') {
      return 'BlockhashNotFound';
    }

    // Not enough SOL to pay for the transaction
    if (safeJSONStringify(err).includes('InsufficientFundsForRent')) {
      return 'Not enough SOL to pay for transaction fees and rent';
    }

    const idlError = adrenaProgram.idl.errors.find(({ code, name }) => {
      if (errName !== null && errName === name) return true;
      if (errCodeHex !== null && errCodeHex === code) return true;
      if (errCodeDecimals !== null && errCodeDecimals === code) return true;

      return false;
    });

    if (idlError?.msg) return idlError?.msg;

    if (errName && errMessage) return `${errName}: ${errMessage}`;
    if (errName) return `Error name: ${errName}`;
    if (errCodeHex) return `Error code: ${errCodeHex}`;
    if (errCodeDecimals === 1) return `Insufficient SOL`;
    if (errCodeDecimals) return `Error code: ${errCodeDecimals}`;

    return 'Unknown error';
  })();

  // Transaction failed in preflight, there is no TxHash
  return new AdrenaTransactionError(null, errStr);
}

export function tryPubkey(p: string): PublicKey | null {
  try {
    return new PublicKey(p);
  } catch {
    return null;
  }
}

export async function isAccountInitialized(
  connection: Connection,
  address: PublicKey,
): Promise<boolean> {
  return !!(await connection.getAccountInfo(address));
}

export async function getTokenAccountBalanceNullable(
  connection: Connection,
  ata: PublicKey,
): Promise<BN | null> {
  try {
    return new BN((await connection.getTokenAccountBalance(ata)).value.amount);
  } catch {
    return null;
  }
}

export function sleep(timeInMs: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, timeInMs));
}

// Make sure the WSOL ATA is created and having enough tokens
export async function createPrepareWSOLAccountInstructions({
  amount,
  connection,
  owner,
  wsolATA,
}: {
  amount: BN;
  connection: Connection;
  owner: PublicKey;
  wsolATA: PublicKey;
}) {
  const currentWSOLBalance =
    (await getTokenAccountBalanceNullable(connection, wsolATA)) ?? new BN(0);

  const instructions: TransactionInstruction[] = [
    createAssociatedTokenAccountIdempotentInstruction(
      owner,
      wsolATA,
      owner,
      NATIVE_MINT,
    ),
  ];

  // enough WSOL available
  if (amount.isZero() || currentWSOLBalance >= amount) {
    return instructions;
  }

  return [
    ...instructions,

    // Transfer missing tokens
    SystemProgram.transfer({
      fromPubkey: owner,
      toPubkey: wsolATA,
      lamports: amount.sub(currentWSOLBalance).toNumber(),
    }),

    // Sync
    createSyncNativeInstruction(wsolATA),
  ];
}

export function createCloseWSOLAccountInstruction({
  wsolATA,
  owner,
}: {
  wsolATA: PublicKey;
  owner: PublicKey;
}): TransactionInstruction {
  return createCloseAccountInstruction(wsolATA, owner, owner);
}

export function getAbbrevNickname(nickname: string, maxLength: number = 16) {
  if (nickname.length <= maxLength) return nickname;

  return `${nickname.slice(0, maxLength - 2)}..`;
}

export function getAbbrevWalletAddress(address: string, length: number = 6) {
  return `${address.slice(0, length)}...${address.slice(address.length - length)}`;
}

export const generateColorFromString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

export function formatMilliseconds(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  milliseconds -= seconds * 1000;
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  milliseconds -= minutes * 1000 * 60;
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  milliseconds -= hours * 1000 * 60 * 60;
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  let formatted = '';

  if (days) {
    formatted = `${days}d`;
  }

  if (hours || formatted.length) {
    const h = `${hours < 0 ? '-' : ''}${
      Math.abs(hours) < 10 ? `0${Math.abs(hours)}` : Math.abs(hours)
    }`;

    formatted = `${formatted}${formatted.length ? ' ' : ''}${h}h`;
  }

  if (minutes || formatted.length) {
    const m = `${minutes < 0 ? '-' : ''}${
      Math.abs(minutes) < 10 ? `0${Math.abs(minutes)}` : Math.abs(minutes)
    }`;

    formatted = `${formatted}${formatted.length ? ' ' : ''}${m}m`;
  }

  if (seconds || formatted.length) {
    const s = `${seconds < 0 ? '-' : ''}${
      Math.abs(seconds) < 10 ? `0${Math.abs(seconds)}` : Math.abs(seconds)
    }`;

    formatted = `${formatted}${formatted.length ? ' ' : ''}${s}s`;
  }

  return formatted;
}

// Handle specific case of jitoSOL and WBTC
export function getTokenImage(token: Token): ImageRef | string {
  if (token.symbol === 'JITOSOL') return solLogo;
  if (token.symbol === 'WBTC') return btcLogo;

  return token.image;
}

// Handle specific case of jitoSOL and WBTC
export function getTokenSymbol(symbol: string): string {
  if (symbol === 'JITOSOL') return 'SOL';
  if (symbol === 'WBTC') return 'BTC';

  return symbol;
}

export function formatAndFilterLockedStakes(
  lockedStakes: LockedStakeExtended[] | [],
  lockedStakesTokenSymbol: string,
): LockedStakeExtended[] | null {
  return (
    (lockedStakes
      .map((stake, index) => ({
        ...stake,
        index,
        tokenSymbol: lockedStakesTokenSymbol,
      }))
      .filter((x) => !x.stakeTime.isZero()) as LockedStakeExtended[]) ?? null
  );
}

export function getAdxLockedStakes(
  stakingAccounts: WalletStakingAccounts | null,
): LockedStakeExtended[] | null {
  return formatAndFilterLockedStakes(
    (stakingAccounts?.ADX?.lockedStakes as LockedStakeExtended[]) ?? [],
    'ADX',
  );
}

export function getAlpLockedStakes(
  stakingAccounts: WalletStakingAccounts | null,
): LockedStakeExtended[] | null {
  return formatAndFilterLockedStakes(
    (stakingAccounts?.ALP?.lockedStakes as LockedStakeExtended[]) ?? [],
    'ALP',
  );
}

// Generate fake ALP staking data for testing the change from locked to liquid ALP
export function generateFakeAlpStakingData(
  totalAmount: number = 88000,
): LockedStakeExtended[] {
  const now = Math.floor(Date.now() / 1000); // Current time in seconds

  // Duration in seconds for different lock periods
  const durations = {
    '90d': 90 * 24 * 60 * 60,
    '180d': 180 * 24 * 60 * 60,
    '360d': 360 * 24 * 60 * 60,
    '540d': 540 * 24 * 60 * 60,
  };

  // Distribution based on logs - approximately:
  // 540 days: ~87,500 ALP (major portion)
  // 360 days: ~16,000 ALP
  // 180 days: ~150,000 ALP
  // 90 days: ~2,500 ALP

  const stakes: LockedStakeExtended[] = [];

  // Create example stakes for each duration
  const createStake = (
    amount: number,
    durationKey: keyof typeof durations,
    indexOffset: number = 0,
  ): LockedStakeExtended => {
    const durationSeconds = durations[durationKey];
    return {
      amount: new BN(amount * 1000000), // Convert to native units with 6 decimals
      stakeTime: new BN(now - 30 * 24 * 60 * 60), // Started 30 days ago
      claimTime: new BN(0), // Not claimed
      endTime: new BN(now + durationSeconds), // Ends after the lock duration
      lockDuration: new BN(durationSeconds),
      rewardMultiplier: 0,
      lmRewardMultiplier: 0,
      voteMultiplier: 0,
      qualifiedForRewardsInResolvedRoundCount: 0,
      amountWithRewardMultiplier: new BN(0),
      amountWithLmRewardMultiplier: new BN(0),
      resolved: 0,
      padding2: [0, 0, 0, 0, 0, 0, 0],
      id: new BN(indexOffset + 1),
      earlyExit: 0,
      padding3: [0, 0, 0, 0, 0, 0, 0],
      earlyExitFee: new BN(0),
      isGenesis: 0,
      padding4: [0, 0, 0, 0, 0, 0, 0],
      genesisClaimTime: new BN(0),
      index: indexOffset,
      tokenSymbol: 'ALP',
    };
  };

  // Distribution matching what we saw in logs
  if (totalAmount >= 80000) {
    // For large amounts, create multiple stakes with different durations
    stakes.push(createStake(Math.round(totalAmount * 0.34), '540d', 0)); // 34% in 540 days
    stakes.push(createStake(Math.round(totalAmount * 0.06), '360d', 1)); // 6% in 360 days
    stakes.push(createStake(Math.round(totalAmount * 0.58), '180d', 2)); // 58% in 180 days
    stakes.push(createStake(Math.round(totalAmount * 0.02), '90d', 3)); // 2% in 90 days
  } else {
    // For smaller amounts, just create one stake with 540 days
    stakes.push(createStake(totalAmount, '540d', 0));
  }

  return stakes;
}

// i.e percentage = -2 (for -2%)
// i.e percentage = 5 (for 5%)
export function applySlippage(nb: BN, percentage: number): BN {
  const negative = percentage < 0 ? true : false;

  // Do x10_000 so percentage can be up to 4 decimals
  const percentageBN = new BN(
    (negative ? percentage * -1 : percentage) * 10_000,
  );

  const delta = nb.mul(percentageBN).divRound(new BN(10_000 * 100));

  return negative ? nb.sub(delta) : nb.add(delta);
}

export async function makeApiRequest(path: string) {
  try {
    const response = await fetch(`https://min-api.cryptocompare.com/${path}`);
    return response.json();
  } catch (error: unknown) {
    throw new Error(`CryptoCompare request error: ${String(error)}`);
  }
}

// Generate a symbol ID from a pair of the coins
export function generateSymbol(
  exchange: string,
  fromSymbol: string,
  toSymbol: string,
) {
  const short = `${fromSymbol}/${toSymbol}`;
  return {
    short,
    full: `${exchange}:${short}`,
  };
}

export function parseFullSymbol(fullSymbol: string) {
  const match = fullSymbol.match(/^(\w+):(\w+)\/(\w+)$/);
  if (!match) {
    return null;
  }

  return {
    exchange: match[1],
    fromSymbol: match[2],
    toSymbol: match[3],
  };
}

export const verifyRpcConnection = async (rpc: string) => {
  if (!rpc) return false;
  try {
    const connection = await new Connection(rpc)?.getVersion();

    return !!connection;
  } catch {
    return false;
  }
};

export function getGMT(): number {
  return (new Date().getTimezoneOffset() / 60) * -1;
}

export const verifyIfValidUrl = (url: string) => {
  const regExUrl = new RegExp(/^(http|https):\/\/[^ "]+$/);

  return regExUrl.test(url);
};

/*** Helper methods to parse anchor discriminators ***/

export function getAccountDiscriminator(name: string): Buffer {
  return Buffer.from(sha256(`account:${name}`).slice(0, 8));
}

export function getMethodDiscriminator(name: string): Buffer {
  return Buffer.from(sha256(`global:${name}`).slice(0, 8));
}

export function calculateCappedFeeForExitEarly(
  lockedStake: LockedStakeExtended,
): number {
  const timeElapsed =
    Date.now() -
    (lockedStake.endTime.toNumber() * 1000 -
      lockedStake.lockDuration.toNumber() * 1000);
  const timeRemaining =
    lockedStake.lockDuration.toNumber() * 1000 - timeElapsed;
  const feeRate = timeRemaining / (lockedStake.lockDuration.toNumber() * 1000);

  // Cap the fee rate between the lower and upper caps

  return Math.min(Math.max(feeRate, 0.15), 0.4);
}

export function estimateLockedStakeEarlyExitFee(
  lockedStake: LockedStakeExtended,
  stakeTokenMintDecimals: number,
): number {
  return (
    nativeToUi(lockedStake.amount, stakeTokenMintDecimals) *
    calculateCappedFeeForExitEarly(lockedStake)
  );
}

export function formatDate(date: string | number | Date) {
  const d = new Date(date);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  let hour = d.getHours();

  const minute = d.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'pm' : 'am';

  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'

  return `${month} ${day},${hour}:${minute}${ampm}`;
}

export function formatDate2Digits(date: string | number | Date) {
  const d = new Date(date);
  const month = d.toLocaleString('en-US', { month: 'short' });
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');

  return `${month} ${day},${hour}:${minute}`;
}

// Utility for encoding object to Base64 URL-safe
export const encodeBase64Url = (params: {
  [key: string]: string | number | boolean;
}) => {
  const json = JSON.stringify(params);
  const base64 = Buffer.from(json).toString('base64');
  // Convert Base64 to Base64 URL (replacing +, / with -, _ and removing =)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Utility for decoding Base64 URL-safe back to object
export const decodeBase64Url = (encodedParams: string) => {
  // Convert Base64 URL to regular Base64 (replacing -, _ with +, /)
  const base64 = encodedParams.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(base64, 'base64').toString();
  return JSON.parse(json);
};

export const getCustodyByMint = async (mint: string) => {
  const custody = await window.adrena.client.getCustodyByPubkey(
    new PublicKey(mint),
  );
  return custody;
};

export const getDaysBetweenDates = (date1: Date, date2: Date) => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getHoursBetweenDates = (date1: Date, date2: Date) => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
};

export const getMinutesBetweenDates = (date1: Date, date2: Date) => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
};

export const getSecondsBetweenDates = (date1: Date, date2: Date) => {
  const diffTime = date2.getTime() - date1.getTime();
  return Math.floor((diffTime % (1000 * 60)) / 1000);
};

export function getFullTimeDifference(date1: Date, date2: Date) {
  return {
    days: getDaysBetweenDates(date1, date2),
    hours: getHoursBetweenDates(date1, date2),
    minutes: getMinutesBetweenDates(date1, date2),
    seconds: getSecondsBetweenDates(date1, date2),
  };
}

export function formatTimeDifferenceFromTotalSeconds(totalSeconds: number) {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export function formatTimeDifference(diff: {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}) {
  if (diff.days > 0) {
    return `${diff.days.toString().padStart(2, '0')}d ${diff.hours.toString().padStart(2, '0')}h ${diff.minutes.toString().padStart(2, '0')}m`;
  }

  if (diff.hours > 0) {
    return `${diff.hours.toString().padStart(2, '0')}h ${diff.minutes.toString().padStart(2, '0')}m ${diff.seconds.toString().padStart(2, '0')}s`;
  }

  return `${diff.minutes.toString().padStart(2, '0')}m ${diff.seconds.toString().padStart(2, '0')}s`;
}

export function formatSecondsToTimeDifference(totalSeconds: number) {
  const days = Math.floor(totalSeconds / (24 * 60 * 60));
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (days > 0) {
    return `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
  }

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
  }

  return `${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

export const isValidPublicKey = (key: string) => {
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
};

export const calculateWeeksPassed = (startDate: Date): number => {
  return Math.floor(
    (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7),
  );
};

export function formatSnapshotTimestamp(
  snapshot_timestamp: string[],
  period: string | null,
) {
  return snapshot_timestamp.map((time: string) => {
    if (period === '1d') {
      return new Date(time).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
      });
    }

    if (period === '7d') {
      return new Date(time).toLocaleString('en-US', {
        day: 'numeric',
        month: 'numeric',
        hour: 'numeric',
      });
    }

    if (period === '1M' || period === '3M' || period === '6M') {
      return new Date(time).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'numeric',
        timeZone: 'UTC',
      });
    }

    throw new Error('Invalid period');
  });
}

// Validation function
export const validateTPSLInputs = ({
  takeProfitInput,
  setTakeProfitError,
  stopLossInput,
  setStopLossError,
  markPrice,
  position,
}: {
  takeProfitInput: number | null;
  setTakeProfitError?: (value: boolean) => void;
  stopLossInput: number | null;
  setStopLossError?: (value: boolean) => void;
  markPrice: number | null;
  position: PositionExtended;
}) => {
  let isValid = true;

  // Validate Stop Loss
  if (stopLossInput !== null && markPrice !== null) {
    if (position.side === 'long') {
      if (stopLossInput >= markPrice) {
        setStopLossError?.(true); // 'Stop Loss must be below current price for long positions'
        isValid = false;
      } else if (
        position.liquidationPrice != null &&
        stopLossInput <= position.liquidationPrice
      ) {
        setStopLossError?.(true); // 'Stop Loss must be above liquidation price'
        isValid = false;
      } else {
        setStopLossError?.(false);
      }
    } else if (position.side === 'short') {
      if (stopLossInput <= markPrice) {
        setStopLossError?.(true); // 'Stop Loss must be above current price for short positions'
        isValid = false;
      } else if (
        position.liquidationPrice != null &&
        stopLossInput >= position.liquidationPrice
      ) {
        setStopLossError?.(true); // 'Stop Loss must be below liquidation price'
        isValid = false;
      } else {
        setStopLossError?.(false);
      }
    }
  } else {
    setStopLossError?.(false);
  }

  // Validate Take Profit
  if (takeProfitInput !== null && markPrice !== null) {
    if (position.side === 'long' && takeProfitInput <= markPrice) {
      setTakeProfitError?.(true); // 'Take Profit must be above current price for long positions'
      isValid = false;
    } else if (position.side === 'short' && takeProfitInput >= markPrice) {
      setTakeProfitError?.(true); // 'Take Profit must be below current price for short positions'
      isValid = false;
    } else {
      setTakeProfitError?.(false);
    }
  } else {
    setTakeProfitError?.(false);
  }

  return isValid;
};

export function getNonUserProfile(pubkey: string): UserProfileExtended {
  return {
    version: -1, // Not a real profile
    pubkey: PublicKey.default, // Not a real profile
    nickname: getAbbrevWalletAddress(pubkey),
    createdAt: Date.now(),
    owner: new PublicKey(pubkey),
    referrerProfile: null,
    claimableReferralFeeUsd: 0,
    totalReferralFeeUsd: 0,
    profilePicture: 0,
    wallpaper: 0,
    title: 0,
    achievements: [],
    team: 0,
    continent: 0,
  };
}

export function hexStringToByteArray(hexString: string): number[] {
  // Remove '0x' prefix if present
  const cleanHex = hexString.startsWith('0x') ? hexString.slice(2) : hexString;

  // Ensure the hex string is 128 characters (64 bytes)
  if (cleanHex.length !== 128) {
    throw new Error('Hex string must be 128 characters long (64 bytes)');
  }

  // Convert hex string to byte array
  const byteArray: number[] = [];

  for (let i = 0; i < cleanHex.length; i += 2) {
    const byte = parseInt(cleanHex.slice(i, i + 2), 16);

    if (isNaN(byte)) {
      throw new Error('Invalid hex string');
    }

    byteArray.push(byte);
  }

  return byteArray;
}

export function getTokenSymbolFromChartFormat(tokenSymbol: string) {
  return tokenSymbol.slice(0, tokenSymbol.length - ' / USD'.length);
}

// Small structure used to ease usage of top accounts
export function jupInstructionToTransactionInstruction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ix: any,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: new PublicKey(ix.programId),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    keys: ix.accounts.map((acc: any) => ({
      pubkey: new PublicKey(acc.pubkey),
      isSigner: acc.isSigner,
      isWritable: acc.isWritable,
    })),
    data: Buffer.from(ix.data, 'base64'),
  });
}

export async function getJupiterApiQuote({
  inputMint,
  outputMint,
  amount,
  swapSlippage,
}: {
  inputMint: PublicKey;
  outputMint: PublicKey;
  amount: BN | number;
  swapSlippage: number;
}): Promise<QuoteResponse> {
  const ret = await window.adrena.jupiterApiClient.quoteGet({
    inputMint: inputMint.toBase58(),
    outputMint: outputMint.toBase58(),
    amount: typeof amount === 'number' ? amount : amount.toNumber(),
    slippageBps: swapSlippage * 100,
    swapMode: 'ExactIn',
    maxAccounts: 20, // Limit the amount of accounts to avoid exceeding max instruction size
  });

  console.log('JupiterQuote', ret);

  return ret;
}
