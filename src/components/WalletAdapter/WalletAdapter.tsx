import { WalletReadyState } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import Tippy from '@tippyjs/react';
import Image, { StaticImageData } from 'next/image';
import React, { useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  autoConnectWalletAction,
  connectWalletAction,
  disconnectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { getAbbrevWalletAddress } from '@/utils';

import backpackLogo from '../../../public/images/backpack.png';
import disconnectIcon from '../../../public/images/disconnect.png';
import phantomLogo from '../../../public/images/phantom.png';
import walletIcon from '../../../public/images/wallet-icon.svg';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

function WalletAdapter({ className }: { className?: string }) {
  const dispatch = useDispatch();
  const { wallet, modalIsOpen } = useSelector((s) => s.walletState);

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
          className="flex space-x-3 pb-8 pr-8 pl-8 pt-2 flex-wrap"
        >
          <WalletBloc
            name="Phantom"
            logo={phantomLogo}
            height={50}
            width={50}
            onClick={() => {
              dispatch(connectWalletAction('phantom'));
              dispatch(openCloseConnectionModalAction(false));
            }}
            readyState={walletAdapters['phantom'].readyState}
          />

          <WalletBloc
            name="Backpack"
            logo={backpackLogo}
            height={60}
            width={45}
            onClick={() => {
              dispatch(connectWalletAction('backpack'));
              dispatch(openCloseConnectionModalAction(false));
            }}
            readyState={walletAdapters['backpack'].readyState}
          />
        </Modal>
      ) : null}
    </div>
  );
}

const WalletBloc = ({
  name,
  logo,
  onClick,
  height,
  width,
  readyState,
}: {
  name: string;
  logo: StaticImageData;
  onClick: () => void;
  height: number;
  width: number;
  readyState: WalletReadyState;
}) => {
  const disabled = readyState !== WalletReadyState.Installed;

  const walletBloc = (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center p-3 border border-gray-300 rounded-lg h-40 w-40 relative',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer hover:bg-gray-300 duration-300',
      )}
      onClick={() => {
        if (disabled) return;

        onClick();
      }}
    >
      <Image src={logo} alt={`${name} icon`} height={height} width={width} />

      <p className="mt-6">{name}</p>
    </div>
  );

  if (disabled) {
    return (
      <Tippy
        content={
          <div className="text-sm w-auto flex flex-col justify-between">
            {{
              [WalletReadyState.NotDetected]: 'Wallet is not installed',
              [WalletReadyState.Loadable]: 'Wallet is not loaded yet',
              [WalletReadyState.Unsupported]: 'Wallet is not supported',
            }[readyState.toString()] ?? 'Cannot connect wallet'}
          </div>
        }
        placement="bottom"
      >
        {walletBloc}
      </Tippy>
    );
  }

  return walletBloc;
};

export default WalletAdapter;
