import { BN, Program } from '@coral-xyz/anchor';
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
import { ROUND_MIN_DURATION_SECONDS } from './constant';
import { WalletStakingAccounts } from './hooks/useWalletStakingAccounts';
import { LimitedString, LockedStakeExtended, U128Split } from './types';

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

export function formatNumber(nb: number, precision: number): string {
  // If price is below decimals precision, display up to 6 decimals
  if (nb < 10 ** -precision) precision = 6;

  return Number(nb.toFixed(precision)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
}

export function formatPriceInfo(
  price: number | null | undefined,
  decimals = 2,
) {
  if (price === null || typeof price === 'undefined') {
    return '-';
  }

  if (price == 0) {
    return `$${formatNumber(price, decimals)}`;
  }

  if (price < 0) {
    return `-$${formatNumber(price * -1, decimals)}`;
  }

  return `$${formatNumber(price, decimals)}`;
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
  return new BN(Math.floor(nb * 10 ** decimals));
}

export function getTokenNameByMint(mint: PublicKey): string {
  return window.adrena.config.tokensInfo[mint.toBase58()]?.symbol ?? 'Unknown';
}

export function getNextStakingRoundStartTime(timestamp: BN): Date {
  const d = new Date();

  d.setTime((timestamp.toNumber() + ROUND_MIN_DURATION_SECONDS) * 1000);

  return d;
}

export function addNotification({
  title,
  message,
  type = 'info',
  duration = 'regular',
  position = 'top-right',
}: {
  title: string;
  type?: 'success' | 'error' | 'info';
  message?: ReactNode;
  duration?: 'fast' | 'regular' | 'long';
  position?: 'top-right' | 'top-center' | 'top-left' | 'bottom-right';
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
    position,
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
        info: 'var(--color-blue-500)',
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

// TODO: handle devnet/mainnet
export function getTxExplorer(txHash: string): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
}

// TODO: handle devnet/mainnet
export function getAccountExplorer(address: PublicKey): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
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

    Sentry.captureException(err);
    console.debug('Error parsing: error:', safeJSONStringify(err));
    console.debug('Error parsing: errCodeHex: ', errCodeHex);
    console.debug('Error parsing: errCodeDecimals', errCodeDecimals);
    console.debug('Error parsing: errName', errName);
    console.debug('Error parsing: errMessage', errMessage);

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
    if (errCodeDecimals) return `Error code: ${errCodeDecimals}`;

    return 'Unknown error';
  })();

  // Transaction failed in preflight, there is no TxHash
  return new AdrenaTransactionError(null, errStr);
}

export async function isATAInitialized(
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
  if (nickname.length < 20) return nickname;

  return `${nickname.slice(0, 17)}...`;
}

export function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(address.length - 6)}`;
}

export function formatMilliseconds(milliseconds: number): string {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));

  let formatted = '';

  if (days) {
    formatted = `${days}d`;
  }

  if (hours || formatted.length) {
    formatted = `${formatted}${formatted.length ? ' ' : ''}${hours}h`;
  }

  if (minutes || formatted.length) {
    formatted = `${formatted}${formatted.length ? ' ' : ''}${minutes}m`;
  }

  if (seconds || formatted.length) {
    formatted = `${formatted}${formatted.length ? ' ' : ''}${seconds}s`;
  }

  return formatted;
}

// in milliseconds
export function getLockedStakeRemainingTime(
  startDate: BN,
  lockDuration: BN, // in seconds
): number {
  const start = new Date(startDate.toNumber() * 1000).getTime();

  const endDate = start + lockDuration.toNumber() * 1000;

  return endDate - Date.now();
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
  } catch (error: any) {
    throw new Error(`CryptoCompare request error: ${error.status}`);
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
    size: context.chart.width < 512 ? 12 : 14,
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

export function calculateCappedFeeForExitEarly(
  lockedStake: LockedStakeExtended,
): number {
  const timeElapsed = Date.now() - lockedStake.stakeTime.toNumber();
  const timeRemaining = lockedStake.lockDuration.toNumber() - timeElapsed;
  const feeRate = timeRemaining / lockedStake.lockDuration.toNumber();

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
