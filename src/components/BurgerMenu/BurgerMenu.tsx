import { Connection } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import useAPR from '@/hooks/useAPR';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import {
  UserProfileExtended,
  VestExtended,
  WalletAdapterExtended,
} from '@/types';
import { formatPriceInfo } from '@/utils';

import adxLogo from '../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../public/images/adrena_logo_alp_white.svg';
import chatIcon from '../../../public/images/chat-text.svg';
import chevronDownIcon from '../../../public/images/chevron-down.svg';
import competitionIcon from '../../../public/images/competition.svg';
import githubLogo from '../../../public/images/github.svg';
import logo from '../../../public/images/logo.svg';
import twitterLogo from '../../../public/images/x.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import Mutagen from '../Mutagen/Mutagen';
import FormatNumber from '../Number/FormatNumber';
import PriorityFeeSetting from '../PriorityFeeSetting/PriorityFeeSetting';
import Settings from '../Settings/Settings';
import WalletAdapter from '../WalletAdapter/WalletAdapter';

export default function BurgerMenu({
  disableChat,
  userProfile,
  PAGES,
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  userVest,
  userDelegatedVest,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  adapters,
  isChatOpen,
  setIsChatOpen,
}: {
  disableChat: boolean;
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
  userVest: VestExtended | null | false;
  userDelegatedVest: VestExtended | null | false;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  adapters: WalletAdapterExtended[];
  isChatOpen: boolean | null;
  setIsChatOpen: (isChatOpen: boolean | null) => void;
}) {
  const { aprs } = useAPR();
  const { pathname } = useRouter();
  const isSmallerScreen = useBetterMediaQuery('(max-width: 640px)');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [adxPrice, setAdxPrice] = useState<number | null>(null);

  const [isPriorityFeeModalOpen, setIsPriorityFeeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

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
      <div className="py-3 p-4 sm:p-4 z-50 flex flex-row justify-between items-center w-full bg-secondary/80 backdrop-blur-md border-b border-bcolor">
        <div className="flex flex-row gap-3 items-center">
          <Link href="/trade">
            <Image src={adxLogo} alt="logo" width={28} height={28} className='w-6 h-6' />
          </Link>

          <div className="flex flex-row items-center gap-2">
            <Link href="/buy_alp">
              {alpPrice && aprs ? (
                <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-lg hover:bg-third transition-colors duration-300">
                  <Image
                    src={alpLogo}
                    alt="ALP Logo"
                    className="opacity-50"
                    width={10}
                    height={10}
                  />

                  <div className="flex flex-col lg:flex-row  gap-0 lg:gap-1">
                    <div className="text-xxs font-mono">
                      {formatPriceInfo(
                        alpPrice,
                        window.adrena.client.alpToken.displayPriceDecimalsPrecision,
                        window.adrena.client.alpToken.displayPriceDecimalsPrecision,
                      )}
                    </div>

                    <div className="self-stretch bg-bcolor w-[1px] flex-none" />

                    <FormatNumber
                      nb={aprs.lp}
                      format="percentage"
                      precision={0}
                      suffix="APR"
                      suffixClassName="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      className="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      isDecimalDimmed={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-[7em] h-4 bg-gray-800 rounded-xl" />
              )}
            </Link>

            <Link href="/buy_adx">
              {adxPrice && aprs ? (
                <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-lg hover:bg-third transition-colors duration-300">
                  <Image
                    src={adxLogo}
                    alt="ALP Logo"
                    className="opacity-50"
                    width={10}
                    height={10}
                  />

                  <div className="flex flex-col lg:flex-row  gap-0 lg:gap-1">
                    <div className="text-xxs font-mono">
                      {formatPriceInfo(
                        adxPrice,
                        window.adrena.client.adxToken.displayPriceDecimalsPrecision,
                        window.adrena.client.adxToken.displayPriceDecimalsPrecision,
                      )}
                    </div>

                    <div className="self-stretch bg-bcolor w-[1px] flex-none" />

                    <FormatNumber
                      nb={aprs.lm}
                      format="percentage"
                      precision={0}
                      suffix="APR"
                      suffixClassName="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      className="text-[0.625rem] font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      isDecimalDimmed={false}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-[7em] h-4 bg-gray-800 rounded-xl" />
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          <Mutagen isMobile />
          {disableChat === true ? (
            null
          ) : (
            <Button
              className="gap-1 text-xs p-0 h-8 w-8 border border-white/20"
              leftIcon={chatIcon}
              alt="chat icon"
              leftIconClassName="w-[0.875rem] h-[0.875rem]"
              variant="lightbg"
              onClick={() => setIsChatOpen(!isChatOpen)}
            />
          )}

          <AnimatePresence>
            {isPriorityFeeModalOpen ? (
              <PriorityFeeSetting
                setCloseMobileModal={setIsPriorityFeeModalOpen}
                isMobile
              />
            ) : null}
          </AnimatePresence>

          <AnimatePresence>
            {isSettingsModalOpen ? (
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
                setCloseMobileModal={setIsSettingsModalOpen}
                isMobile
              />
            ) : null}
          </AnimatePresence>

          <WalletAdapter
            className="w-full"
            userProfile={userProfile}
            isIconOnly={isSmallerScreen === true}
            adapters={adapters}
            setIsPriorityFeeModalOpen={setIsPriorityFeeModalOpen}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
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
                {PAGES.filter(
                  (p) => p.name !== 'Vest' || userVest || userDelegatedVest,
                ).map((page) => {
                  return (
                    <li
                      className={twMerge(
                        'flex flex-row gap-1 items-center font-normal text-xl opacity-50 hover:opacity-100 hover:grayscale-0 transition duration-300',
                        pathname === page.link
                          ? 'grayscale-0 opacity-100'
                          : 'grayscale',
                      )}
                      key={page.name}
                    >
                      {page.name === 'Ranked' && (
                        <Image
                          src={competitionIcon}
                          alt="logo"
                          width={12}
                          height={12}
                        />
                      )}

                      <Link
                        href={page.link}
                        className="block font-medium"
                        onClick={() => setIsOpen(!open)}
                      >
                        {page.name}
                      </Link>

                      {page.name === 'Ranked' && (
                        <Image
                          src={competitionIcon}
                          alt="logo"
                          width={12}
                          height={12}
                          className="scale-x-[-1]"
                        />
                      )}
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
