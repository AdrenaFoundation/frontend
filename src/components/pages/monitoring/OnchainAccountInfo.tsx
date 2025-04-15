import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import { getAccountExplorer } from '@/utils';

export default function OnchainAccountInfo({
  address,
  className,
  iconClassName,
  noAddress = false,
  shorten = false,
  addressClassName,
  shortenSize = 4,
}: {
  address: PublicKey;
  className?: string;
  iconClassName?: string;
  noAddress?: boolean;
  shorten?: boolean;
  addressClassName?: string;
  shortenSize?: number;
}) {
  return (
    <Link
      href={getAccountExplorer(address)}
      target="_blank"
      className={twMerge(
        'flex items-center hover:opacity-100 hover:underline opacity-50 cursor-pointer',
        className,
      )}
    >
      {noAddress ? null : (
        <span className={twMerge("text-xs sm:text-[0.9em]", addressClassName)}>
          {shorten
            ? `${address.toBase58().slice(0, shortenSize)}..${address
              .toBase58()
              .slice(-shortenSize)}`
            : address.toBase58()}
        </span>
      )}

      <Image
        className={twMerge('ml-1 w-[6px] h-[6px]', iconClassName)}
        src="/images/Icons/arrow-sm-45.svg"
        alt="external link icon"
        width="6"
        height="6"
      />
    </Link>
  );
}
