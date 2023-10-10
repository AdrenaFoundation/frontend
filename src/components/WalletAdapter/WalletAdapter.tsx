import { PublicKey } from '@solana/web3.js';
import Image from 'next/image';
import React, { useEffect } from 'react';

import {
  autoConnectWalletAction,
  connectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { getAbbrevWalletAddress } from '@/utils';

import disconnectIcon from '../../../public/images/disconnect.png';
import phantomLogo from '../../../public/images/phantom.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const { wallet, modalIsOpen } = useSelector((s) => s.walletState);

  const connected = !!wallet;

  const isWalletConnected = JSON.parse(
    localStorage.getItem('isWalletConnected') ?? 'false',
  );

  // When component gets created, try to auto-connect to wallet
  useEffect(() => {
    if (isWalletConnected) {
      dispatch(autoConnectWalletAction('phantom'));
      return;
    }

    // Only once when page load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWalletConnected]);

  // Detect change of account
  useEffect(() => {
    if (!wallet || !Boolean(isWalletConnected)) return;

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
  }, [dispatch, wallet, isWalletConnected]);

  const handleClick = () => {
    if (!connected) {
      dispatch(openCloseConnectionModalAction(true));
      return;
    }

    console.log('Disconnect wallet');
    dispatch(disconnectWalletAction(wallet.adapterName));
    dispatch(openCloseConnectionModalAction(false));
  };

  return (
    <div>
      <Button
        className={className}
        title={
          connected
            ? getAbbrevWalletAddress(wallet.walletAddress)
            : 'Connect wallet'
        }
        rightIcon={connected ? disconnectIcon : walletIcon}
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
              src={phantomLogo}
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
