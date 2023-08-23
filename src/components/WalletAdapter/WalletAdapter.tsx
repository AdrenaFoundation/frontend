import Image from 'next/image';
import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  connectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { useDispatch, useSelector } from '@/store/store';
import { getAbbrevWalletAddress } from '@/utils';

import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const { wallet, modalIsOpen } = useSelector((s) => s.walletState);

  const connected = !!wallet;

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    dispatch(autoConnectWalletAction('phantom'));

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    dispatch(disconnectWalletAction(wallet.adapterName));
    dispatch(openCloseConnectionModalAction(false));
  };

  return (
    <div>
      <Button
        className={twMerge(className)}
        title={
          connected
            ? getAbbrevWalletAddress(wallet.walletAddress)
            : 'Connect wallet'
        }
        rightIcon={
          connected ? '/images/disconnect.png' : '/images/wallet-icon.svg'
        }
        alt="wallet icon"
        variant="outline"
        onClick={handleClick}
      />

      {modalIsOpen ? (
        <Modal
          title="Select wallet"
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col items-center w-64 px-3 pb-3"
        >
          <div
            className="flex flex-row gap-3 items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-300 duration-300 w-full"
            onClick={() => {
              dispatch(connectWalletAction('phantom'));
              dispatch(openCloseConnectionModalAction(false));
            }}
          >
            <Image
              src="/images/phantom.png"
              alt="phantom icon"
              height={30}
              width={30}
            />
            Phantom
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default WalletAdapter;
