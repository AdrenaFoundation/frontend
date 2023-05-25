import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import { AdrenaClient } from '@/AdrenaClient';

import Button from '../common/Button/Button';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header({ client }: { client: AdrenaClient | null }) {
  const { pathname } = useRouter();

  const PageLink = (url: string, title: string) => (
    <Link
      className={twMerge(
        'mt-2',
        'sm:mt-0',
        'sm:ml-6',
        'cursor-pointer',
        'hover:text-txtregular',
        'text-txtfade',
        pathname === url && 'text-white',
      )}
      href={url}
    >
      {title}
    </Link>
  );

  return (
    <div
      className={twMerge(
        'flex',
        'bg-main',
        'w-full',
        'items-center',
        'border-b',
        'border-grey',
        'sm:h-20',
        'flex-col',
        'sm:flex-row',
        'p-4',
        'sm:p-0',
        'shrink-0',
      )}
    >
      <Link
        className="font-bold sm:ml-6 sm:mr-6 uppercase mb-2 sm:mb-0"
        href="/"
      >
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img src="images/logo.svg" className="h-12" alt="logo" />
        }
      </Link>

      <>
        {PageLink('/dashboard', 'Dashboard')}
        {PageLink('/earn', 'Earn')}
        {PageLink('/buy', 'Buy')}
        {PageLink('/onchain_info', 'Onchain Info')}
        {client?.cluster === 'devnet'
          ? PageLink('/faucet_devnet', 'Faucet')
          : null}
        {PageLink('https://www.gitbook.com/', 'Docs')}
      </>

      <Button
        className="bg-highlight sm:ml-auto w-full sm:w-20 mt-2 sm:mt-0"
        title={<Link href="/trade">Trade</Link>}
        onClick={() => {
          // nothing
        }}
      />

      <WalletAdapter className="sm:ml-4 sm:mr-6 w-full sm:w-auto mt-2 sm:mt-0" />
    </div>
  );
}
