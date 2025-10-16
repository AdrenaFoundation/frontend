import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { PROFILE_PICTURES } from '@/constant';
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { useDispatch, useSelector } from '@/store/store';
import { UserProfileExtended, WalletAdapterExtended } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import chevronDownIcon from '../../../public/images/Icons/chevron-down.svg';
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
  isTablet = false,
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
  isTablet?: boolean;
  setIsSettingsModalOpen?: (isOpen: boolean) => void;
  setIsPriorityFeeModalOpen?: (isOpen: boolean) => void;
  setIsChatOpen?: (isOpen: boolean) => void;
  disableChat?: boolean;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { wallet } = useSelector((s) => s.walletState);

  const { isSidebarOpen, openSidebar, closeSidebar } = useWalletSidebar();

  const connectedAdapter = useMemo(
    () => wallet && adapters.find((x) => x.name === wallet.adapterName),
    [wallet, adapters],
  );

  const isConnecting = useMemo(() => {
    return adapters.some((adapter) => adapter.connecting)
  }, [adapters],
  );

  const isConnected = useMemo(() => {
    return adapters.some((adapter) => adapter.connected);
  }, [adapters]);

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

  const connected = !!connectedWalletAdapterName && isConnected;

  useEffect(() => {
    if (autoConnectAuthorizedRef.current && lastConnectedWalletRef.current) {
      const wasPrivyConnection = lastConnectedWalletRef.current === 'Privy';

      if (wasPrivyConnection) {
        console.log('🚫 Skipping native auto-connect - last connection was via Privy');
        return;
      }

      const adapter = adapters.find(
        (x) => x.name === lastConnectedWalletRef.current,
      );
      if (!adapter) return;

      dispatch(autoConnectWalletAction(adapter));
      return;
    }
    // `dispatch` is stable, does not need to be included in the dependencies array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect change of account:
  // - update the Wallet state on change of connected account for the current provider.
  // - cleanup & reset listeners on change of wallet provider.
  useEffect(() => {
    if (!connectedWalletAdapterName) return;

    const adapter = adapters.find((x) => x.name === connectedWalletAdapterName);

    if (!adapter) return;

    // Only listen for account changes, not initial connections
    // Initial connections are handled by walletActions.ts
    const handleAccountChange = (walletPubkey: PublicKey) => {
      const currentWalletAddress = wallet?.walletAddress;
      const newWalletAddress = walletPubkey.toBase58();

      if (currentWalletAddress && currentWalletAddress !== newWalletAddress) {
        console.log('🔄 Account changed from', currentWalletAddress.slice(0, 8), 'to', newWalletAddress.slice(0, 8));
        dispatch({
          type: 'connect',
          payload: {
            adapterName: connectedWalletAdapterName,
            walletAddress: newWalletAddress,
          },
        });
      }
    };

    adapter.on('connect', handleAccountChange);

    return () => {
      adapter.removeAllListeners('connect');
    };
  }, [dispatch, connectedWalletAdapterName, adapters, wallet?.walletAddress]);

  return (
    <div className="relative">
      {connected && userProfile !== null ? (
        <Menu
          trigger={
            isTablet ? (
              // Mobile/Tablet: Compact rounded button
              <button
                onClick={() => {
                  if (isSidebarOpen) {
                    closeSidebar();
                  } else {
                    openSidebar();
                  }
                }}
                className="flex flex-row items-center gap-1.5 border border-[#414E5E] rounded-full py-1.5 px-2 hover:bg-third transition-colors cursor-pointer"
              >
                <Image
                  src={userProfile ? PROFILE_PICTURES[userProfile.profilePicture] : PROFILE_PICTURES[0]}
                  alt="Profile"
                  width={16}
                  height={16}
                  className="w-4 h-4 rounded-full"
                />
                <span className="text-xs leading-none">
                  {userProfile
                    ? getAbbrevNickname(userProfile.nickname, 16)
                    : getAbbrevWalletAddress(wallet?.walletAddress ?? 'User', 4)}
                </span>
                <Image
                  src={chevronDownIcon}
                  alt="Toggle"
                  className="w-2.5 h-2.5"
                  width={10}
                  height={10}
                />
              </button>
            ) : (
              // Desktop: Split button with profile/chevron
              <div className="flex flex-row items-center border border-[#414E5E] rounded-md">
                <Button
                  className={twMerge(
                    className,
                    'py-1 px-2 ml-1 xl:ml-0 hover:bg-third transition-colors cursor-pointer',
                    'border-bcolor rounded-none rounded-l-lg border-r border-r-[#414E5E] gap-1 xl:gap-2 text-xs h-auto bg-transparent',
                    'whitespace-nowrap'
                  )}
                  title={
                    userProfile
                      ? getAbbrevNickname(userProfile.nickname, 16)
                      : getAbbrevWalletAddress(wallet?.walletAddress ?? 'User', 6)
                  }
                  leftIcon={
                    userProfile
                      ? PROFILE_PICTURES[userProfile.profilePicture]
                      : PROFILE_PICTURES[0]
                  }
                  leftIconClassName="w-4 h-4 rounded-full border border-white/20"
                  variant="lightbg"
                  onClick={() => {
                    router.push('/profile');
                  }}
                />

                <div
                  className="py-1.5 px-1 xl:px-2 hover:bg-third transition-colors cursor-pointer rounded-r-lg flex items-center gap-1"
                  onClick={() => {
                    if (isSidebarOpen) {
                      closeSidebar();
                    } else {
                      openSidebar();
                    }
                  }}
                >
                  <Image
                    src={walletIcon}
                    alt="Wallet"
                    className="w-3.5 h-3.5 opacity-70"
                    width={14}
                    height={14}
                  />
                  <Image
                    src={chevronDownIcon}
                    alt="Toggle Sidebar"
                    className="w-3 h-3"
                    width={14}
                    height={14}
                  />
                </div>
              </div>
            )
          }
          disabled={true}
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
                  href="https://docs.adrena.trade/"
                  target="_blank"
                  linkClassName="py-2"
                >
                  Learn
                </MenuItem>

                <MenuSeparator />

                <MenuItem
                  href="https://dao.adrena.trade/"
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
                    if (!connected || !connectedAdapter) return;

                    if (wallet?.isPrivy) {
                      dispatch(disconnectWalletAction(adapters.find((x) => x.name === 'Privy')!));
                    } else {
                      dispatch(disconnectWalletAction(connectedAdapter));
                    }
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
            'gap-1 py-1 px-3 pr-4 h-auto text-xs border border-[#414E5E] bg-transparent hover:bg-third rounded-md',
            isIconOnly && 'p-0 h-8 w-8 rounded-full',
            isConnecting && 'opacity-50 cursor-not-allowed',
          )}
          title={!isIconOnly ? (isConnecting ? 'Connecting...' : 'Connect wallet') : null}
          leftIcon={isConnecting ? undefined : walletIcon}
          alt="wallet icon"
          leftIconClassName="w-4 h-4"
          variant="lightbg"
          disabled={isConnecting}
          onClick={() => {
            if (!connected && !isConnecting) {
              dispatch(openCloseConnectionModalAction(true));
            }
          }}
        />
      )
      }

      <WalletSelectionModal adapters={adapters} />
      <SignMessageModal adapters={adapters} />
    </div >
  );
}
