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
}: {
  address: PublicKey;
  className?: string;
  iconClassName?: string;
  noAddress?: boolean;
  shorten?: boolean;
}) {
  return (
    <Link
      href={getAccountExplorer(address)}
      target="_blank"
      className={twMerge(
        'flex items-center hover:opacity-100 opacity-50 cursor-pointer',
        className,
      )}
    >
      {noAddress ? null : (
        <span className="text-xs sm:text-[0.9em]">
          {shorten
            ? `${address.toBase58().slice(0, 3)}..${address
              .toBase58()
              .slice(-3)}`
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
