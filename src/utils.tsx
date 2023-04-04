import { BN, Program } from '@project-serum/anchor';
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import Link from 'next/link';
import { ReactNode } from 'react';
import { Store } from 'react-notifications-component';

import { Perpetuals } from '@/target/perpetuals';

import { TOKEN_INFO_LIBRARY } from './constant';
import { Custody } from './types';

export const DISPLAY_NUMBER_PRECISION = 6;
export const INPUT_PRECISION = 8;

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

export function getCustodyLiquidity(
  custody: Custody,
  tokenCurrentPrice: number,
): number {
  return (
    (tokenCurrentPrice *
      Number(custody.assets.owned.sub(custody.assets.locked))) /
    10 ** custody.decimals
  );
}

export function formatPriceInfo(price: number, displayPlusSymbol = false) {
  // If the price is very low, display it as it is, to not display $0
  if (price < 0.00999999999999 && price > 0) {
    return `$${price}`;
  }

  if (price < 0) {
    return `-$${formatNumber(price * -1, 2)}`;
  }

  return `$${formatNumber(price, 2, displayPlusSymbol)}`;
}

export function formatPercentage(nb: number | null): string {
  if (nb === null) {
    return '-';
  }

  return `${Number(nb / 100).toFixed(2)}%`;
}

export function nativeToUi(nb: BN, decimals: number): number {
  return nb.toNumber() / 10 ** decimals;
}

export function uiToNative(nb: number, decimals: number): BN {
  return new BN(Math.floor(nb * 10 ** decimals));
}

export function getTokenNameByMint(mint: PublicKey): string {
  return TOKEN_INFO_LIBRARY[mint.toBase58()]?.name ?? 'Unknown';
}

export function addNotification({
  title,
  message,
  type,
  duration = 'regular',
}: {
  title: string;
  type?: 'success' | 'danger' | 'info';
  message?: ReactNode;
  duration?: 'fast' | 'regular' | 'long';
}) {
  Store.addNotification({
    title,
    message,
    type,
    container: 'bottom-right',
    animationIn: ['animate__animated', 'animate__fadeIn'],
    animationOut: ['animate__animated', 'animate__fadeOut'],
    dismiss: {
      duration: { fast: 1_000, regular: 5_000, long: 10_000 }[duration],
      onScreen: false,
      pauseOnHover: true,
      showIcon: true,
      click: false,
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
      if (error.txHash) {
        return (
          <Link
            href={get_tx_explorer(error.txHash)}
            target="_blank"
            className="underline"
          >
            View transaction
          </Link>
        );
      }

      return String(error.errorString);
    }

    return typeof error === 'object'
      ? JSON.stringify(error, null, 2)
      : String(error);
  })();

  addNotification({
    ...params,
    type: 'danger',
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
    public readonly txHash: string | null,
    public readonly errorString: string,
  ) {}
}

export function parseTransactionError(
  adrenaProgram: Program<Perpetuals>,
  err: unknown,
) {
  // Check for Adrena Program Errors
  //
  const match = String(err).match(/custom program error: (0x[\da-fA-F]+)/);

  if (match) {
    const errorCode = parseInt(match[1], 16);

    const idlError = adrenaProgram.idl.errors.find(
      ({ code }) => code === errorCode,
    );

    // Transaction failed in preflight, there is no TxHash
    return new AdrenaTransactionError(
      null,
      idlError?.msg ?? `Error code: ${errorCode}`,
    );
  }

  return new AdrenaTransactionError(null, JSON.stringify(err, null, 2));
}
