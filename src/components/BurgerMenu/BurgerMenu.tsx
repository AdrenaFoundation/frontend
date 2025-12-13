import { Connection } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import router, { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import useAPR from '@/hooks/useAPR';
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
import twitterLogo from '../../../public/images/x.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import LanguageSwitcher from '../LanguageSwitcher';
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
  isTablet = false,
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
  isTablet?: boolean;
}) {
  const { t } = useTranslation();
  const { pathname } = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [isPriorityFeeModalOpen, setIsPriorityFeeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [hasMenuLoadedOnce, setHasMenuLoadedOnce] = useState(false);

  const tokenPriceALP = useSelector((s) => s.tokenPrices.ALP);
  const tokenPriceADX = useSelector((s) => s.tokenPrices.ADX);
  const { aprs } = useAPR();

  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
    null,
  );

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

  const MENU_ITEM_CLASSES =
    'flex items-center gap-4 px-4 py-5 group border-b border-white/[0.06]';
  const MENU_ITEM_ACTIVE = 'bg-third';
  const ICON_CONTAINER =
    'flex items-center justify-center w-12 h-12 flex-shrink-0';
  const ICON_SIZE = { width: 24, height: 24 };
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

  const tabletSidebarPages = PAGES.filter((page) =>
    ['/trade', '/buy_alp', '/stake', '/ranked', '/monitoring'].includes(
      page.link,
    ),
  );

  // Add state for scroll position
  const [scrollY, setScrollY] = useState(0);

  // Update the scroll listener
  useEffect(() => {
    if (!isTablet) return;

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isTablet]);

  if (!isTablet) {
    return (
      <>
        <div className="w-full flex flex-row items-center justify-between gap-3 p-1 sm:p-2 lg:p-3 px-2 sm:px-2 lg:px-3 border-b border-bcolor bg-secondary z-[51]">
          <div className="flex flex-row items-center gap-1">
            <Link href="/trade" className="flex h-9 flex-shrink-0 items-center">
              <Image
                src={adxLogo}
                alt="Adrena"
                width={22}
                height={22}
                className="w-[22px] h-[22px]"
              />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex size-8 items-center justify-center rounded-lg hover:bg-third/50 transition-colors"
              aria-label="Open menu"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 shrink-0"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="flex [@media(min-width:500px)]:hidden size-7 items-center justify-center rounded-lg hover:bg-third/50 transition-colors border border-bcolor">
              <LanguageSwitcher />
            </div>
          </div>



          <div className="flex flex-row items-center gap-1">
            <Link href="/buy_alp">
              {tokenPriceALP ? (
                <>
                  {/* Compact version: < 500px */}
                  <div className="flex [@media(min-width:500px)]:hidden flex-col items-center gap-0.5 border border-bcolor px-1.5 py-1 rounded hover:bg-third transition-colors duration-300">
                    <Image
                      src={alpLogo}
                      alt="ALP"
                      className="opacity-50 w-3 h-3"
                      width={12}
                      height={12}
                    />
                    <div className="text-xxs font-mono">
                      {formatPriceInfo(
                        tokenPriceALP,
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
                      )}
                    </div>
                  </div>

                  {/* With APR: 500px-640px */}
                  <div className="hidden [@media(min-width:500px)]:flex [@media(min-width:640px)]:hidden flex-row items-center gap-2 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
                    <Image
                      src={alpLogo}
                      alt="ALP"
                      className="opacity-50 w-3 h-3"
                      width={12}
                      height={12}
                    />
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-1">
                      <div className="text-xxs sm:text-xs font-mono">
                        {formatPriceInfo(
                          tokenPriceALP,
                          window.adrena.client.alpToken
                            .displayPriceDecimalsPrecision,
                          window.adrena.client.alpToken
                            .displayPriceDecimalsPrecision,
                        )}
                      </div>
                      <div className="self-stretch bg-bcolor w-[1px] flex-none" />
                      <FormatNumber
                        nb={aprs?.lp}
                        format="percentage"
                        precision={0}
                        suffix="APR"
                        suffixClassName="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                        className="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                        isDecimalDimmed={false}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-12 h-10 bg-gray-800 rounded" />
              )}
            </Link>

            <Link href="/buy_adx">
              {tokenPriceADX ? (
                <>
                  {/* Compact version: < 500px */}
                  <div className="flex [@media(min-width:500px)]:hidden flex-col items-center gap-0.5 border border-bcolor px-1.5 py-1 rounded hover:bg-third transition-colors duration-300">
                    <Image
                      src={adxLogo}
                      alt="ADX"
                      className="opacity-50 w-3 h-3"
                      width={12}
                      height={12}
                    />
                    <div className="text-xxs font-mono">
                      {formatPriceInfo(
                        tokenPriceADX,
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
                      )}
                    </div>
                  </div>

                  {/* With APR: 500px-640px */}
                  <div className="hidden [@media(min-width:500px)]:flex [@media(min-width:640px)]:hidden flex-row items-center gap-2 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
                    <Image
                      src={adxLogo}
                      alt="ADX"
                      className="opacity-50 w-3 h-3"
                      width={12}
                      height={12}
                    />
                    <div className="flex flex-col lg:flex-row gap-0 lg:gap-1">
                      <div className="text-xxs sm:text-xs font-mono">
                        {formatPriceInfo(
                          tokenPriceADX,
                          window.adrena.client.adxToken
                            .displayPriceDecimalsPrecision,
                          window.adrena.client.adxToken
                            .displayPriceDecimalsPrecision,
                        )}
                      </div>
                      <div className="self-stretch bg-bcolor w-[1px] flex-none" />
                      <FormatNumber
                        nb={aprs?.lm}
                        format="percentage"
                        precision={0}
                        suffix="APR"
                        suffixClassName="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                        className="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                        isDecimalDimmed={false}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-12 h-10 bg-gray-800 rounded" />
              )}
            </Link>

            {
              <div className="flex items-center gap-2">
                <NotificationBell
                  setIsNotificationModalOpen={setIsNotificationModalOpen}
                  isNotificationModalOpen={isNotificationModalOpen}
                  adapters={adapters}
                  isMobile
                />
              </div>
            }

            <button
              type="button"
              onClick={() => setIsPriorityFeeModalOpen(true)}
              className="hidden md:flex border border-[#414E5E] p-2 rounded-full hover:bg-third transition-colors cursor-pointer"
            >
              <Image
                src={fuelIcon}
                alt="Priority Fee"
                width={0}
                height={0}
                style={{ width: '12px', height: '12px' }}
                className="w-3 h-3"
              />
            </button>

            <button
              type="button"
              onClick={() => setIsSettingsModalOpen(true)}
              className="border border-[#414E5E] p-2 rounded-full hover:bg-third transition-colors cursor-pointer"
            >
              <Image
                src={settingsIcon}
                alt="Settings"
                width={0}
                height={0}
                style={{ width: '12px', height: '12px' }}
                className="w-3 h-3"
              />
            </button>

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

            <WalletAdapter
              className="w-full"
              userProfile={userProfile}
              isIconOnly={false}
              adapters={adapters}
              setIsPriorityFeeModalOpen={setIsPriorityFeeModalOpen}
              setIsSettingsModalOpen={setIsSettingsModalOpen}
              setIsChatOpen={() => setIsChatOpen(!isChatOpen)}
              disableChat={disableChat}
              isMobile={false}
              isTablet={true}
            />
          </div>
        </div>

        {portalContainer &&
          createPortal(
            <>
              <motion.div
                initial={false}
                animate={{ opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.1 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
                onClick={() => setIsOpen(false)}
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
              />

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
                <div className="flex-shrink-0 p-2 flex items-center justify-between border-b border-white/[0.06]">
                  <Image
                    src={adxLogo}
                    alt="Adrena"
                    width={20}
                    height={20}
                    className="opacity-90 ml-1 xl:ml-2 w-5 h-5"
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

                <div className="flex-1 overflow-y-auto">
                  {!hasMenuLoadedOnce ? (
                    <div className="flex flex-col">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 px-4 py-5 border-b border-white/[0.06] animate-pulse"
                        >
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
                      {PAGES.find((p) => p.link === '/profile') &&
                        (() => {
                          const page = PAGES.find((p) => p.link === '/profile')!;
                          const isActive = pathname === page.link;
                          return (
                            <Link
                              key="profile"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              className={twMerge(
                                MENU_ITEM_CLASSES,
                                isActive ? MENU_ITEM_ACTIVE : '',
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
                                <div
                                  className={twMerge(
                                    TITLE_CLASSES,
                                    isActive ? TITLE_ACTIVE : TITLE_DEFAULT,
                                  )}
                                >
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
                                </div>
                              </div>
                            </Link>
                          );
                        })()}

                      {!disableChat && (
                        <button
                          onClick={() => {
                            setIsChatOpen(true);
                            setIsOpen(false);
                          }}
                          className={twMerge(
                            MENU_ITEM_CLASSES,
                            'text-left w-full',
                          )}
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
                            <div
                              className={twMerge(TITLE_CLASSES, TITLE_DEFAULT)}
                            >
                              {t('layout.chat')}
                            </div>
                            <div className={SUBTITLE_CLASSES}>
                              {t('layout.communityChat')}
                            </div>
                          </div>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setIsPriorityFeeModalOpen(true);
                          setIsOpen(false);
                        }}
                        className={twMerge(
                          MENU_ITEM_CLASSES,
                          'text-left w-full',
                        )}
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
                          <div
                            className={twMerge(TITLE_CLASSES, TITLE_DEFAULT)}
                          >
                            {t('layout.priorityFee')}
                          </div>
                          <div className={SUBTITLE_CLASSES}>
                            {t('layout.adjustTransactionPriority')}
                          </div>
                        </div>
                      </button>

                      {PAGES.find((p) => p.link === '/achievements') &&
                        (() => {
                          const page = PAGES.find(
                            (p) => p.link === '/achievements',
                          )!;
                          const isActive = pathname === page.link;
                          return (
                            <Link
                              key="achievements"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              className={twMerge(
                                MENU_ITEM_CLASSES,
                                isActive ? MENU_ITEM_ACTIVE : '',
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
                                <div
                                  className={twMerge(
                                    TITLE_CLASSES,
                                    isActive ? TITLE_ACTIVE : TITLE_DEFAULT,
                                  )}
                                >
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
                                </div>
                              </div>
                            </Link>
                          );
                        })()}

                      {PAGES.find((p) => p.link === '/referral') &&
                        (() => {
                          const page = PAGES.find(
                            (p) => p.link === '/referral',
                          )!;
                          const isActive = pathname === page.link;
                          return (
                            <Link
                              key="referral"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              className={twMerge(
                                MENU_ITEM_CLASSES,
                                isActive ? MENU_ITEM_ACTIVE : '',
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
                                <div
                                  className={twMerge(
                                    TITLE_CLASSES,
                                    isActive ? TITLE_ACTIVE : TITLE_DEFAULT,
                                  )}
                                >
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
                                </div>
                              </div>
                            </Link>
                          );
                        })()}

                      {PAGES.find((p) => p.link === '/mutagen_leaderboard') &&
                        (() => {
                          const page = PAGES.find(
                            (p) => p.link === '/mutagen_leaderboard',
                          )!;
                          const isActive = pathname === page.link;
                          return (
                            <Link
                              key="leaderboard"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              className={twMerge(
                                MENU_ITEM_CLASSES,
                                isActive ? MENU_ITEM_ACTIVE : '',
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
                                <div
                                  className={twMerge(
                                    TITLE_CLASSES,
                                    isActive ? TITLE_ACTIVE : TITLE_DEFAULT,
                                  )}
                                >
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
                                </div>
                              </div>
                            </Link>
                          );
                        })()}

                      {PAGES.find((p) => p.link === 'https://docs.adrena.trade/') &&
                        (() => {
                          const page = PAGES.find((p) => p.link === 'https://docs.adrena.trade/')!;
                          return (
                            <Link
                              key="learn"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              target="_blank"
                              className={MENU_ITEM_CLASSES}
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
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
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

                      {PAGES.find((p) => p.link === 'https://dao.adrena.trade/') &&
                        (() => {
                          const page = PAGES.find((p) => p.link === 'https://dao.adrena.trade/')!;
                          return (
                            <Link
                              key="vote"
                              href={page.link}
                              onClick={() => setIsOpen(false)}
                              target="_blank"
                              className={MENU_ITEM_CLASSES}
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
                                  {page.name}
                                </div>
                                <div className={SUBTITLE_CLASSES}>
                                  {page.subtitle}
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
                          width={18}
                          height={18}
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
                          width={18}
                          height={18}
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
                          width={18}
                          height={18}
                          className="opacity-40 group-hover:opacity-80 transition-opacity"
                        />
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </>,
            portalContainer,
          )}
      </>
    );
  }

  // Tablet view
  return (
    <>
      <div className="w-full flex flex-row items-center justify-between gap-3 p-2 md:p-3 px-2 md:px-3 border-b border-bcolor bg-secondary z-[51]">
        <div className="flex flex-row items-center gap-4">
          <Link className="relative p-1.5 -m-1.5 shrink-0 flex" href="/">
            <Image
              src={adxLogo}
              className="w-6 h-6"
              alt="logo"
              width={25}
              height={25}
            />
          </Link>

          {tabletSidebarPages.map((page) => {
            const isActive = pathname === page.link;
            return (
              <Link
                key={page.name}
                href={page.link}
                className={twMerge(
                  'text-sm opacity-50 hover:opacity-100 transition-opacity duration-300 hover:grayscale-0 flex items-center justify-center p-0.5 -m-0.5 whitespace-nowrap',
                  isActive ? 'grayscale-0 opacity-100' : 'grayscale',
                )}
              >
                {page.name}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-row items-center gap-1">
          <Link href="/buy_alp">
            {tokenPriceALP ? (
              <>
                {/* Compact version: 640px-770px and > 1024px */}
                <div className="flex [@media(min-width:770px)]:hidden [@media(min-width:1024px)]:flex flex-col items-center gap-0.5 border border-bcolor px-1.5 py-1 rounded hover:bg-third transition-colors duration-300">
                  <Image
                    src={alpLogo}
                    alt="ALP"
                    className="opacity-50 w-3 h-3"
                    width={12}
                    height={12}
                  />
                  <div className="text-xxs font-mono">
                    {formatPriceInfo(
                      tokenPriceALP,
                      window.adrena.client.alpToken
                        .displayPriceDecimalsPrecision,
                      window.adrena.client.alpToken
                        .displayPriceDecimalsPrecision,
                    )}
                  </div>
                </div>

                {/* With APR: 770px-1024px */}
                <div className="hidden [@media(min-width:770px)]:flex [@media(min-width:1024px)]:hidden flex-row items-center gap-2 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
                  <Image
                    src={alpLogo}
                    alt="ALP"
                    className="opacity-50 w-3 h-3"
                    width={12}
                    height={12}
                  />
                  <div className="flex flex-col lg:flex-row gap-0 lg:gap-1">
                    <div className="text-xxs sm:text-xs font-mono">
                      {formatPriceInfo(
                        tokenPriceALP,
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.alpToken
                          .displayPriceDecimalsPrecision,
                      )}
                    </div>
                    <div className="self-stretch bg-bcolor w-[1px] flex-none" />
                    <FormatNumber
                      nb={aprs?.lp}
                      format="percentage"
                      precision={0}
                      suffix="APR"
                      suffixClassName="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      className="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#5AA6FA_40%,#B9EEFF_60%,#5AA6FA)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      isDecimalDimmed={false}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-12 h-10 bg-gray-800 rounded" />
            )}
          </Link>

          <Link href="/buy_adx">
            {tokenPriceADX ? (
              <>
                {/* Compact version: 640px-770px and > 1024px */}
                <div className="flex [@media(min-width:770px)]:hidden [@media(min-width:1024px)]:flex flex-col items-center gap-0.5 border border-bcolor px-1.5 py-1 rounded hover:bg-third transition-colors duration-300">
                  <Image
                    src={adxLogo}
                    alt="ADX"
                    className="opacity-50 w-3 h-3"
                    width={12}
                    height={12}
                  />
                  <div className="text-xxs font-mono">
                    {formatPriceInfo(
                      tokenPriceADX,
                      window.adrena.client.adxToken
                        .displayPriceDecimalsPrecision,
                      window.adrena.client.adxToken
                        .displayPriceDecimalsPrecision,
                    )}
                  </div>
                </div>

                {/* With APR: 770px-1024px */}
                <div className="hidden [@media(min-width:770px)]:flex [@media(min-width:1024px)]:hidden flex-row items-center gap-2 border p-2 py-1 rounded-md hover:bg-third transition-colors duration-300">
                  <Image
                    src={adxLogo}
                    alt="ADX"
                    className="opacity-50 w-3 h-3"
                    width={12}
                    height={12}
                  />
                  <div className="flex flex-col lg:flex-row gap-0 lg:gap-1">
                    <div className="text-xxs sm:text-xs font-mono">
                      {formatPriceInfo(
                        tokenPriceADX,
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
                        window.adrena.client.adxToken
                          .displayPriceDecimalsPrecision,
                      )}
                    </div>
                    <div className="self-stretch bg-bcolor w-[1px] flex-none" />
                    <FormatNumber
                      nb={aprs?.lm}
                      format="percentage"
                      precision={0}
                      suffix="APR"
                      suffixClassName="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      className="text-[0.625rem] sm:text-xs font-mono bg-[linear-gradient(110deg,#FF344E_40%,#FFB9B9_60%,#FF344E)] animate-text-shimmer bg-clip-text text-transparent bg-[length:250%_100%]"
                      isDecimalDimmed={false}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="w-12 h-10 bg-gray-800 rounded" />
            )}
          </Link>

          {
            <div className="flex items-center gap-2">
              <NotificationBell
                setIsNotificationModalOpen={setIsNotificationModalOpen}
                isNotificationModalOpen={isNotificationModalOpen}
                adapters={adapters}
                isMobile
              />
            </div>
          }

          <button
            type="button"
            onClick={() => setIsPriorityFeeModalOpen(true)}
            className="hidden border border-[#414E5E] p-2 rounded-full hover:bg-third transition-colors cursor-pointer"
          >
            <Image
              src={fuelIcon}
              alt="Priority Fee"
              width={0}
              height={0}
              style={{ width: '12px', height: '12px' }}
              className="w-3 h-3"
            />
          </button>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="border border-[#414E5E] p-2 rounded-full hover:bg-third transition-colors cursor-pointer"
          >
            <Image
              src={settingsIcon}
              alt="Settings"
              width={0}
              height={0}
              style={{ width: '12px', height: '12px' }}
              className="w-3 h-3"
            />
          </button>

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

          <WalletAdapter
            className="w-full"
            userProfile={userProfile}
            isIconOnly={false}
            adapters={adapters}
            setIsPriorityFeeModalOpen={setIsPriorityFeeModalOpen}
            setIsSettingsModalOpen={setIsSettingsModalOpen}
            setIsChatOpen={() => setIsChatOpen(!isChatOpen)}
            disableChat={disableChat}
            isMobile={false}
            isTablet={true}
          />
        </div>
      </div>

      <div
        className="fixed left-0 w-16 bg-secondary border-r border-white/10 z-40 flex flex-col justify-between"
        style={{
          top: `${Math.max(0, 48 - scrollY)}px`,
          height: `calc(100vh - ${Math.max(0, 48 - scrollY)}px)`,
        }}
      >
        <div className="flex-1 overflow-y-auto flex flex-col items-center py-4 gap-2">
          {PAGES.find((p) => p.link === '/profile') &&
            (() => {
              const page = PAGES.find((p) => p.link === '/profile')!;
              const isActive = pathname === page.link;
              return (
                <Link
                  key="profile"
                  href={page.link}
                  className={twMerge(
                    'flex items-center justify-center w-12 h-12 rounded-lg transition-all',
                    isActive
                      ? 'bg-white/10 opacity-100'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/5',
                  )}
                  title="Profile"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Profile"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}

          {!disableChat && (
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center justify-center w-12 h-12 rounded-lg transition-all opacity-50 hover:opacity-100 hover:bg-white/5"
              title="Chat"
            >
              <Image
                src={chatIcon}
                alt="Chat"
                width={20}
                height={20}
                className="brightness-0 invert opacity-90"
              />
            </button>
          )}

          <button
            onClick={() => setIsPriorityFeeModalOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-lg transition-all opacity-50 hover:opacity-100 hover:bg-white/5"
            title="Priority Fee"
          >
            <Image
              src={fuelIcon}
              alt="Priority Fee"
              width={20}
              height={20}
              className="brightness-0 invert opacity-90"
            />
          </button>

          {PAGES.find((p) => p.link === '/achievements') &&
            (() => {
              const page = PAGES.find((p) => p.link === '/achievements')!;
              const isActive = pathname === page.link;
              return (
                <Link
                  key="achievements"
                  href={page.link}
                  className={twMerge(
                    'flex items-center justify-center w-12 h-12 rounded-lg transition-all',
                    isActive
                      ? 'bg-white/10 opacity-100'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/5',
                  )}
                  title="Achievements"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Achievements"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}

          {PAGES.find((p) => p.link === '/referral') &&
            (() => {
              const page = PAGES.find((p) => p.link === '/referral')!;
              const isActive = pathname === page.link;
              return (
                <Link
                  key="referral"
                  href={page.link}
                  className={twMerge(
                    'flex items-center justify-center w-12 h-12 rounded-lg transition-all',
                    isActive
                      ? 'bg-white/10 opacity-100'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/5',
                  )}
                  title="Referral"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Referral"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}

          {PAGES.find((p) => p.link === '/mutagen_leaderboard') &&
            (() => {
              const page = PAGES.find((p) => p.link === '/mutagen_leaderboard')!;
              const isActive = pathname === page.link;
              return (
                <Link
                  key="leaderboard"
                  href={page.link}
                  className={twMerge(
                    'flex items-center justify-center w-12 h-12 rounded-lg transition-all',
                    isActive
                      ? 'bg-white/10 opacity-100'
                      : 'opacity-50 hover:opacity-100 hover:bg-white/5',
                  )}
                  title="Leaderboard"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Leaderboard"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}

          {PAGES.find((p) => p.link === 'https://docs.adrena.trade/') &&
            (() => {
              const page = PAGES.find((p) => p.link === 'https://docs.adrena.trade/')!;
              return (
                <Link
                  key="learn"
                  href={page.link}
                  target="_blank"
                  className="flex items-center justify-center w-12 h-12 rounded-lg transition-all opacity-50 hover:opacity-100 hover:bg-white/5"
                  title="Learn"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Learn"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}

          {PAGES.find((p) => p.link === 'https://dao.adrena.trade/') &&
            (() => {
              const page = PAGES.find((p) => p.link === 'https://dao.adrena.trade/')!;
              return (
                <Link
                  key="vote"
                  href={page.link}
                  target="_blank"
                  className="flex items-center justify-center w-12 h-12 rounded-lg transition-all opacity-50 hover:opacity-100 hover:bg-white/5"
                  title="Vote"
                >
                  {page.icon && (
                    <Image
                      src={page.icon}
                      alt="Vote"
                      width={20}
                      height={20}
                      className="brightness-0 invert opacity-90"
                    />
                  )}
                </Link>
              );
            })()}
        </div>

        <div className="flex-shrink-0 p-2 border-t border-white/[0.06] flex flex-col items-center gap-2">
          <Link
            href="https://discord.gg/adrena"
            target="_blank"
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
            title="Discord"
          >
            <Image
              src={discordLogo}
              alt="Discord"
              width={16}
              height={16}
              className="opacity-40 hover:opacity-80 transition-opacity"
            />
          </Link>
          <Link
            href="https://twitter.com/AdrenaProtocol"
            target="_blank"
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
            title="Twitter"
          >
            <Image
              src={twitterLogo}
              alt="Twitter"
              width={16}
              height={16}
              className="opacity-40 hover:opacity-80 transition-opacity"
            />
          </Link>
          <Link
            href="https://github.com/orgs/AdrenaFoundation"
            target="_blank"
            className="p-2 hover:bg-white/5 rounded-lg transition-all"
            title="GitHub"
          >
            <Image
              src={githubLogo}
              alt="GitHub"
              width={16}
              height={16}
              className="opacity-40 hover:opacity-80 transition-opacity"
            />
          </Link>
        </div>
      </div>
    </>
  );
}
