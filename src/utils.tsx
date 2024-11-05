import { BN, Program } from '@coral-xyz/anchor';
import { sha256 } from '@noble/hashes/sha256';
import * as Sentry from '@sentry/nextjs';
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
import { Context } from 'chartjs-plugin-datalabels';
import { Font } from 'chartjs-plugin-datalabels/types/options';
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
import {
  ImageRef,
  LimitedString,
  LockedStakeExtended,
  Token,
  U128Split,
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

export function findATAAddressSync(
  wallet: PublicKey,
  mint: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [wallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

export function formatNumber(
  nb: number,
  precision: number,
  minimumFractionDigits = 0,
  precisionIfPriceDecimalsBelow = 6,
): string {
  // Determine the absolute value for precision checks
  const absNb = Math.abs(nb);
  // If price is below decimals precision, display up to 6 decimals (override by minimumFractionDigits)
  if (absNb < 10 ** -precision) precision = Math.max(precisionIfPriceDecimalsBelow, minimumFractionDigits);

  return Number(nb.toFixed(precision)).toLocaleString(undefined, {
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

export function formatNumberShort(
  nb: number | string,
  maxDecimals = 2,
): string {
  // Added maxDecimals parameter
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
}: {
  title: string;
  type?: 'success' | 'error' | 'info';
  message?: ReactNode;
  duration?: 'fast' | 'regular' | 'long';
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
    position: 'bottom-left',
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
  } catch (e) {
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

    console.log('error with cause:', (error as Error)?.cause);

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

    try {
      Sentry.captureException(err);
    } catch {
      // ignore
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

export function getAbbrevNickname(nickname: string) {
  if (nickname.length <= 16) return nickname;

  return `${nickname.slice(0, 14)}..`;
}

export function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(address.length - 6)}`;
}

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
export function getTokenImage(token: Token): ImageRef {
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

/* Chart js datalabels plugin utils, may export in different file if many come along */

export function getDatasetBackgroundColor(context: Context) {
  return (context.dataset.backgroundColor as string) ?? '';
}

export function getFontSizeWeight(context: Context): Font {
  return {
    size: context.chart.width < 512 ? 8 : 14,
    weight: 'bold',
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
