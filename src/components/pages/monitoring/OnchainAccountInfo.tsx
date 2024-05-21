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
        <span className="text-[0.9em]">
          {shorten
            ? `${address.toBase58().slice(0, 4)}..${address
                .toBase58()
                .slice(-4)}`
            : address.toBase58()}
        </span>
      )}

      <Image
        className={twMerge('ml-1 w-3 h-3', iconClassName)}
        src="/images/external-link-logo.png"
        alt="external link icon"
        width="36"
        height="36"
      />
    </Link>
  );
}
