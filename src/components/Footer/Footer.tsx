import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';

export default function Footer() {
  const router = useRouter();

  return (
    <div
      className={twMerge(
        'flex-col',
        'w-full',
        'h-auto',
        'pt-4',
        'pb-4',
        'bg-secondary',
        'border-t',
        'border-grey',
        'justify-center',
        'items-center',
        'shrink-0',
      )}
    >
      <div
        className={twMerge('flex', 'w-full', 'justify-center', 'items-center')}
      >
        <Link
          href="https://github.com/orgs/AdrenaDEX/repositories"
          target="_blank"
        >
          <Image
            className="hover:opacity-90 cursor-pointer"
            src="/images/github.svg"
            alt="github icon"
            width="25"
            height="25"
          />
        </Link>

        <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
          <Image
            className="hover:opacity-90 cursor-pointer ml-8"
            src="/images/twitter.svg"
            alt="twitter icon"
            width="20"
            height="20"
          />
        </Link>

        <Button
          className="border-0 ml-4 text-xs text-txtfade hover:text-white"
          title={`switch to ${
            window.adrena.cluster === 'devnet' ? 'mainnet' : 'devnet'
          }`}
          onClick={() => {
            router.replace({
              query: {
                ...router.query,
                cluster:
                  window.adrena.cluster === 'devnet' ? 'mainnet' : 'devnet',
              },
            });
          }}
        />

        <Link
          href="/terms_and_conditions"
          className="absolute right-6 text-txtfade hover:text-white"
        >
          Terms and conditions
        </Link>
      </div>
    </div>
  );
}
