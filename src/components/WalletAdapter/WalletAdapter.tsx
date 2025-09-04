import { usePrivy } from '@privy-io/react-auth';
import { useConnectedStandardWallets } from '@privy-io/react-auth/solana';
import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { PROFILE_PICTURES } from '@/constant';
import { usePrivySidebar } from '@/contexts/PrivySidebarContext';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { useDispatch, useSelector } from '@/store/store';
import { UserProfileExtended, WalletAdapterExtended } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import logOutIcon from '../../../public/images/Icons/log-out.svg';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import SignMessageModal from './SignMessageModal';
import WalletSelectionModal from './WalletSelectionModal';

export default function WalletAdapter({
  className,
  userProfile,
  isIconOnly,
  adapters,
  isMobile = false,
  setIsPriorityFeeModalOpen,
  setIsSettingsModalOpen,
  setIsChatOpen,
  disableChat = false,
}: {
  className?: string;
  userProfile: UserProfileExtended | null | false;
  isIconOnly?: boolean;
  adapters: WalletAdapterExtended[];
  isMobile?: boolean;
  setIsSettingsModalOpen?: (isOpen: boolean) => void;
  setIsPriorityFeeModalOpen?: (isOpen: boolean) => void;
  setIsChatOpen?: (isOpen: boolean) => void;
  disableChat?: boolean;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { wallet } = useSelector((s) => s.walletState);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

  const { authenticated: privyAuthenticated, logout: privyLogout } = usePrivy();
  const { isSidebarOpen, openSidebar, closeSidebar } = usePrivySidebar();
  const { ready: walletsReady } = useConnectedStandardWallets();

  const connectedAdapter = useMemo(
    () => wallet && adapters.find((x) => x.name === wallet.adapterName),
    [wallet, adapters],
  );

  // We use a ref in order to avoid getting item from local storage unnecessarily on every render.
  const autoConnectAuthorizedRef = useRef<null | boolean>(null);
  const lastConnectedWalletRef = useRef<null | WalletAdapterName>(null);

  if (autoConnectAuthorizedRef.current === null) {
    autoConnectAuthorizedRef.current = !!JSON.parse(
      localStorage.getItem('autoConnectAuthorized') ?? 'false',
    );
  }

  if (lastConnectedWalletRef.current === null) {
    const adapterName = localStorage.getItem('lastConnectedWallet');

    if (adapterName && adapters.find((x) => x.name === adapterName)) {
      lastConnectedWalletRef.current = adapterName as WalletAdapterName;
    } else {
      lastConnectedWalletRef.current = null;
    }
  }

  const connectedWalletAdapterName = wallet?.adapterName;

  // handle Privy connected stay to be actually authenticated, not just connected
  const connected = !!connectedWalletAdapterName || (privyAuthenticated && walletsReady);

  const isBreak = useBetterMediaQuery('(min-width: 640px)');

  // Attempt to auto-connect Wallet on mount.
  useEffect(() => {
    if (autoConnectAuthorizedRef.current && lastConnectedWalletRef.current) {
      const adapter = adapters.find(
        (x) => x.name === lastConnectedWalletRef.current,
      );
      if (!adapter) return;

      dispatch(autoConnectWalletAction(adapter));
      return;
    }
    // `dispatch` is stable, does not need to be included in the dependencies array.
    // We also only want to run this effect once, when the component is mounted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect change of account:
  // - update the Wallet state on change of connected account for the current provider.
  // - cleanup & reset listeners on change of wallet provider.
  useEffect(() => {
    if (!connectedWalletAdapterName) return;

    const adapter = adapters.find((x) => x.name === connectedWalletAdapterName);

    if (!adapter) return;

    adapter.on('connect', (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName: connectedWalletAdapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });
    });

    return () => {
      adapter.removeAllListeners('connect');
    };
  }, [dispatch, connectedWalletAdapterName, adapters]);

  return (
    <div className="relative">
      {connected && userProfile !== null ? (
        <Menu
          trigger={
            <div
              className={
                'flex flex-row items-center border border-[#414E5E] rounded-full sm:rounded-md'
              }
            >
              <Button
                className={twMerge(
                  className,
                  'p-1 px-2 hover:bg-third transition-colors cursor-pointer border-bcolor rounded-full sm:rounded-none sm:rounded-l-lg border-r border-r-[#414E5E] gap-2 text-xs h-auto bg-transparent',
                  isIconOnly && 'p-0 h-8 w-8',
                )}
                style={
                  !isBreak
                    ? {
                      backgroundImage: `url(${PROFILE_PICTURES[userProfile ? userProfile.profilePicture : 0]})`,
                      backgroundSize: 'cover',
                      backgroundRepeat: 'no-repeat',
                      backgroundPositionY: 'center',
                    }
                    : {}
                }
                title={
                  !isIconOnly
                    ? userProfile
                      ? getAbbrevNickname(userProfile.nickname)
                      : getAbbrevWalletAddress(wallet?.walletAddress ?? 'User')
                    : null
                }
                leftIcon={
                  userProfile
                    ? PROFILE_PICTURES[userProfile.profilePicture]
                    : (connectedAdapter?.iconOverride ?? connectedAdapter?.icon)
                }
                leftIconClassName={twMerge(
                  'hidden sm:block w-4 h-4 rounded-full border border-white/20',
                  !userProfile && 'border-0',
                )}
                variant="lightbg"
                onClick={() => {
                  if (isMobile) {
                    setMenuIsOpen(!menuIsOpen);
                    return;
                  }

                  if (privyAuthenticated) {
                    // For Privy wallets, open/close the sidebar instead of opening profile page
                    if (isSidebarOpen) {
                      closeSidebar();
                    } else {
                      openSidebar();
                    }
                    return;
                  }

                  router.push('/profile');
                }}
              />

              <div
                className="hidden sm:block p-1.5 px-2 hover:bg-third transition-colors cursor-pointer rounded-r-lg"
                onClick={() => {
                  setMenuIsOpen(!menuIsOpen);

                  if (!connected || !connectedAdapter) return;

                  if (privyAuthenticated) {
                    privyLogout();
                  }

                  dispatch(disconnectWalletAction(connectedAdapter));
                }}
              >
                <Image
                  src={logOutIcon}
                  alt="Disconnect Icon"
                  className="w-3 h-3"
                  width={14}
                  height={14}
                />
              </div>
            </div>
          }
          disabled={!isMobile}
          openMenuClassName="w-[14rem] right-0 border border-white/10 shadow-xl bg-secondary"
        >
          {isMobile ? (
            <MenuItems>
              <>
                <MenuItem
                  onClick={() => {
                    router.push('/profile');
                  }}
                  className="py-2"
                >
                  Profile
                </MenuItem>

                {!disableChat ? (
                  <>
                    <MenuSeparator />
                    <MenuItem
                      onClick={() => {
                        setIsChatOpen?.(true);
                      }}
                      className="py-2"
                    >
                      Chat
                    </MenuItem>
                  </>
                ) : null}

                <MenuSeparator />

                <MenuItem
                  onClick={() => {
                    router.push('/achievements');
                  }}
                  className="py-2"
                >
                  Achievements
                </MenuItem>

                <MenuSeparator />

                <MenuItem
                  className="py-2"
                  onClick={() => setIsPriorityFeeModalOpen?.(true)}
                >
                  Priority Fee
                </MenuItem>

                <MenuSeparator />

                <MenuItem
                  href="https://docs.adrena.xyz/"
                  target="_blank"
                  linkClassName="py-2"
                >
                  Learn
                </MenuItem>

                <MenuSeparator />

                <MenuItem
                  href="https://dao.adrena.xyz/"
                  target="_blank"
                  linkClassName="py-2"
                >
                  Vote
                </MenuItem>

                <MenuSeparator />

                <MenuItem
                  className="py-2"
                  onClick={() => {
                    setIsSettingsModalOpen?.(true);
                  }}
                >
                  Settings
                </MenuItem>

                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    router.push('/referral');
                  }}
                  className="py-2"
                >
                  Referral
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  onClick={() => {
                    router.push('/mutagen_leaderboard');
                  }}
                  className="py-2"
                >
                  Leaderboard
                </MenuItem>
                <MenuSeparator />
                <MenuItem
                  className="sm:hidden py-2"
                  onClick={() => {
                    if (privyAuthenticated) {
                      privyLogout();
                    }

                    if (!connected || !connectedAdapter) return;

                    dispatch(disconnectWalletAction(connectedAdapter));
                  }}
                >
                  Disconnect
                </MenuItem>
              </>
            </MenuItems>
          ) : null}
        </Menu>
      ) : (
        <Button
          className={twMerge(
            className,
            'gap-1 p-1 h-auto px-3 pr-4 text-xs border border-[#414E5E] bg-transparent hover:bg-third rounded-md',
            isIconOnly && 'p-0 h-8 w-8 rounded-full',
          )}
          title={!isIconOnly ? 'Connect wallet' : null}
          leftIcon={walletIcon}
          alt="wallet icon"
          leftIconClassName="w-4 h-4"
          variant="lightbg"
          onClick={() => {
            if (!connected) {
              dispatch(openCloseConnectionModalAction(true));
            }
          }}

        />
      )}

      <WalletSelectionModal adapters={adapters} />
      <SignMessageModal adapters={adapters} />
    </div>
  );
}
