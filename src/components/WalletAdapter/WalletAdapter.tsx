import { PublicKey } from '@solana/web3.js';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { useDispatch, useSelector } from '@/store/store';
import { UserProfileExtended, WalletAdapterExtended } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeparator from '../common/Menu/MenuSeparator';
import WalletSelectionModal from './WalletSelectionModal';

export default function WalletAdapter({
  className,
  userProfile,
  isIconOnly,
  adapters,
  isMobile = false,
  setIsPriorityFeeModalOpen,
  setIsSettingsModalOpen,
}: {
  className?: string;
  userProfile: UserProfileExtended | null | false;
  isIconOnly?: boolean;
  adapters: WalletAdapterExtended[];
  isMobile?: boolean;
  setIsSettingsModalOpen?: (isOpen: boolean) => void;
  setIsPriorityFeeModalOpen?: (isOpen: boolean) => void;
}) {
  const dispatch = useDispatch();
  const router = useRouter();

  const { wallet } = useSelector((s) => s.walletState);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

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
  const connected = !!connectedWalletAdapterName;

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
            <Button
              className={twMerge(
                className,
                'gap-2 pl-2 pr-3 text-xs w-[15em] border border-white/20',
                isIconOnly && 'p-0 h-8 w-8',
                isMobile &&
                "bg-[url('/images/profile-picture-1.jpg')] bg-no-repeat bg-cover bg-center",
              )}
              title={
                !isIconOnly
                  ? userProfile
                    ? getAbbrevNickname(userProfile.nickname)
                    : getAbbrevWalletAddress(wallet.walletAddress)
                  : null
              }
              leftIcon={
                connectedAdapter?.iconOverride ?? connectedAdapter?.icon
              }
              leftIconClassName="hidden sm:block w-4 h-4"
              variant="lightbg"
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);
              }}
            />
          }
          openMenuClassName="w-[150px] right-0 border border-white/10 shadow-xl"
        >
          <MenuItems>
            {isMobile ? (
              <>
                <MenuItem
                  onClick={() => {
                    router.push('/profile');
                  }}
                  className="py-2"
                >
                  Profile
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
                  className="py-2"
                  onClick={() => {
                    setIsSettingsModalOpen?.(true);
                  }}
                >
                  Settings
                </MenuItem>
                <MenuSeparator />
              </>
            ) : null}
            <MenuItem
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);

                if (!connected || !connectedAdapter) return;

                dispatch(disconnectWalletAction(connectedAdapter));
              }}
              className="py-2"
            >
              Disconnect
            </MenuItem>
          </MenuItems>
        </Menu>
      ) : (
        <Button
          className={twMerge(
            className,
            'gap-1 pl-2 pr-3 text-xs w-[15em] border border-white/20',
            isIconOnly && 'p-0 h-8 w-8',
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
    </div>
  );
}
