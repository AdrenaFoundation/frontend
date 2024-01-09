import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import { getAccountExplorer } from '@/utils';

export default function OnchainAccountInfo({
  className,
  address,
  shorten = false,
}: {
  className?: string;
  address: PublicKey;
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
      <span className="text-[0.9em]">
        {shorten
          ? `${address.toBase58().slice(0, 4)}..${address.toBase58().slice(-4)}`
          : address.toBase58()}
      </span>

      <Image
        className="ml-1"
        src="/images/external-link-logo.png"
        alt="external link icon"
        width="12"
        height="12"
      />
    </Link>
  );
}
