import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import arrowIcon from '../../../public/images/arrow-right.svg';
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
  PAGES,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
}) {
  const { pathname } = useRouter();
  const router = useRouter();

  const clusterSwitchEnabled = false;

  return (
    <div className="fixed top-0 w-full flex flex-row items-center justify-between p-3 px-7 border border-b-gray-200 z-50 bg-gray-300/85 backdrop-blur-md">
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

        {/* {window.adrena.cluster === 'devnet'
          ? PageLink('/faucet_devnet', 'Faucet')
          : null} */}

        {PAGES.map((page) =>
          page.name !== 'Buy' ? (
            <Link
              href={page.link}
              className={twMerge(
                'font-normal text-sm opacity-50 hover:opacity-100 transition-opacity duration-300',
                pathname === page.link ? 'opacity-100' : '',
              )}
              key={page.name}
            >
              {page.name}
            </Link>
          ) : (
            <Menu
              trigger={
                <p
                  className={twMerge(
                    'cursor-pointer hover:text-txtregular text-txtfade shrink-0 whitespace-nowrap font-normal text-sm',
                    pathname === '/swap_alp' && 'text-white',
                  )}
                >
                  Buy
                </p>
              }
              key={page.name}
              openMenuClassName="w-fit"
            >
              <MenuItems>
                <MenuItem href={'/swap_alp'} linkClassName="group p-2">
                  <div className="flex flex-row gap-2 items-center">
                    <div className="relative flex items-center justify-center p-1 bg-blue-500 border border-transparent rounded-full group-hover:bg-transparent group-hover:border-gray-200 transition-all duration-300 overflow-hidden h-7 w-7">
                      <p className="absolute text-sm font-specialmonster group-hover:opacity-0 group-hover:translate-y-1 transition-all duration-300">
                        ALP
                      </p>
                      <p className="absolute -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Image
                          src={arrowIcon}
                          alt="arrow"
                          width={12}
                          height={12}
                        />
                      </p>
                    </div>
                    ALP
                  </div>
                </MenuItem>
                <MenuSeperator />
                <MenuItem
                  href={'https://www.orca.so/'}
                  target="_blank"
                  linkClassName="group p-2 pr-4"
                >
                  <div className="flex flex-row gap-2 items-center">
                    <div className="relative flex items-center justify-center p-1 bg-red-500 border border-transparent rounded-full group-hover:bg-transparent group-hover:border-gray-200 transition-all duration-300 overflow-hidden h-7 w-7">
                      <p className="absolute text-sm font-specialmonster group-hover:opacity-0 group-hover:translate-y-1 transition-all duration-300">
                        ADX
                      </p>
                      <p className="absolute -translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                        <Image
                          src={arrowIcon}
                          alt="arrow"
                          className="-rotate-45"
                          width={12}
                          height={12}
                        />
                      </p>
                    </div>
                    ADX on Orca
                  </div>
                </MenuItem>
              </MenuItems>
            </Menu>
          ),
        )}
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
