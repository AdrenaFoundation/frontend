import { PublicKey } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
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

import backpackLogo from '../../../public/images/backpack.png';
import coinbaseLogo from '../../../public/images/coinbase.png';
import phantomLogo from '../../../public/images/phantom.svg';
import solflareLogo from '../../../public/images/solflare.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import WalletSelectionModal from './WalletSelectionModal';

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

  const connected = !!wallet;

  // Load local storage state to auto-connect if needed
  const autoConnectAuthorized: boolean =
    JSON.parse(localStorage.getItem('autoConnectAuthorized') ?? 'false') ??
    true;

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    if (autoConnectAuthorized) {
      dispatch(autoConnectWalletAction('phantom'));
      return;
    }

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detect change of account
  useEffect(() => {
    if (!wallet) return;

    const adapter = walletAdapters[wallet.adapterName];

    adapter.on('connect', (walletPubkey: PublicKey) => {
      dispatch({
        type: 'connect',
        payload: {
          adapterName: wallet.adapterName,
          walletAddress: walletPubkey.toBase58(),
        },
      });
    });

    return () => {
      adapter.removeAllListeners('connect');
    };
  }, [dispatch, wallet]);

  const WALLETS: Record<WalletAdapterName, { img: ImageRef }> = {
    phantom: {
      img: phantomLogo,
    },
    solflare: {
      img: solflareLogo,
    },
    backpack: {
      img: backpackLogo,
    },
    coinbase: {
      img: coinbaseLogo,
    },
  } as const;

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
              leftIcon={WALLETS[wallet.adapterName]?.img}
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
                dispatch(openCloseConnectionModalAction(false));
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
