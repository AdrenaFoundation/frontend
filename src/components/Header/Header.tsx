import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { twMerge } from 'tailwind-merge';

import { UserProfileExtended } from '@/types';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import settingsIcon from '../../../public/images/Icons/settings.svg';
import logo from '../../../public/images/logo.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import Settings from '../Settings/Settings';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header({
  userProfile,
  PAGES,
  activeRpc,
  setActiveRpc,
  customRpcUrl,
  setCustomRpcUrl,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
  activeRpc: string;
  setActiveRpc: (rpc: string) => void;
  setCustomRpcUrl: (rpc: string | null) => void;
  customRpcUrl: string | null;
}) {
  const { pathname } = useRouter();
  const router = useRouter();

  const clusterSwitchEnabled = false;

  return (
    <div className="w-full flex flex-row items-center justify-between p-3 px-7 border-b border-b-bcolor bg-secondary z-50">
      <div className="flex flex-row items-center gap-6">
        <Link className="font-bold uppercase relative" href="/">
          {
            <Image
              src={logo}
              className={twMerge(
                'shrink-0 relative',
                window.adrena.cluster === 'devnet' ? 'bottom-1' : null,
              )}
              alt="logo"
              width={100}
              height={25}
            />
          }

          {window.adrena.cluster === 'devnet' ? (
            <span className="absolute font-special text-blue-500 bottom-[-1.1em] right-[-0.5em]">
              Devnet
            </span>
          ) : null}
        </Link>

        {/* {window.adrena.cluster === 'devnet'
          ? PageLink('/faucet_devnet', 'Faucet')
          : null} */}

        {PAGES.map((page) => {
          return (
            <Link
              href={page.link}
              className={twMerge(
                'text-sm opacity-75 hover:opacity-100 transition-opacity duration-300',
                pathname === page.link ? 'opacity-100' : '',
              )}
              key={page.name}
            >
              <h5>{page.name}</h5>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-row items-center gap-3">
        <Link href="/trade">
          <Button title="Trade now" disabled={pathname === '/trade'} />
        </Link>

        <WalletAdapter userProfile={userProfile} />

        <Settings
          activeRpc={activeRpc}
          setActiveRpc={setActiveRpc}
          setCustomRpcUrl={setCustomRpcUrl}
          customRpcUrl={customRpcUrl}
        />

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

              <MenuSeparator />

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
