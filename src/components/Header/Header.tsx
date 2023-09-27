import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeperator from '../common/Menu/MenuSeperator';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header() {
  const { pathname } = useRouter();
  const router = useRouter();

  const PageLink = (url: string, title: string) => (
    <Link
      className={twMerge(
        'mt-2 lg:mt-0 lg:ml-6 cursor-pointer hover:text-txtregular text-txtfade shrink-0 whitespace-nowrap font-normal text-sm',
        pathname === url && 'text-white',
      )}
      href={url}
    >
      {title}
    </Link>
  );

  return (
    <div className="flex flex-row items-center justify-between p-3 px-7 border border-b-gray-200">
      <div className="flex flex-row items-center gap-3">
        <Link className="font-bold  uppercase mb-2 lg:mb-0 relative" href="/">
          {
            // eslint-disable-next-line @next/next/no-img-element
            <img src="images/logo.svg" className="h-12 shrink-0" alt="logo" />
          }

          {window.adrena.cluster === 'devnet' ? (
            <span className="absolute font-specialmonster text-blue-500 bottom-[-0.6em] right-[-0.5em]">
              Devnet
            </span>
          ) : null}
        </Link>

        <>
          {PageLink('/dashboard', 'Dashboard')}
          {PageLink('/earn', 'Earn')}

          <Menu
            trigger={
              <p
                className={twMerge(
                  'mt-2 lg:mt-0 lg:ml-6 cursor-pointer hover:text-txtregular text-txtfade shrink-0 whitespace-nowrap font-normal text-sm',
                  pathname === 'swap_alp' && 'text-white',
                )}
              >
                Buy
              </p>
            }
            className="w-fit"
          >
            <MenuItems>
              <MenuItem href={'/swap_alp'}>ALP</MenuItem>
              <MenuItem href={'https://www.orca.so/'} target="_blank">
                ADX on Orca
              </MenuItem>
            </MenuItems>
          </Menu>
          {PageLink('/onchain_info', 'Onchain Info')}
          {window.adrena.cluster === 'devnet'
            ? PageLink('/faucet_devnet', 'Faucet')
            : null}
          {PageLink('https://www.gitbook.com/', 'Docs')}
        </>
      </div>

      <div className="flex flex-row items-center gap-3">
        <Link href="/trade">
          <Button title="Trade now" />
        </Link>

        <WalletAdapter />

        <Menu
          trigger={
            <Button
              title={window.adrena.cluster}
              variant="outline"
              rightIcon="/images/icons/chevron-down.svg"
            />
          }
        >
          <MenuItems>
            <MenuItem
              selected={window.adrena.cluster === 'devnet'}
              onClick={() => {
                router.replace({
                  query: {
                    ...router.query,
                    cluster: 'devnet',
                  },
                });
              }}
            >
              Devnet
            </MenuItem>
            <MenuSeperator />
            <MenuItem
              selected={window.adrena.cluster === 'mainnet'}
              onClick={() => {
                router.replace({
                  query: {
                    ...router.query,
                    cluster: 'mainnet',
                  },
                });
              }}
            >
              Mainnet
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
}
