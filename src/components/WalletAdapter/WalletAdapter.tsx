import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  connectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { useDispatch, useSelector } from '@/store/store';

import Button from '../Button/Button';
import Modal from '../Modal/Modal';

function getAbbrevWalletAddress(address: string) {
  return `${address.slice(0, 4)}..${address.slice(address.length - 4)}`;
}

function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const { wallet, modalIsOpen } = useSelector((s) => s.walletState);

  const connected = !!wallet;

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    console.log('>>> Call auto connect');
    dispatch(autoConnectWalletAction('phantom'));

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={twMerge(className)}>
      {!connected ? (
        <Button
          leftIcon="images/wallet-icon.svg"
          title="Connect wallet"
          onClick={() => dispatch(openCloseConnectionModalAction(true))}
        />
      ) : null}

      {connected ? (
        <Button
          title={getAbbrevWalletAddress(wallet.walletAddress)}
          onClick={() => {
            dispatch(disconnectWalletAction(wallet.adapterName));
            dispatch(openCloseConnectionModalAction(false));
          }}
          rightIcon="images/disconnect.png"
        />
      ) : null}

      {modalIsOpen ? (
        <Modal
          title="Select wallet"
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className={twMerge(
            'w-64',
            'h-32',
            'flex',
            'flex-col',
            'items-center',
            'justify-center',
          )}
        >
          <div
            className={twMerge(
              'w-full',
              'h-full',
              'flex',
              'flex-col',
              'justify-evenly',
              'items-center',
            )}
            onClick={() => {
              dispatch(connectWalletAction('phantom'));
              dispatch(openCloseConnectionModalAction(false));
            }}
          >
            <div
              className={twMerge(
                'flex',
                'p-2',
                'border',
                'border-grey',
                'items-center',
                'w-40',
                'justify-around',
                'cursor-pointer',
                'hover:opacity-90',
              )}
            >
              {
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="w-8 h-8"
                  src="/images/phantom.png"
                  alt="phantom icon"
                />
              }
              <span className="text-lg">Phantom</span>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}

export default WalletAdapter;
