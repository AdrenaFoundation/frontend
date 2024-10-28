import { Connection } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import {
  PriorityFeeOption,
  SolanaExplorerOptions,
  UserProfileExtended,
} from '@/types';
import { formatPriceInfo } from '@/utils';

import chevronDownIcon from '../../../public/images/chevron-down.svg';
import githubLogo from '../../../public/images/github.svg';
import burgerMenuIcon from '../../../public/images/Icons/burger-menu.svg';
import crossIcon from '../../../public/images/Icons/cross.svg';
import logo from '../../../public/images/logo.svg';
import twitterLogo from '../../../public/images/x.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import PriorityFeeSetting from '../PriorityFeeSetting/PriorityFeeSetting';
import Settings from '../Settings/Settings';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function BurgerMenu({
  userProfile,
  PAGES,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  priorityFeeOption,
  setPriorityFeeOption,
  maxPriorityFee,
  setMaxPriorityFee,
  preferredSolanaExplorer,
}: {
  userProfile: UserProfileExtended | null | false;
  PAGES: { name: string; link: string }[];
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  priorityFeeOption: PriorityFeeOption;
  setPriorityFeeOption: (priorityFeeOption: PriorityFeeOption) => void;
  maxPriorityFee: number | null;
  setMaxPriorityFee: (maxPriorityFee: number | null) => void;
  preferredSolanaExplorer: SolanaExplorerOptions;
}) {
  const { pathname } = useRouter();
  const isSmallScreen = useBetterMediaQuery('(max-width: 450px)');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [adxPrice, setAdxPrice] = useState<number | null>(null);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  useEffect(() => {
    setAlpPrice(tokenPrices.ALP);
    setAdxPrice(tokenPrices.ADX);
  }, [tokenPrices]);

  const clusterSwitchEnabled = false;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  return (
    <div className="z-30">
      <div className="p-4 z-50 flex flex-row justify-between items-center w-full bg-bcolor/85 backdrop-blur-md border-b">
        <div
          className="flex items-center justify-center p-1 border w-9 h-8 rounded-md hover:bg-bcolor transition duration-300 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            className="cursor-pointer opacity-75"
            src={isOpen ? crossIcon : burgerMenuIcon}
            alt="burger menu icon"
            width={16}
            height={16}
          />
        </div>

        <div className="flex flex-row items-center gap-3">
          <div className="flex gap-1">
            <Link
              href="/buy_alp"
              className={twMerge(
                'ml-2 items-center justify-center flex hover:opacity-100',
                isSmallScreen ? 'flex-col' : 'flex-row',
                pathname !== '/buy_alp' && 'opacity-50',
              )}
            >
              <div
                className={twMerge(
                  'text-sm font-boldy',
                  isSmallScreen ? 'mr-0' : 'mr-2',
                )}
              >
                ALP
              </div>

              {alpPrice ? (
                <div className="w-[3em] border bg-third pt-[2px] pb-[2px] pr-1 pl-1 rounded">
                  <div className="text-xxs font-mono flex items-center justify-center">
                    {formatPriceInfo(
                      alpPrice,
                      window.adrena.client.alpToken
                        .displayPriceDecimalsPrecision,
                      window.adrena.client.alpToken
                        .displayPriceDecimalsPrecision,
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-[3em] h-4 bg-gray-800 rounded-xl" />
              )}
            </Link>

            <Link
              href="/buy_adx"
              className={twMerge(
                'ml-2 items-center justify-center flex hover:opacity-100',
                isSmallScreen ? 'flex-col' : 'flex-row',
                pathname !== '/buy_adx' && 'opacity-50',
              )}
            >
              <div
                className={twMerge(
                  'text-sm font-boldy',
                  isSmallScreen ? 'mr-0' : 'mr-2',
                )}
              >
                ADX
              </div>

              {adxPrice ? (
                <div className="w-[3em] border bg-third pt-[2px] pb-[2px] pr-1 pl-1 rounded">
                  <div className="text-xxs font-mono flex items-center justify-center">
                    {formatPriceInfo(
                      adxPrice,
                      window.adrena.client.adxToken
                        .displayPriceDecimalsPrecision,
                      window.adrena.client.adxToken
                        .displayPriceDecimalsPrecision,
                    )}
                  </div>
                </div>
              ) : (
                <div className="w-[3em] h-4 bg-gray-800 rounded-xl" />
              )}
            </Link>
          </div>

          <WalletAdapter
            className="w-full"
            userProfile={userProfile}
            isIconOnly
          />

          <PriorityFeeSetting
            priorityFeeOption={priorityFeeOption}
            setPriorityFeeOption={setPriorityFeeOption}
            maxPriorityFee={maxPriorityFee}
            setMaxPriorityFee={setMaxPriorityFee}
            isMobile
          />

          <Settings
            activeRpc={activeRpc}
            rpcInfos={rpcInfos}
            autoRpcMode={autoRpcMode}
            customRpcUrl={customRpcUrl}
            customRpcLatency={customRpcLatency}
            favoriteRpc={favoriteRpc}
            setAutoRpcMode={setAutoRpcMode}
            setCustomRpcUrl={setCustomRpcUrl}
            setFavoriteRpc={setFavoriteRpc}
            preferredSolanaExplorer={preferredSolanaExplorer}
            isMobile
          />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed flex flex-col justify-between w-full h-full bg-bcolor/85 backdrop-blur-md z-40 border-b p-5 pt-[75px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>
              <ul className="flex flex-col gap-3 mt-4">
                {PAGES.map((page) => {
                  return (
                    <li
                      className={twMerge(
                        'font-normal text-xl opacity-50 hover:opacity-100 transition-opacity duration-300 w-full',
                        pathname === page.link ? 'opacity-100' : '',
                      )}
                      key={page.name}
                    >
                      <Link
                        href={page.link}
                        className="block w-full"
                        onClick={() => setIsOpen(!open)}
                      >
                        {page.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>

              {clusterSwitchEnabled ? (
                <Menu
                  className="mt-7"
                  trigger={
                    <Button
                      className="w-full"
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

            <div>
              <Image
                src={logo}
                className="m-auto"
                alt="logo"
                width={150}
                height={150}
              />

              <div className="flex w-full justify-center gap-5 items-center">
                <Link
                  href="https://github.com/orgs/AdrenaFoundation"
                  target="_blank"
                >
                  <Image
                    className="hover:opacity-90 cursor-pointer"
                    src={githubLogo}
                    alt="github icon"
                    width="20"
                    height="20"
                  />
                </Link>

                <Link href="https://twitter.com/AdrenaProtocol" target="_blank">
                  <Image
                    className="hover:opacity-90 cursor-pointer"
                    src={twitterLogo}
                    alt="twitter icon"
                    width="20"
                    height="20"
                  />
                </Link>

                {/* <Link
          href="/terms_and_conditions"
          className="absolute right-6 text-txtfade hover:text-white font-mono"
        >
          Terms and conditions
        </Link> */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
