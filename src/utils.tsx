import { BN, Program } from '@coral-xyz/anchor';
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
import Link from 'next/link';
import { ReactNode } from 'react';
import { toast } from 'react-toastify';

import { Perpetuals } from '@/target/perpetuals';

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
  displayPlusSymbol = false,
): string {
  const str = Number(nb.toFixed(precision)).toLocaleString(undefined, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  });

  if (displayPlusSymbol && nb > 0) {
    return `+${str}`;
  }

  return str;
}

export function formatPriceInfo(
  price: number | null | undefined,
  displayPlusSymbol = false,
  decimals = 2,
) {
  if (price === null || typeof price === 'undefined') {
    return '-';
  }

  // If the price is very low, display it as it is, to not display $0
  if (price < 10 ** -decimals && price > 0) {
    return `$${price}`;
  }

  if (price < 0) {
    return `-$${formatNumber(price * -1, decimals)}`;
  }

  return `$${formatNumber(price, decimals, displayPlusSymbol)}`;
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

export function nativeToUi(nb: BN, decimals: number): number {
  return nb.toNumber() / 10 ** decimals;
}

export function uiToNative(nb: number, decimals: number): BN {
  return new BN(Math.floor(nb * 10 ** decimals));
}

export function getTokenNameByMint(mint: PublicKey): string {
  return window.adrena.config.tokensInfo[mint.toBase58()]?.symbol ?? 'Unknown';
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
      <div className="mt-4 text-xs font-mono">{message}</div>
    </div>
  ) : (
    <p className="text-sm font-mono font-medium">{title}</p>
  );

  toast[type](content, {
    position,
    autoClose: { fast: 1_000, regular: 2_000, long: 10_000 }[duration],
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
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
    <Link href={get_tx_explorer(txHash)} target="_blank" className="underline">
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
              href={get_tx_explorer(error.txHash)}
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
export function get_tx_explorer(txHash: string): string {
  return `https://explorer.solana.com/tx/${txHash}?cluster=devnet`;
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
  adrenaProgram: Program<Perpetuals>,
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

export function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(address.length - 6)}`;
}

export function getDaysRemaining(startDate: BN, totalDays: BN) {
  const start = new Date(startDate.toNumber() * 1000).getTime();

  const today = Date.now();

  const daysElapsed = Math.floor((today - start) / 1000 / 3600 / 24);

  const daysRemaining =
    Math.floor(totalDays.toNumber() / 3600 / 24) - daysElapsed;

  return daysRemaining;
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
