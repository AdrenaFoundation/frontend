import { BN, Program, Wallet } from '@coral-xyz/anchor';
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
import { toast } from 'sonner';
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

export const getOrdinalSuffix = (num: number): string => {
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) return 'st';
  if (j === 2 && k !== 12) return 'nd';
  if (j === 3 && k !== 13) return 'rd';
  return 'th';
};

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
  nb: number | string | null | undefined,
  maxDecimals = 2,
): string {
  if (typeof nb === 'string') {
    nb = Number(nb);
  }

  if (nb === null || nb === undefined || isNaN(Number(nb))) {
    return '-';
  }

  if (nb < 1_000) return nb.toFixed(maxDecimals).toString();
  if (nb < 1_000_000) return `${(nb / 1_000).toFixed(maxDecimals)}K`;
  if (nb < 1_000_000_000) return `${(nb / 1_000_000).toFixed(maxDecimals)}M`;
  return `${(nb / 1_000_000_000).toFixed(maxDecimals)}B`;
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
  disableFriendReq: false,
  enableDialectNotifications: false,
  enableAdrenaNotifications: true,
  useSqrtScaleForVolumeAndFeeChart: true,
  lastSelectedTradingToken: '',
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
  toast[type](title, {
    classNames: {
      toast: {
        success: '!bg-green !border-white/20',
        error: '!bg-red !border-white/20',
        info: '!bg-inputcolor !border-white/10',
      }[type],
      title: '!!text-base',
      description: '!text-white/70',
      actionButton: 'action-button',
      cancelButton: 'cancel-button',
      closeButton: 'close-button',
    },
    description: message,
    duration:
      {
        fast: 1000,
        regular: 2000,
        long: 5000,
      }[duration] ?? 5000,
    position: position,
    style: {
      marginBottom: position.startsWith('bottom') ? '1.5rem' : '0',
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
  ) { }

  public setTxHash(txHash: string): void {
    this.txHash = txHash;
  }
}

// Custom error for Jupiter swap failures that can trigger retry/use native UI
export class JupiterSwapError extends AdrenaTransactionError {
  constructor(
    public readonly inputMint: string,
    public readonly outputMint: string,
    public readonly originalError?: unknown,
  ) {
    const errorMessage =
      'Jupiter swap failed during execution. You can use the native collateral token instead.';
    super(null, errorMessage);
  }
}

// Helper function to parse instruction error arrays
function parseInstructionErrorArray(err: unknown): {
  instructionIndex: number;
  errorDetails: unknown;
  customCode: number | null;
} | null {
  // Check if it's an InstructionError array like [3, {Custom: 1}]
  if (Array.isArray(err) && err.length === 2) {
    const [instructionIndex, errorDetails] = err;
    if (
      typeof instructionIndex === 'number' &&
      typeof errorDetails === 'object'
    ) {
      return {
        instructionIndex,
        errorDetails,
        customCode: (errorDetails as { Custom?: number })?.Custom ?? null,
      };
    }
  }
  return null;
}

// Helper function to parse instruction errors from string
function parseInstructionErrorFromString(errString: string): {
  instructionIndex: number;
  customCode: number;
} | null {
  // Try multiple patterns to match different InstructionError formats
  const patterns = [
    /"InstructionError":\s*\[([0-9]+),\s*\{[^}]*"Custom":\s*([0-9]+)[^}]*\}\]/,
    /InstructionError.*?\[([0-9]+).*?Custom.*?([0-9]+)/,
    /"InstructionError":\s*\[([0-9]+),\s*"Custom":\s*([0-9]+)\]/,
  ];

  for (const pattern of patterns) {
    const match = errString.match(pattern);
    if (match?.length) {
      return {
        instructionIndex: parseInt(match[1], 10),
        customCode: parseInt(match[2], 10),
      };
    }
  }
  return null;
}

// Helper function to parse program failure from logs
function parseProgramFailureFromLogsHelper(errorLogs?: string[]): {
  programId: string;
  errorMessage: string | null;
  isJupiter: boolean;
  isAdrena: boolean;
} | null {
  if (!errorLogs || errorLogs.length === 0) return null;

  // Look for the last program that failed
  for (let i = errorLogs.length - 1; i >= 0; i--) {
    const log = errorLogs[i];

    // Pattern: "Program <program_id> failed: <error>" or "Program <program_id> failed"
    const failedMatch = log.match(/Program ([A-Za-z0-9]+) failed(?:: (.+))?/);
    if (failedMatch) {
      const programId = failedMatch[1];
      const errorMessage = failedMatch[2];

      return {
        programId,
        errorMessage,
        isJupiter: programId.startsWith('JUP'),
        isAdrena: programId === '13gDzEXCdocbj8iAiqrScGo47NiSuYENGsRqi3SEAwet',
      };
    }
  }

  return null;
}

// Helper function to check for Jupiter-related logs
function hasJupiterLogsHelper(errorLogs?: string[]): boolean {
  const logsString = errorLogs?.join(' ') || '';
  return (
    logsString.includes('Jupiter') || logsString.includes('insufficient funds')
  );
}

// Helper function to handle instruction error arrays
function handleInstructionErrorArray(
  instructionErrorArray: {
    instructionIndex: number;
    errorDetails: unknown;
    customCode: number | null;
  },
  errorLogs?: string[],
): string | null {
  console.log('Detected InstructionError array:', instructionErrorArray);

  const hasJupiterLogsInError = errorLogs?.some(
    (log) => log.includes('Jupiter') && log.includes('insufficient funds'),
  );

  // Handle specific instruction errors based on index and custom code
  if (instructionErrorArray.customCode === 1) {
    // Custom: 1 is often "insufficient funds" in Jupiter swaps
    if (instructionErrorArray.instructionIndex >= 3 || hasJupiterLogsInError) {
      // Jupiter instructions are typically at index 3+ or we have Jupiter logs
      console.log('Detected Jupiter swap execution error from simulation');
      return 'JUPITER_SWAP_EXECUTION_ERROR';
    }
    return 'Insufficient funds to complete this transaction. Please check your wallet balance.';
  }

  if (instructionErrorArray.customCode === 2) {
    return 'Invalid instruction data. Please try again.';
  }

  if (instructionErrorArray.customCode === 3) {
    return 'Account validation failed. Please check your inputs.';
  }

  return `Instruction ${instructionErrorArray.instructionIndex} failed with error code ${instructionErrorArray.customCode}.`;
}

// Helper function to handle Adrena program errors
function handleAdrenaProgramError(
  parseProgramFailureFromLogs: {
    programId: string;
    errorMessage: string | null;
    isJupiter: boolean;
    isAdrena: boolean;
  },
  adrenaProgram: Program<Adrena>,
): string | null {
  if (!parseProgramFailureFromLogs.isAdrena) return null;

  console.log('Detected Adrena program failure - not a Jupiter error');

  // Extract the human-readable error message from the logs
  if (parseProgramFailureFromLogs.errorMessage) {
    // Try to extract the actual error message from the program error
    const customErrorMatch = parseProgramFailureFromLogs.errorMessage.match(
      /custom program error: 0x([0-9a-f]+)/i,
    );
    if (customErrorMatch) {
      const errorCode = parseInt(customErrorMatch[1], 16);

      // Use the IDL to get the proper error message
      try {
        const idlError = adrenaProgram.idl.errors?.find(
          (err) => err.code === errorCode,
        );
        if (idlError?.msg) {
          return idlError.msg;
        }
      } catch (e) {
        console.warn('Failed to get error message from IDL:', e);
      }

      // Fallback to generic error message if IDL lookup fails
      return `Program error: ${parseProgramFailureFromLogs.errorMessage}`;
    }

    // If we can't parse the custom error, return the original error message
    return parseProgramFailureFromLogs.errorMessage;
  }

  return null;
}

// Helper function to check for simulation-specific errors
function checkSimulationErrors(errString: string): string | null {
  // Only treat as simulation failure if the error message starts with "Simulation failed:"
  // This prevents catching AdrenaTransactionError messages that contain "Simulation failed" as part of the error
  if (
    errString.includes('"Simulation failed:') ||
    errString.includes('Simulation failed:')
  ) {
    return 'Transaction simulation failed. Please check your inputs and try again.';
  }

  if (
    errString.includes('"Transaction simulation failed') ||
    errString.includes('Transaction simulation failed')
  ) {
    return 'Transaction simulation failed. Please check your inputs and try again.';
  }

  return null;
}

// Helper function to check for Solana system errors
function checkSolanaSystemErrors(errString: string): string | null {
  const systemErrors = [
    {
      pattern: 'InsufficientFundsForRent',
      message:
        'Not enough SOL to pay for transaction fees and rent. Please add more SOL to your wallet.',
    },
    {
      pattern: 'InsufficientFunds',
      message:
        'Insufficient funds to complete this transaction. Please check your wallet balance.',
    },
    {
      pattern: 'AccountInUse',
      message: 'Account is already in use. Please try again.',
    },
    {
      pattern: 'AccountNotAssigned',
      message: 'Account not assigned to this program.',
    },
    {
      pattern: 'AccountAlreadyInitialized',
      message: 'Account is already initialized.',
    },
    {
      pattern: 'AccountNotInitialized',
      message: 'Account is not initialized.',
    },
    {
      pattern: 'AccountLoadedTwice',
      message: 'Account loaded twice in transaction.',
    },
    {
      pattern: 'AccountDataSizeChanged',
      message: 'Account data size changed during transaction.',
    },
    {
      pattern: 'AccountDataTooSmall',
      message: 'Account data too small for instruction.',
    },
    {
      pattern: 'AccountDataTooLarge',
      message: 'Account data too large for instruction.',
    },
    { pattern: 'AccountBorrowFailed', message: 'Account borrow failed.' },
    {
      pattern: 'AccountBorrowOutstanding',
      message: 'Account borrow outstanding.',
    },
    { pattern: 'AccountNotRentExempt', message: 'Account is not rent exempt.' },
    {
      pattern: 'AccountDiscriminatorMismatch',
      message: 'Account discriminator mismatch.',
    },
    {
      pattern: 'AccountDiscriminatorNotFound',
      message: 'Account discriminator not found.',
    },
    {
      pattern: 'AccountDiscriminatorAlreadySet',
      message: 'Account discriminator already set.',
    },
    {
      pattern: 'AccountDidNotSerialize',
      message: 'Account did not serialize.',
    },
    {
      pattern: 'AccountDidNotDeserialize',
      message: 'Account did not deserialize.',
    },
    {
      pattern: 'AccountNotEnoughKeys',
      message: 'Not enough keys provided for instruction.',
    },
    {
      pattern: 'AccountNotEnoughSigners',
      message: 'Not enough signers provided for instruction.',
    },
    {
      pattern: 'AccountNotEnoughWritableSigners',
      message: 'Not enough writable signers provided for instruction.',
    },
    {
      pattern: 'AccountNotEnoughWritableAccounts',
      message: 'Not enough writable accounts provided for instruction.',
    },
  ];

  for (const { pattern, message } of systemErrors) {
    if (errString.includes(pattern)) {
      return message;
    }
  }

  return null;
}

// Helper function to check for SPL Token errors
function checkSPLTokenErrors(errString: string): string | null {
  const tokenErrors = [
    {
      pattern: 'TokenInsufficientFunds',
      message: 'Insufficient token balance for this transaction.',
    },
    {
      pattern: 'TokenNotRentExempt',
      message: 'Token account is not rent exempt.',
    },
    { pattern: 'TokenInvalidMint', message: 'Invalid token mint.' },
    { pattern: 'TokenInvalidOwner', message: 'Invalid token owner.' },
    {
      pattern: 'TokenInvalidAccountData',
      message: 'Invalid token account data.',
    },
    {
      pattern: 'TokenInvalidInstruction',
      message: 'Invalid token instruction.',
    },
    { pattern: 'TokenInvalidState', message: 'Invalid token state.' },
    { pattern: 'TokenInvalidDelegate', message: 'Invalid token delegate.' },
    { pattern: 'TokenInvalidAuthority', message: 'Invalid token authority.' },
    { pattern: 'TokenInvalidAmount', message: 'Invalid token amount.' },
  ];

  for (const { pattern, message } of tokenErrors) {
    if (errString.includes(pattern)) {
      return message;
    }
  }

  return null;
}

// Helper function to extract error codes and names
function extractErrorCodesAndNames(
  err: unknown,
  errString: string,
): {
  errCodeHex: number | null;
  errCodeDecimals: number | null;
  errName: string | null;
  errMessage: string | null;
} {
  const errCodeHex = (() => {
    const match = String(err).match(/custom program error: (0x[\da-fA-F]+)/);
    return match?.length ? parseInt(match[1], 16) : null;
  })();

  const errCodeDecimals = (() => {
    const match = errString.match(/"Custom": ([0-9]+)/);
    return match?.length ? parseInt(match[1], 10) : null;
  })();

  const errName = (() => {
    const match = errString.match(/Error Code: ([a-zA-Z]+)/);
    const match2 = errString.match(/"([a-zA-Z]+)"\n[ ]+]/);
    if (match?.length) return match[1];
    return match2?.length ? match2[1] : null;
  })();

  const errMessage = (() => {
    const match = errString.match(/Error Message: ([a-zA-Z '\.]+)"/);
    return match?.length ? match[1] : null;
  })();

  return { errCodeHex, errCodeDecimals, errName, errMessage };
}

export function parseTransactionError(
  adrenaProgram: Program<Adrena>,
  err: unknown,
  errorLogs?: string[],
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

  if (err instanceof JupiterSwapError) {
    return err;
  }

  console.log('parseTransactionError input:', err);
  console.log('parseTransactionError stringified:', safeJSONStringify(err));
  if (errorLogs) {
    console.log('parseTransactionError logs:', errorLogs);
  }

  const errStr: string | null = (() => {
    const errString = safeJSONStringify(err);

    // This will enable automatic retry
    if (errString === '"BlockhashNotFound"') {
      return 'BlockhashNotFound';
    }

    // Handle InstructionError arrays (common in simulation errors)
    const instructionErrorArray = parseInstructionErrorArray(err);
    if (instructionErrorArray) {
      return handleInstructionErrorArray(instructionErrorArray, errorLogs);
    }

    // Check for Jupiter swap execution errors
    const instructionError = parseInstructionErrorFromString(errString);

    // Parse logs to understand which program actually failed (only if logs are available)
    const parseProgramFailureFromLogs =
      parseProgramFailureFromLogsHelper(errorLogs);

    // Check if there are Jupiter-related logs (for context, not necessarily the failure)
    const hasJupiterLogs = hasJupiterLogsHelper(errorLogs);

    console.log('Program failure analysis:', {
      instructionError,
      parseProgramFailureFromLogs,
      hasJupiterLogs,
      errString,
      logsString: errorLogs?.join(' '),
    });

    // Determine if this is a Jupiter swap error based on which program actually failed
    if (parseProgramFailureFromLogs) {
      if (parseProgramFailureFromLogs.isJupiter) {
        console.log('Detected Jupiter program failure');
        return 'JUPITER_SWAP_EXECUTION_ERROR';
      } else if (parseProgramFailureFromLogs.isAdrena) {
        const adrenaError = handleAdrenaProgramError(
          parseProgramFailureFromLogs,
          adrenaProgram,
        );
        if (adrenaError) return adrenaError;
        // Let it fall through to normal error handling
      }
    } else if (instructionError && hasJupiterLogs) {
      // Fallback: If we don't have logs but have instruction error and Jupiter logs,
      // and it's a Jupiter-specific error code (1 = insufficient funds), treat as Jupiter error
      if (instructionError.customCode === 1) {
        console.log(
          'Detected Jupiter swap error (fallback - no logs available)',
        );
        return 'JUPITER_SWAP_EXECUTION_ERROR';
      }
    }

    // Check for simulation-specific errors
    const simulationError = checkSimulationErrors(errString);
    if (simulationError) return simulationError;

    // Check for specific Solana system errors
    const solanaError = checkSolanaSystemErrors(errString);
    if (solanaError) return solanaError;

    // Check for Adrena program specific errors
    const { errCodeHex, errCodeDecimals, errName, errMessage } =
      extractErrorCodesAndNames(err, errString);

    // Try to find Adrena program error
    const idlError = adrenaProgram.idl.errors.find(({ code, name }) => {
      if (errName !== null && errName === name) return true;
      if (errCodeHex !== null && errCodeHex === code) return true;
      if (errCodeDecimals !== null && errCodeDecimals === code) return true;
      return false;
    });

    if (idlError?.msg) return idlError?.msg;

    // Check for common SPL Token errors
    const splTokenError = checkSPLTokenErrors(errString);
    if (splTokenError) return splTokenError;

    // Fallback to more specific error messages
    if (errName && errMessage) {
      return `${errName}: ${errMessage}`;
    }

    if (errName) {
      return `Error: ${errName}`;
    }

    if (errCodeHex) {
      return `Program error: ${errCodeHex}`;
    }

    if (errCodeDecimals) {
      return `Program error: ${errCodeDecimals}`;
    }

    // Last resort - provide a helpful generic message
    return 'Transaction failed. Please check your inputs and try again.';
  })();

  // Special handling for Jupiter swap execution errors
  if (errStr === 'JUPITER_SWAP_EXECUTION_ERROR') {
    return new JupiterSwapError(
      'unknown', // We don't have the mints in this context
      'unknown',
      err,
    );
  }

  // Transaction failed in preflight, there is no TxHash
  return new AdrenaTransactionError(null, errStr || 'Transaction failed');
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
  const accountInfo = await connection.getAccountInfo(address);

  if (!accountInfo) {
    return false;
  }

  const rentExemptionAmount =
    await connection.getMinimumBalanceForRentExemption(accountInfo.data.length);

  return accountInfo.lamports >= rentExemptionAmount;
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
    const h = `${hours < 0 ? '-' : ''}${Math.abs(hours) < 10 ? `0${Math.abs(hours)}` : Math.abs(hours)
      }`;

    formatted = `${formatted}${formatted.length ? ' ' : ''}${h}h`;
  }

  if (minutes || formatted.length) {
    const m = `${minutes < 0 ? '-' : ''}${Math.abs(minutes) < 10 ? `0${Math.abs(minutes)}` : Math.abs(minutes)
      }`;

    formatted = `${formatted}${formatted.length ? ' ' : ''}${m}m`;
  }

  if (seconds || formatted.length) {
    const s = `${seconds < 0 ? '-' : ''}${Math.abs(seconds) < 10 ? `0${Math.abs(seconds)}` : Math.abs(seconds)
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

    if (
      period === '1M' ||
      period === '3M' ||
      period === '6M' ||
      period === '1Y'
    ) {
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
}): Promise<QuoteResponse | null> {
  try {
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
  } catch {
    return null;
  }
}

export function isPartialClose(activePercent: number | null) {
  return (
    typeof activePercent === 'number' && activePercent > 0 && activePercent < 1
  );
}

export function periodModeToSeconds(periodMode: '1d' | '7d' | '1D' | '7D' | '1M' | '3M' | '6M' | '1Y' | 'All Time') {
  switch (periodMode) {
    case '1d':
      return 1 * 24 * 60 * 60; // 1 day in seconds
    case '1D':
      return 1 * 24 * 60 * 60; // 1 day in seconds
    case '7d':
      return 7 * 24 * 60 * 60; // 7 days in seconds
    case '7D':
      return 7 * 24 * 60 * 60; // 7 days in seconds
    case '1M':
      return 30 * 24 * 60 * 60; // 30 days in seconds
    case '3M':
      return 90 * 24 * 60 * 60; // 90 days in seconds
    case '6M':
      return 180 * 24 * 60 * 60; // 180 days in seconds
    case '1Y':
      return 365 * 24 * 60 * 60; // 365 days in seconds
    case 'All Time':
      return Number.MAX_SAFE_INTEGER; // Effectively no limit
    default:
      throw new Error('Invalid period mode');
  }
}

// Simple helper to extract address from Anchor Wallet type
// For Redux wallet state, use selectWalletAddress from @/selectors/walletSelectors
export function getWalletAddress(wallet: Wallet | null | undefined): string | null {
  if (!wallet) return null;

  try {
    if (!wallet.publicKey) return null;
    return wallet.publicKey.toBase58();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error getting wallet address:', error);
    }
    return null;
  }
}
