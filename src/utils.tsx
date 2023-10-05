import { BN, Program } from '@project-serum/anchor';
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
  if (price < 0.00999999999999 && price > 0) {
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
}: {
  title: string;
  type?: 'success' | 'error' | 'info';
  message?: ReactNode;
  duration?: 'fast' | 'regular' | 'long';
}) {
  const content = message ? (
    <div className="flex flex-col">
      <div className="border-b border-white/10 pb-2 bold">{title}</div>
      <div className="mt-4 text-sm">{message}</div>
    </div>
  ) : (
    title
  );

  toast[type](content, {
    position: 'bottom-right',
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
        success: '#216a2a',
        error: '#ad2f2f',
        info: '#28638e',
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

    return typeof error === 'object'
      ? JSON.stringify(error, null, 2)
      : String(error);
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
  // Check for Adrena Program Errors
  //

  //
  // Errors looks differently depending if they fail on preflight or executing the tx
  //
  const matchPreflightError = String(err).match(
    /custom program error: (0x[\da-fA-F]+)/,
  );

  const matchTxError = (() => {
    // wrap with try/catch in case JSON.stringify fails
    try {
      return JSON.stringify(err, null, 2).match(/"Custom": ([0-9]+)/);
    } catch {
      return null;
    }
  })();

  let errorCode: number | null = null;

  if (matchPreflightError) {
    errorCode = parseInt(matchPreflightError[1], 16);
  } else if (matchTxError) {
    errorCode = parseInt(matchTxError[1], 10);
  }

  if (errorCode === null) {
    return new AdrenaTransactionError(null, JSON.stringify(err, null, 2));
  }

  const idlError = adrenaProgram.idl.errors.find(
    ({ code }) => code === errorCode,
  );

  // Transaction failed in preflight, there is no TxHash
  return new AdrenaTransactionError(
    null,
    idlError?.msg ?? `Error code: ${errorCode}`,
  );
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
