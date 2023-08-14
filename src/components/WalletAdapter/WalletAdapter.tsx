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
