import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { ImageRef, UserProfileExtended, WalletAdapterName } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import coinbaseLogo from '../../../public/images/coinbase.png';
import phantomLogo from '../../../public/images/phantom.svg';
import solflareLogo from '../../../public/images/solflare.png';
import walletconnectLogo from '../../../public/images/wallet-connect.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import WalletSelectionModal from './WalletSelectionModal';

export const WALLET_ICONS = {
  phantom: phantomLogo,
  solflare: solflareLogo,
  walletconnect: walletconnectLogo,
  coinbase: coinbaseLogo,
} as const satisfies Record<WalletAdapterName, ImageRef>;

export default function WalletAdapter({
  className,
  userProfile,
  isIconOnly,
}: {
  className?: string;
  userProfile: UserProfileExtended | null | false;
  isIconOnly?: boolean;
}) {
  const dispatch = useDispatch();
  const { wallet } = useSelector((s) => s.walletState);
  const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);

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

    if (adapterName && adapterName in walletAdapters) {
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
      dispatch(autoConnectWalletAction(lastConnectedWalletRef.current));
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

    const adapter = walletAdapters[connectedWalletAdapterName];

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
  }, [dispatch, connectedWalletAdapterName]);

  return (
    <div className="relative">
      {connected ? (
        <Menu
          trigger={
            <Button
              className={twMerge(
                className,
                'gap-2 pl-4 pr-3',
                isIconOnly && 'p-0 h-7 w-7',
              )}
              title={
                !isIconOnly
                  ? userProfile
                    ? getAbbrevNickname(userProfile.nickname)
                    : getAbbrevWalletAddress(wallet.walletAddress)
                  : null
              }
              leftIcon={WALLET_ICONS[wallet.adapterName]}
              rightIcon={!isIconOnly && walletIcon}
              alt="wallet icon"
              rightIconClassName="w-4 h-4"
              variant="lightbg"
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);
              }}
            />
          }
          openMenuClassName="w-[120px] right-0"
        >
          <MenuItems>
            <MenuItem
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);

                if (!connected) return;

                dispatch(disconnectWalletAction(wallet.adapterName));
              }}
            >
              Disconnect
            </MenuItem>
          </MenuItems>
        </Menu>
      ) : (
        <Button
          className={twMerge(
            className,
            'gap-2 pl-4 pr-3',
            isIconOnly && 'p-0 h-7 w-7',
          )}
          title={!isIconOnly ? 'Connect wallet' : null}
          rightIcon={walletIcon}
          alt="wallet icon"
          rightIconClassName="w-4 h-4"
          variant="lightbg"
          onClick={() => {
            if (!connected) {
              dispatch(openCloseConnectionModalAction(true));
            }
          }}
        />
      )}

      <WalletSelectionModal />
    </div>
  );
}
