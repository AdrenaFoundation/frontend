import { WalletReadyState } from '@solana/wallet-adapter-base';
import { AnimatePresence } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import React, { useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  connectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { WalletAdapterName } from '@/types';

import Modal from '../common/Modal/Modal';
import { WALLET_ICONS } from './WalletAdapter';

export default function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  const lastConnectedWalletRef = useRef<null | WalletAdapterName>(null);

  if (lastConnectedWalletRef.current === null) {
    const adapterName = localStorage.getItem('lastConnectedWallet');

    if (adapterName && adapterName in walletAdapters) {
      lastConnectedWalletRef.current = adapterName as WalletAdapterName;
    } else {
      lastConnectedWalletRef.current = null;
    }
  }

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full relative overflow-visible"
          title="Pick a wallet"
        >
          <div className="flex flex-col w-[25em]">
            <WalletBlock
              name="Phantom"
              bgColor="#ab9ff2"
              lastConnected={lastConnectedWalletRef.current === 'phantom'}
              imgClassName='top-[5.3em] relative'
              logo={WALLET_ICONS.phantom}
              onClick={() => {
                dispatch(connectWalletAction('phantom'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['phantom'].readyState}
            />

            <WalletBlock
              name="Coinbase"
              bgColor="#072b79"
              lastConnected={lastConnectedWalletRef.current === 'coinbase'}
              imgClassName='w-[9em] top-[5.3em] right-[2em] relative'
              logo={WALLET_ICONS.coinbase}
              onClick={() => {
                dispatch(connectWalletAction('coinbase'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['coinbase'].readyState}
            />

            <WalletBlock
              name="Solflare"
              bgColor="#fda518"
              lastConnected={lastConnectedWalletRef.current === 'solflare'}
              imgClassName='w-[9em] top-[5.3em] right-[2em] relative'
              logo={WALLET_ICONS.solflare}
              onClick={() => {
                dispatch(connectWalletAction('solflare'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['solflare'].readyState}
            />

            <WalletBlock
              name="WalletConnect"
              bgColor="#0798fe"
              lastConnected={lastConnectedWalletRef.current === 'walletconnect'}
              imgClassName='top-[2em] w-[10em] right-[1em] relative'
              logo={WALLET_ICONS.walletconnect}
              onClick={() => {
                dispatch(connectWalletAction('walletconnect'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={WalletReadyState.Installed}
            />
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

const WalletBlock = ({
  name,
  logo,
  lastConnected,
  onClick,
  imgClassName,
  bgColor,
  readyState,
  className,
}: {
  name: string;
  logo: StaticImageData;
  lastConnected: boolean;
  imgClassName?: string;
  onClick: () => void;
  bgColor: string;
  readyState: WalletReadyState;
  className?: string;
}) => {
  const disabled = readyState !== WalletReadyState.Installed;

  const [isHovered, setIsHovered] = React.useState(false);

  const walletBlock = (
    <div className={twMerge(
      'flex w-full h-[5em] relative overflow-hidden',
      className,
    )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={twMerge('absolute top-0 left-0 w-full h-full flex items-end justify-end', isHovered ? 'opacity-80 grayscale-0' : 'opacity-10 grayscale')}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <Image src={logo} alt={`${name} icon`} className={twMerge("w-[12em] h-auto", imgClassName)} />
      </div>

      <div
        className={twMerge(
          'flex p-3 w-full h-full relative items-center',
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer duration-300',
        )}
        onClick={() => {
          if (disabled) return;

          onClick();
        }}
      >
        <div className="text-lg font-boldy flex items-center ml-8 pt-1 pb-1 pl-3 pr-3 bg-main">{name}</div>

        {lastConnected ? <div className={twMerge('flex text-sm ml-4 italic', isHovered ? 'text-white' : 'text-txtfade')}>Last Pick!</div> : null}
      </div>
    </div>
  );

  console.log(name, readyState);

  return walletBlock;
};
