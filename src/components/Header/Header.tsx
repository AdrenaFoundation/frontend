import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import logo from '../../../public/images/logo.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeperator from '../common/Menu/MenuSeperator';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header({
  userProfile,
}: {
  userProfile: UserProfileExtended | null | false;
}) {
  const { pathname } = useRouter();
  const router = useRouter();

  const PageLink = (url: string, title: string) => (
    <Link
      className={twMerge(
        'cursor-pointer hover:text-txtregular text-txtfade shrink-0 whitespace-nowrap font-normal text-sm',
        pathname === url && 'text-white',
      )}
      href={url}
    >
      {title}
    </Link>
  );

  const clusterSwitchEnabled = false;

  return (
    <div className="fixed top-0 w-full flex flex-row items-center justify-between p-2 px-7 border border-b-gray-200 z-50 bg-gray-300/85 backdrop-blur-md">
      <div className="flex flex-row items-center gap-6">
        <Link className="font-bold uppercase relative" href="/">
          {
            <Image
              src={logo}
              className="shrink-0"
              alt="logo"
              width={100}
              height={25}
            />
          }

          {window.adrena.cluster === 'devnet' ? (
            <span className="absolute font-specialmonster text-blue-500 bottom-[-0.7em] right-[-0.5em]">
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
                  'cursor-pointer hover:text-txtregular text-txtfade shrink-0 whitespace-nowrap font-normal text-sm',
                  pathname === 'swap_alp' && 'text-white',
                )}
              >
                Buy
              </p>
            }
            className="w-fit"
          >
            <MenuItems>
              <MenuItem href={'/swap_alp'} linkClassName="p-2">
                <div className="flex flex-row gap-2 items-center">
                  <div className="p-1 bg-blue-500 rounded-full">
                    <p className="flex items-center justify-center text-xs font-specialmonster h-4 w-4">
                      ALP
                    </p>
                  </div>
                  ALP
                </div>
              </MenuItem>
              <MenuSeperator />
              <MenuItem
                href={'https://www.orca.so/'}
                target="_blank"
                linkClassName="p-2"
              >
                <div className="flex flex-row gap-2 items-center">
                  <div className="p-1 bg-red-500 rounded-full">
                    <p className="flex items-center justify-center text-xs font-specialmonster h-4 w-4">
                      ADX
                    </p>
                  </div>
                  ADX on Orca
                </div>
              </MenuItem>
            </MenuItems>
          </Menu>

          {/* {PageLink('/referral', 'Referral')} */}

          {PageLink('/onchain_info', 'Onchain Info')}

          {window.adrena.cluster === 'devnet'
            ? PageLink('/faucet_devnet', 'Faucet')
            : null}

          {PageLink('/backoffice', 'Backoffice')}

          {/* {PageLink('https://www.gitbook.com/', 'Docs')} */}
        </>
      </div>

      <div className="flex flex-row items-center gap-3">
        <Link href="/trade">
          <Button title="Trade now" />
        </Link>

        <WalletAdapter userProfile={userProfile} />

        {clusterSwitchEnabled ? (
          <Menu
            trigger={
              <Button
                title={window.adrena.cluster}
                variant="outline"
                rightIcon={chevronDownIcon}
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
        ) : null}
      </div>
    </div>
  );
}
