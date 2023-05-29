import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header() {
  const { pathname } = useRouter();
  const router = useRouter();
  const [isThreeDotMenuOpen, setIsThreeDotMenuOpen] = useState<boolean>(false);

  const PageLink = (url: string, title: string) => (
    <Link
      className={twMerge(
        'mt-2',
        'lg:mt-0',
        'lg:ml-6',
        'cursor-pointer',
        'hover:text-txtregular',
        'text-txtfade',
        'shrink-0',
        'whitespace-nowrap',
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
        'flex-col',
        'p-4',
        'shrink-0',
        'lg:h-20',
        'lg:flex-row',
        'lg:p-0',
      )}
    >
      <Link
        className="font-bold lg:ml-6 lg:mr-6 uppercase mb-2 lg:mb-0 relative"
        href="/"
      >
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img src="images/logo.svg" className="h-12 shrink-0" alt="logo" />
        }

        {window.adrena.cluster === 'devnet' ? (
          <span className="absolute font-specialmonster text-highlight bottom-[-0.6em] right-[-0.5em]">
            Devnet
          </span>
        ) : null}
      </Link>

      <>
        {PageLink('/dashboard', 'Dashboard')}
        {PageLink('/earn', 'Earn')}
        {PageLink('/buy', 'Buy')}
        {PageLink('/onchain_info', 'Onchain Info')}
        {window.adrena.cluster === 'devnet'
          ? PageLink('/faucet_devnet', 'Faucet')
          : null}
        {PageLink('https://www.gitbook.com/', 'Docs')}
      </>

      <Button
        className="bg-highlight lg:ml-auto w-full lg:w-20 mt-2 lg:mt-0"
        title={<Link href="/trade">Trade</Link>}
        onClick={() => {
          // nothing
        }}
      />

      <WalletAdapter className="lg:ml-4 w-full lg:w-auto mt-2 lg:mt-0" />

      <div className="relative">
        <Button
          className="border-0 lg:ml-4 lg:mr-4 p-0"
          title={
            <Image
              src="/images/dots.png"
              alt="three dots icon"
              width="20"
              height="20"
            />
          }
          onClick={() => {
            setIsThreeDotMenuOpen(!isThreeDotMenuOpen);
          }}
        />

        <Menu
          className="right-6 mt-2"
          open={isThreeDotMenuOpen}
          onClose={() => {
            setIsThreeDotMenuOpen(false);
          }}
        >
          <div className="text-sm pb-2 mb-2">Clusters</div>

          <Button
            className="whitespace-nowrap text-md text-txtfade hover:text-white border-0 p-0"
            title={window.adrena.cluster === 'devnet' ? 'mainnet' : 'devnet'}
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
        </Menu>
      </div>
    </div>
  );
}
