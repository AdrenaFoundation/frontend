import { PublicKey } from '@solana/web3.js';
import { twMerge } from 'tailwind-merge';

export default function OnchainAccountInfo({
  className,
  address,
}: {
  className?: string;
  address: PublicKey;
}) {
  return (
    <div
      className={twMerge(
        'flex items-center hover:text-white cursor-pointer text-txtfade text-[0.9em]',
        className,
      )}
    >
      {address.toBase58()}
    </div>
  );
}
