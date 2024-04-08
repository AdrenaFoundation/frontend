import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import useRPC from '@/hooks/useRPC';
import { UserProfileExtended } from '@/types';
import { addNotification } from '@/utils';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import settingsIcon from '../../../public/images/Icons/settings.svg';
import logo from '../../../public/images/logo.svg';
import CheckBox from '../CheckBox/CheckBox';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeperator from '../common/Menu/MenuSeperator';
import InfoAnnotation from '../pages/monitoring/InfoAnnotation';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function Header({
  userProfile,
  PAGES,
  activeRPC,
  setActiveRPC,
  customRPCUrl,
  setCustomRPCUrl,
  isCustomRPC,
  setIsCustomRPC,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
  activeRPC: string;
  setActiveRPC: (rpc: string) => void;
  setCustomRPCUrl: (rpc: string) => void;
  customRPCUrl: string;
  setIsCustomRPC: (isCustomRPC: boolean) => void;
  isCustomRPC: boolean;
}) {
  const { pathname } = useRouter();
  const router = useRouter();
  const [cookies, setCookies] = useCookies([
    'activeRPC',
    'isAutoRPC',
    'isCustomRPC',
    'customRPC',
  ]);

  const [customRPC, setCustomRPC] = useState<string>(customRPCUrl ?? '');
  const [isAutoRPC, setIsAutoRPC] = useState<boolean>(
    cookies?.isAutoRPC === 'true',
  );
  const [isEditCustomRPCMode, setIsEditCustomRPCMode] =
    useState<boolean>(false);

  const [rpcOptions] = useRPC({
    isCustomRPC,
    customRPCUrl,
  });

  const clusterSwitchEnabled = false;

  useEffect(() => {
    const activeRPCLatency = rpcOptions.find(
      (rpcOption) => rpcOption.name === activeRPC,
    )?.latency;

    if (!activeRPCLatency) return;

    const isBetterRPCOption = rpcOptions.some(
      (rpcOption) => activeRPCLatency > (rpcOption?.latency ?? 100000),
    );

    console.log('isBetterRPCOption', isBetterRPCOption);

    if (isBetterRPCOption && isAutoRPC) {
      const betterOption = rpcOptions.find(
        (rpcOption) => activeRPCLatency > (rpcOption?.latency ?? 100000),
      )?.name;

      console.log('betterOption', betterOption);
      if (!betterOption) return;

      changeRPCOption(betterOption);
    }
  }, [rpcOptions]);

  const changeRPCOption = (rpc: string) => {
    setActiveRPC(rpc);
    setCookies('activeRPC', rpc);
    setCookies('isCustomRPC', false);
    setIsCustomRPC(false);
    setIsEditCustomRPCMode(false);
  };

  const saveCustomRPCUrl = () => {
    // TODO: check if customRPC is a valid URL
    const regExUrl = new RegExp(
      // eslint-disable-next-line no-useless-escape
      /^(http|https):\/\/[^ "]+$/,
    );
    if (customRPC !== '' && !regExUrl.test(customRPC)) {
      alert('Invalid URL');
      setCustomRPC(customRPCUrl);
      return;
    }
    setCustomRPCUrl(customRPC);
    setCookies('customRPC', customRPC);
    setIsEditCustomRPCMode(false);

    addNotification({
      title: 'Custom RPC endpoint saved',
      duration: 'fast',
      position: 'bottom-right',
    });
  };

  console.log('customRPC', customRPC);

  return (
    <div className="fixed top-0 w-full flex flex-row items-center justify-between p-3 px-7 border border-b-gray-200 z-50 bg-gray-300/85 backdrop-blur-md">
      <div className="flex flex-row items-center gap-6">
        <Link className="font-bold uppercase relative" href="/">
          <Image
            src={logo}
            className="shrink-0"
            alt="logo"
            width={100}
            height={25}
          />

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
          openMenuClassName="right-0 rounded-lg w-[300px] bg-gray-300 border border-gray-200 p-3 shadow-lg"
          disableOnClickInside={true}
        >
          <p className="text-xs mb-3 opacity-50">RPC endpoints</p>

          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row gap-1 items-center">
              <p className="text-sm font-medium">Automatic switch</p>
              <InfoAnnotation
                text={
                  <p>
                    Automatically selects the best RPC endpoint based on latency
                  </p>
                }
                className="w-3"
              />
            </div>
            {/* <div
              className={twMerge(
                'w-[16px] h-[16px] rounded-[4px] bg-gray-200 hover:bg-gray-400 transition duration-300 cursor-pointer',
                isAutoRPC && 'bg-green-300 hover:bg-green-300',
              )}
              onClick={() => {
                setIsAutoRPC(!isAutoRPC);
                setCookies('isAutoRPC', !isAutoRPC);
              }}
            /> */}
            <CheckBox
              checked={isAutoRPC}
              onClick={() => {
                setIsAutoRPC(!isAutoRPC);
                addNotification({
                  title: `Automatic switch ${
                    isAutoRPC ? 'disabled' : 'enabled'
                  }`,
                  duration: 'fast',
                  position: 'bottom-right',
                });
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
                  !isCustomRPC && rpcOption.name === activeRPC && 'opacity-100',
                )}
                onClick={() => {
                  changeRPCOption(rpcOption.name);
                  addNotification({
                    title: 'RPC endpoint changed',
                    duration: 'fast',
                    position: 'bottom-right',
                  });
                }}
                key={rpcOption.name}
              >
                <div className="flex flex-row gap-2 items-center">
                  <input
                    type="radio"
                    checked={!isCustomRPC && rpcOption.name === activeRPC}
                    onChange={() => false}
                  />
                  <p className="text-sm font-medium">{rpcOption.name}</p>
                </div>
                <div className="flex flex-row gap-1 items-center">
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
            <li
              className={twMerge(
                'flex flex-row justify-between items-center cursor-pointer opacity-50 hover:opacity-100 transition-opacity duration-300',
                isCustomRPC && 'opacity-100',
              )}
            >
              <div className="flex flex-row gap-2 items-center w-full">
                <input
                  type="radio"
                  checked={isCustomRPC}
                  onChange={() => {
                    setIsCustomRPC(!isCustomRPC);
                    setCookies('isCustomRPC', !isCustomRPC);
                    setIsEditCustomRPCMode(
                      customRPCUrl === '' && customRPC === '',
                    );

                    addNotification({
                      title: 'RPC endpoint changed to custom',
                      duration: 'fast',
                      position: 'bottom-right',
                    });
                  }}
                  className="flex-none"
                />
                <div
                  className={twMerge(
                    'relative w-full  bg-black border border-gray-200 rounded-lg overflow-hidden transition duration-300',
                    !isEditCustomRPCMode &&
                      'bg-transparent font-regular font-medium',
                  )}
                >
                  <input
                    type="text"
                    value={!isEditCustomRPCMode ? customRPCUrl : customRPC}
                    onChange={(e) => {
                      setCustomRPC(e.target.value);
                      setIsEditCustomRPCMode(true);
                    }}
                    className={twMerge(
                      'w-full h-[40px] p-1 px-3 max-w-[195px] text-ellipsis text-sm font-mono bg-black transition duration-300',
                      !isEditCustomRPCMode && 'bg-transparent max-w-[165px]',
                    )}
                    placeholder="Custom RPC URLs"
                  />
                  <Button
                    title={
                      !isEditCustomRPCMode
                        ? customRPCUrl === ''
                          ? 'Edit'
                          : `${
                              rpcOptions[rpcOptions.length - 1].latency
                            }ms / Edit`
                        : 'Save'
                    }
                    size="sm"
                    variant={
                      !customRPC || customRPC === customRPCUrl
                        ? 'text'
                        : 'secondary'
                    }
                    onClick={
                      !isEditCustomRPCMode
                        ? () => setIsEditCustomRPCMode(true)
                        : saveCustomRPCUrl
                    }
                    className={twMerge(
                      'text-xs absolute right-2 top-[8px] p-1 px-2',
                      !isEditCustomRPCMode && 'opacity-100 font-normal',
                    )}
                  />
                </div>
              </div>
            </li>
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
