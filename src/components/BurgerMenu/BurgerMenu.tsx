import { Connection } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { twMerge } from 'tailwind-merge';

import useAPR from '@/hooks/useAPR';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { useSelector } from '@/store/store';
import {
  LinksType,
  UserProfileExtended,
  VestExtended,
  WalletAdapterExtended,
} from '@/types';
import { formatPriceInfo } from '@/utils';

import adxLogo from '../../../public/images/adrena_logo_adx_white.svg';
import alpLogo from '../../../public/images/adrena_logo_alp_white.svg';
import chatIcon from '../../../public/images/chat-text.svg';
import chevronDownIcon from '../../../public/images/chevron-down.svg';
import discordLogo from '../../../public/images/discord.png';
import githubLogo from '../../../public/images/github.svg';
import externalLinkIcon from '../../../public/images/Icons/arrow-sm-45.svg';
import fuelIcon from '../../../public/images/Icons/fuel-pump-fill.svg';
import settingsIcon from '../../../public/images/Icons/settings.svg';
import logo from '../../../public/images/logo.svg';
import twitterLogo from '../../../public/images/x.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import { NotificationBell } from '../Notifications';
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
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  adapters,
  isChatOpen,
  setIsChatOpen,
}: {
  disableChat: boolean;
  userProfile: UserProfileExtended | null | false;
  PAGES: LinksType[];
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
  isChatOpen: boolean;
  setIsChatOpen: (isChatOpen: boolean) => void;
}) {
  const { aprs } = useAPR();
  const { pathname } = useRouter();
  const isSmallerScreen = useBetterMediaQuery('(max-width: 640px)');
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [alpPrice, setAlpPrice] = useState<number | null>(null);
  const [adxPrice, setAdxPrice] = useState<number | null>(null);

  const [isPriorityFeeModalOpen, setIsPriorityFeeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [hasMenuLoadedOnce, setHasMenuLoadedOnce] = useState(false);

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  const tokenPrices = useSelector((s) => s.tokenPrices);

  useEffect(() => {
    setAlpPrice(tokenPrices.ALP);
    setAdxPrice(tokenPrices.ADX);
  }, [tokenPrices]);

  useEffect(() => {
    const container = document.getElementById('modal-container');
    if (container) {
      setPortalContainer(container);
    }
  }, []);

  // Only show loading shimmer the first time the menu is opened
  useEffect(() => {
    if (isOpen && !hasMenuLoadedOnce) {
      // Short delay to allow images/content to load
      const timer = setTimeout(() => {
        setHasMenuLoadedOnce(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, hasMenuLoadedOnce]);

  const clusterSwitchEnabled = false;

  // Unified menu item styles
  const MENU_ITEM_CLASSES = 'flex items-center gap-4 px-4 py-5 group border-b border-white/[0.06]';
  const MENU_ITEM_HOVER = ''; // No hover/active needed - menu closes on click
  const MENU_ITEM_ACTIVE = 'bg-third';
  const ICON_CONTAINER = 'flex items-center justify-center w-12 h-12 flex-shrink-0';
  const ICON_SIZE = { width: 24, height: 24 };
  const EMOJI_SIZE = 'text-2xl';
  const TITLE_CLASSES = 'text-base font-medium mb-0.5';
  const TITLE_ACTIVE = 'text-white';
  const TITLE_DEFAULT = 'text-white/90';
  const SUBTITLE_CLASSES = 'text-sm text-white/40 leading-tight';

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  return (
    <div className="z-40">
      <div className="py-3 p-3 sm:p-4 z-50 flex flex-row justify-between items-center w-full bg-secondary/80 backdrop-blur-md border-b border-bcolor">
        <div className="flex flex-row gap-3 items-center">
          <Link href="/trade">
            <Image
              src={adxLogo}
              alt="logo"
              width={28}
              height={28}
              className="w-6 h-6"
            />
          </Link>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 hover:bg-third/50 rounded transition-colors"
            aria-label="Open menu"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex flex-row items-center gap-2">
            <Link href="/buy_alp">
              {alpPrice && aprs ? (
                <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
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
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
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
                <div className="w-[4.75125rem] sm:w-[7em] h-[2.4625rem] animate-pulse bg-gray-800 rounded-md" />
              )}
            </Link>

            <Link href="/buy_adx">
              {adxPrice && aprs ? (
                <div className="flex flex-row items-center gap-2 lg:gap-1 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
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
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
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
                <div className="w-[4.75125rem] sm:w-[7em] h-[2.4625rem] animate-pulse bg-gray-800 rounded-md" />
              )}
            </Link>
          </div>
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 items-center">
          <AnimatePresence>
            {isPriorityFeeModalOpen && (
              <PriorityFeeSetting
                setCloseMobileModal={setIsPriorityFeeModalOpen}
                isMobile
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isSettingsModalOpen && (
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
            )}
          </AnimatePresence>

          {
            <NotificationBell
              setIsNotificationModalOpen={setIsNotificationModalOpen}
              isNotificationModalOpen={isNotificationModalOpen}
              adapters={adapters}
              isMobile
            />
          }

          <WalletAdapter
            className="w-full"
            userProfile={userProfile}
            isIconOnly={isSmallerScreen === true}
            adapters={adapters}
            setIsPriorityFeeModalOpen={setIsPriorityFeeModalOpen}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            setIsChatOpen={() => setIsChatOpen(!isChatOpen)}
            disableChat={disableChat}
            isMobile
          />
        </div>
      </div>

      {portalContainer && createPortal(
        <>
          {/* Backdrop */}
          <motion.div
            initial={false}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
            onClick={() => setIsOpen(false)}
            style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
          />

          {/* Sidebar */}
          <motion.div
            initial={false}
            animate={{ x: isOpen ? 0 : '-100%' }}
            transition={{
              type: 'tween',
              duration: 0.15,
              ease: 'easeOut',
            }}
            className="fixed left-0 top-0 h-full w-[85%] max-w-[340px] bg-secondary border-r border-white/10 z-[60] flex flex-col"
          >
            {/* Header with Logo - Fixed */}
            <div className="flex-shrink-0 p-2 flex items-center justify-between border-b border-white/[0.06]">
              <Image
                src={logo}
                alt="Adrena"
                width={90}
                height={90}
                className="opacity-90 ml-2"
                priority
              />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-50"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Navigation Links - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {!hasMenuLoadedOnce ? (
                /* Shimmer Loading State */
                <div className="flex flex-col">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-5 border-b border-white/[0.06] animate-pulse">
                      <div className="w-12 h-12 rounded-lg bg-white/[0.08] flex-shrink-0" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-3.5 bg-white/[0.08] rounded w-24" />
                        <div className="h-3 bg-white/[0.08] rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <nav className="flex flex-col">
                  {/* Profile */}
                  {PAGES.find((p) => p.name === 'Profile') && (() => {
                    const page = PAGES.find((p) => p.name === 'Profile')!;
                    const isActive = pathname === page.link;
                    return (
                      <Link
                        key="profile"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        className={twMerge(
                          MENU_ITEM_CLASSES,
                          isActive ? MENU_ITEM_ACTIVE : MENU_ITEM_HOVER
                        )}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={twMerge(
                            TITLE_CLASSES,
                            isActive ? TITLE_ACTIVE : TITLE_DEFAULT
                          )}>
                            Profile
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            Your Adrena Profile
                          </div>
                        </div>
                      </Link>
                    );
                  })()}

                  {/* Chat */}
                  {!disableChat && (
                    <button
                      onClick={() => {
                        setIsChatOpen(true);
                        setIsOpen(false);
                      }}
                      className={twMerge(MENU_ITEM_CLASSES, MENU_ITEM_HOVER, 'text-left w-full')}
                    >
                      <div className={ICON_CONTAINER}>
                        <Image
                          src={chatIcon}
                          alt=""
                          {...ICON_SIZE}
                          className="brightness-0 invert opacity-90"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={twMerge(TITLE_CLASSES, TITLE_DEFAULT)}>
                          Chat
                        </div>
                        <div className={SUBTITLE_CLASSES}>
                          Community chat
                        </div>
                      </div>
                    </button>
                  )}

                  {/* Achievements */}
                  {PAGES.find((p) => p.name === 'Achievements') && (() => {
                    const page = PAGES.find((p) => p.name === 'Achievements')!;
                    const isActive = pathname === page.link;
                    return (
                      <Link
                        key="achievements"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        className={twMerge(
                          MENU_ITEM_CLASSES,
                          isActive ? MENU_ITEM_ACTIVE : MENU_ITEM_HOVER
                        )}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={twMerge(
                            TITLE_CLASSES,
                            isActive ? TITLE_ACTIVE : TITLE_DEFAULT
                          )}>
                            Achievements
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            Progress & Milestones
                          </div>
                        </div>
                      </Link>
                    );
                  })()}

                  {/* Priority Fee */}
                  <button
                    onClick={() => {
                      setIsPriorityFeeModalOpen(true);
                      setIsOpen(false);
                    }}
                    className={twMerge(MENU_ITEM_CLASSES, MENU_ITEM_HOVER, 'text-left w-full')}
                  >
                    <div className={ICON_CONTAINER}>
                      <Image
                        src={fuelIcon}
                        alt=""
                        {...ICON_SIZE}
                        className="brightness-0 invert opacity-90"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={twMerge(TITLE_CLASSES, TITLE_DEFAULT)}>
                        Priority Fee
                      </div>
                      <div className={SUBTITLE_CLASSES}>
                        Transaction priority settings
                      </div>
                    </div>
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      setIsSettingsModalOpen(true);
                      setIsOpen(false);
                    }}
                    className={twMerge(MENU_ITEM_CLASSES, MENU_ITEM_HOVER, 'text-left w-full')}
                  >
                    <div className={ICON_CONTAINER}>
                      <Image
                        src={settingsIcon}
                        alt=""
                        {...ICON_SIZE}
                        className="brightness-0 invert opacity-90"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={twMerge(TITLE_CLASSES, TITLE_DEFAULT)}>
                        Settings
                      </div>
                      <div className={SUBTITLE_CLASSES}>
                        RPC & preferences
                      </div>
                    </div>
                  </button>

                  {/* Referral */}
                  {PAGES.find((p) => p.name === 'Referral') && (() => {
                    const page = PAGES.find((p) => p.name === 'Referral')!;
                    const isActive = pathname === page.link;
                    return (
                      <Link
                        key="referral"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        className={twMerge(
                          MENU_ITEM_CLASSES,
                          isActive ? MENU_ITEM_ACTIVE : MENU_ITEM_HOVER
                        )}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={twMerge(
                            TITLE_CLASSES,
                            isActive ? TITLE_ACTIVE : TITLE_DEFAULT
                          )}>
                            Referral
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            Refer and earn rewards
                          </div>
                        </div>
                      </Link>
                    );
                  })()}

                  {/* Leaderboard */}
                  {PAGES.find((p) => p.name === 'Leaderboard') && (() => {
                    const page = PAGES.find((p) => p.name === 'Leaderboard')!;
                    const isActive = pathname === page.link;
                    return (
                      <Link
                        key="leaderboard"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        className={twMerge(
                          MENU_ITEM_CLASSES,
                          isActive ? MENU_ITEM_ACTIVE : MENU_ITEM_HOVER
                        )}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={twMerge(
                            TITLE_CLASSES,
                            isActive ? TITLE_ACTIVE : TITLE_DEFAULT
                          )}>
                            Leaderboard
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            All-Time Mutagen Leaderboard
                          </div>
                        </div>
                      </Link>
                    );
                  })()}

                  {/* Learn */}
                  {PAGES.find((p) => p.name === 'Learn') && (() => {
                    const page = PAGES.find((p) => p.name === 'Learn')!;
                    return (
                      <Link
                        key="learn"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        target="_blank"
                        className={twMerge(MENU_ITEM_CLASSES, MENU_ITEM_HOVER)}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-0.5 transition-colors text-white/90 group-hover:text-white">
                            Learn
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            Documentation & guides
                          </div>
                        </div>
                        <Image
                          src={externalLinkIcon}
                          alt="External link"
                          width={14}
                          height={14}
                          className="brightness-0 invert opacity-50 flex-shrink-0 mt-1"
                        />
                      </Link>
                    );
                  })()}

                  {/* Vote */}
                  {PAGES.find((p) => p.name === 'Vote') && (() => {
                    const page = PAGES.find((p) => p.name === 'Vote')!;
                    return (
                      <Link
                        key="vote"
                        href={page.link}
                        onClick={() => setIsOpen(false)}
                        target="_blank"
                        className={twMerge(MENU_ITEM_CLASSES, MENU_ITEM_HOVER)}
                      >
                        {page.icon && (
                          <div className={ICON_CONTAINER}>
                            <Image
                              src={page.icon}
                              alt=""
                              {...ICON_SIZE}
                              className="brightness-0 invert opacity-90"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-0.5 transition-colors text-white/90 group-hover:text-white">
                            Vote
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            DAO governance
                          </div>
                        </div>
                        <Image
                          src={externalLinkIcon}
                          alt="External link"
                          width={14}
                          height={14}
                          className="brightness-0 invert opacity-50 flex-shrink-0 mt-1"
                        />
                      </Link>
                    );
                  })()}
                </nav>
              )}

              {hasMenuLoadedOnce && clusterSwitchEnabled && (
                <div className="mt-6 pt-6 border-t border-white/5">
                  <Menu
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
                </div>
              )}
            </div>

            {/* Footer with Social Links - Fixed */}
            {hasMenuLoadedOnce && (
              <div className="flex-shrink-0 p-5 pt-4 border-t border-white/[0.06]">
                <div className="flex justify-center gap-4 items-center">
                  <Link
                    href="https://discord.gg/adrena"
                    target="_blank"
                    className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 group"
                  >
                    <Image
                      src={discordLogo}
                      alt="Discord"
                      width="18"
                      height="18"
                      className="opacity-40 group-hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <Link
                    href="https://twitter.com/AdrenaProtocol"
                    target="_blank"
                    className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 group"
                  >
                    <Image
                      src={twitterLogo}
                      alt="Twitter"
                      width="18"
                      height="18"
                      className="opacity-40 group-hover:opacity-80 transition-opacity"
                    />
                  </Link>
                  <Link
                    href="https://github.com/orgs/AdrenaFoundation"
                    target="_blank"
                    className="p-2.5 hover:bg-white/5 rounded-xl transition-all duration-200 group"
                  >
                    <Image
                      src={githubLogo}
                      alt="GitHub"
                      width="18"
                      height="18"
                      className="opacity-40 group-hover:opacity-80 transition-opacity"
                    />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>,
        portalContainer
      )}
    </div>
  );
}
