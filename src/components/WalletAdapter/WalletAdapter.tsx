import { PublicKey } from '@solana/web3.js';
import router from 'next/router';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { UserProfileExtended } from '@/types';
import { getAbbrevNickname, getAbbrevWalletAddress } from '@/utils';

import disconnectIcon from '../../../public/images/disconnect.png';
import threeDotsIcon from '../../../public/images/three-dots.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import MenuItem from '../common/Menu/MenuItem';
import MenuItems from '../common/Menu/MenuItems';
import MenuSeperator from '../common/Menu/MenuSeperator';
import WalletSelectionModal from './WalletSelectionModal';

function WalletAdapter({
  className,
  userProfile,
}: {
  className?: string;
  userProfile: UserProfileExtended | null | false;
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

  return (
    <div className="relative">
      {connected ? (
        <Menu
          trigger={
            <Button
              className={twMerge(
                // use monster font when displaying the nickname only
                userProfile ? 'font-specialmonster text-md' : '',
                className,
              )}
              title={
                userProfile
                  ? getAbbrevNickname(userProfile.nickname)
                  : getAbbrevWalletAddress(wallet.walletAddress)
              }
              rightIcon={threeDotsIcon}
              alt="wallet icon"
              variant="outline"
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);
              }}
            />
          }
          className="w-[120px] right-0"
        >
          <MenuItems>
            <MenuItem
              href={'/user_profile'}
              onClick={() => {
                setMenuIsOpen(false);
              }}
            >
              Profile
            </MenuItem>

            <MenuSeperator />

            <MenuItem
              onClick={() => {
                setMenuIsOpen(!menuIsOpen);

                if (!connected) return;

                console.log('Disconnect wallet');

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
          className={className}
          title="Connect wallet"
          rightIcon={walletIcon}
          alt="wallet icon"
          variant="outline"
          onClick={() => {
            if (!connected) {
              dispatch(openCloseConnectionModalAction(true));
            }
          }}
        />
      )}

      {/* {menuIsOpen ? (
        <div className="absolute right-0 bg-main min-w-[10em] p-2">
          <Button
            className="text-sm"
            title="Profile"
            alt="profile icon"
            variant="text"
            href={'/user_profile'}
            onClick={() => {
              setMenuIsOpen(false);
            }}
          />

          <Button
            className="text-sm"
            title="Disconnect"
            rightIcon={disconnectIcon}
            alt="disconnect icon"
            variant="text"
            onClick={() => {
              setMenuIsOpen(!menuIsOpen);

              if (!connected) return;

              console.log('Disconnect wallet');

              dispatch(disconnectWalletAction(wallet.adapterName));
              dispatch(openCloseConnectionModalAction(false));
            }}
          />
        </div>
      ) : null} */}

      <WalletSelectionModal />
    </div>
  );
}

export default WalletAdapter;
