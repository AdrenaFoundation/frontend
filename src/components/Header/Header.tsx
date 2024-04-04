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
import MenuSeperator from '../common/Menu/MenuSeperator';
import WalletAdapter from '../WalletAdapter/WalletAdapter';
import useRPC from '@/hooks/useRPC';
import IConfiguration from '@/config/IConfiguration';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';

export default function Header({
  userProfile,
  PAGES,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
}) {
  const { pathname } = useRouter();
  const router = useRouter();
  const [cookies] = useCookies(['activeRPC']);
  const [activeRPC, setActiveRPC] = useState<string>(
    cookies?.activeRPC || 'Solana RPC',
  );
  const [isAutoRPC, setIsAutoRPC] = useState<boolean>(false);

  const [rpcOptions] = useRPC();

  const clusterSwitchEnabled = false;

  useEffect(() => {
    const isBetterRPCOption = rpcOptions.some(
      (rpcOption: any) =>
        rpcOptions.find((opt: any) => opt.name === activeRPC).latency >
        rpcOption.latency,
    );

    console.log('isBetterOption', isBetterRPCOption);

    if (isBetterRPCOption && isAutoRPC) {
      const betterOption = rpcOptions.find(
        (rpcOption: any) =>
          rpcOptions.find((opt: any) => opt.name === activeRPC).latency >
          rpcOption.latency,
      ).name;

      setActiveRPC(betterOption);
    }
  }, [rpcOptions]);

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

        {PAGES.map((page) => {
          return (
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
          );
        })}
      </div>

      <div className="flex flex-row items-center gap-3">
        <Link href="/trade">
          <Button title="Trade now" disabled={pathname === '/trade'} />
        </Link>

        <WalletAdapter userProfile={userProfile} />
        <Menu
          trigger={
            <Button
              leftIcon={settingsIcon}
              variant="outline"
              className="px-1 w-8 h-8"
              leftIconClassName="w-4 h-4"
            />
          }
          openMenuClassName="right-0 rounded-lg w-[300px] bg-gray-300 border border-gray-200 p-3"
          disableOnClickInside={true}
        >
          <p className="text-xs mb-3 opacity-50">RPC endpoints</p>

          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              <p className="text-sm font-medium">Automatic</p>
              <InfoAnnotation
                text={
                  <p>
                    Automatically selects the best RPC endpoint based on latency
                  </p>
                }
                className="w-3"
              />
            </div>
            <div
              className={twMerge(
                'w-[16px] h-[16px] rounded-[4px] bg-gray-200 hover:bg-gray-400 transition duration-300 cursor-pointer',
                isAutoRPC && 'bg-green-300 hover:bg-green-300',
              )}
              onClick={() => {
                setIsAutoRPC(!isAutoRPC);
              }}
            />
          </div>

          <div className="w-full h-[1px] bg-gray-200 my-3" />

          <ul
            className={twMerge(
              'flex flex-col gap-2 opacity-100 transition-opacity duration-300',
              isAutoRPC && 'opacity-30 pointer-events-none',
            )}
          >
            {rpcOptions.map((rpcOption: any) => (
              <li
                className={twMerge(
                  'flex flex-row justify-between items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300',
                  rpcOption.name === activeRPC && 'opacity-100',
                )}
                onClick={() => {
                  setActiveRPC(rpcOption.name);
                }}
              >
                <div className="flex flex-row gap-2 items-center">
                  <input
                    type="radio"
                    checked={rpcOption.name === activeRPC}
                    onChange={() => {
                      setActiveRPC(rpcOption.name);
                    }}
                  />
                  <p className="text-sm font-medium">{rpcOption.name}</p>
                </div>
                <div className="flex flex-row gap-2 items-center">
                  <div
                    className={twMerge(
                      'w-[5px] h-[5px] rounded-full ',
                      (() => {
                        if (rpcOption.latency < 100) return 'bg-green-300';
                        if (rpcOption.latency < 500) return 'bg-yellow-300';
                        return 'bg-red-300';
                      })(),
                    )}
                  />
                  <p className="text-xs opacity-50 font-mono">
                    {rpcOption.latency}ms
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Menu>

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
