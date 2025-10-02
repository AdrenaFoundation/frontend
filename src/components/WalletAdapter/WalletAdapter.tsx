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
import { useWalletSidebar } from '@/contexts/WalletSidebarContext';
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

  const { isSidebarOpen, openSidebar, closeSidebar } = useWalletSidebar();

  const connectedAdapter = useMemo(
    () => wallet && adapters.find((x) => x.name === wallet.adapterName),
    [wallet, adapters],
  );

  // Check if any adapter is currently connecting
  const isConnecting = useMemo(() => {
    return adapters.some((adapter) => adapter.connecting)
  }, [adapters],
  );

  const isConnected = useMemo(() => {
    return adapters.some((adapter) => adapter.connected);
  }, [adapters]);

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

  const connected = !!connectedWalletAdapterName && isConnected;

  const isBreak = useBetterMediaQuery('(min-width: 640px)');

  // Attempt to auto-connect Wallet on mount.
  useEffect(() => {
    if (autoConnectAuthorizedRef.current && lastConnectedWalletRef.current) {
      // Check if the last connection was via Privy - if so, skip native auto-connect
      const wasPrivyConnection = lastConnectedWalletRef.current === 'Privy';

      if (wasPrivyConnection) {
        console.log('🚫 Skipping native auto-connect - last connection was via Privy');
        return;
      }

      const adapter = adapters.find(
        (x) => x.name === lastConnectedWalletRef.current,
      );
      if (!adapter) return;

      console.log('🔄 Native auto-connecting to:', adapter.name);
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

    // Only listen for account changes, not initial connections
    // Initial connections are handled by walletActions.ts
    const handleAccountChange = (walletPubkey: PublicKey) => {
      const currentWalletAddress = wallet?.walletAddress;
      const newWalletAddress = walletPubkey.toBase58();

      // Only dispatch if the wallet address actually changed (account switch)
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

                  if (isConnected) { // TODO:adapt for native wallets aswell
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

                  if (wallet?.isPrivy) {
                    dispatch(disconnectWalletAction(adapters.find((x) => x.name === 'Privy')!));
                  } else {
                    dispatch(disconnectWalletAction(connectedAdapter));
                  }
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
            'gap-1 p-1 h-auto px-3 pr-4 text-xs border border-[#414E5E] bg-transparent hover:bg-third rounded-md',
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
