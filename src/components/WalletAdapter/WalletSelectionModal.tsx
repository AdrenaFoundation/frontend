import { WalletReadyState } from '@solana/wallet-adapter-base';
import { AnimatePresence } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  connectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { WalletAdapterName } from '@/types';

import Modal from '../common/Modal/Modal';
import { WALLET_COLORS, WALLET_ICONS } from './WalletAdapter';

export default function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);
  const wallet = useSelector((s) => s.walletState.wallet);

  const [lastConnectedWallet, setLastConnectedWallet] = useState<null | WalletAdapterName>(null);

  // Refresh when the wallet change to make sure we handle disconnect->reconnect->disconnect->reconnect
  useEffect(() => {
    const adapterName = localStorage.getItem('lastConnectedWallet');

    if (adapterName && adapterName in walletAdapters) {
      setLastConnectedWallet(adapterName as WalletAdapterName);
    }
  }, [wallet]);

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full relative overflow-visible"
          title="Pick a wallet"
        >
          <div className="flex flex-col min-w-[25em] grow">
            <WalletBlock
              name="Phantom"
              bgColor={WALLET_COLORS.phantom}
              recommended={true}
              lastConnected={lastConnectedWallet === 'phantom'}
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
              bgColor={WALLET_COLORS.coinbase}
              lastConnected={lastConnectedWallet === 'coinbase'}
              imgClassName='w-[9em] top-[5.3em] right-[2em] relative right-16'
              logo={WALLET_ICONS.coinbase}
              onClick={() => {
                dispatch(connectWalletAction('coinbase'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['coinbase'].readyState}
            />

            <WalletBlock
              name="Solflare"
              bgColor={WALLET_COLORS.solflare}
              lastConnected={lastConnectedWallet === 'solflare'}
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
              bgColor={WALLET_COLORS.walletconnect}
              lastConnected={lastConnectedWallet === 'walletconnect'}
              beta={true}
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
  recommended,
  onClick,
  imgClassName,
  beta,
  bgColor,
  readyState,
  className,
}: {
  name: string;
  logo: StaticImageData;
  lastConnected: boolean;
  imgClassName?: string;
  beta?: boolean;
  recommended?: boolean;
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
        <Image src={logo} alt={`${name} icon`} className={twMerge(
          "w-[12em] h-auto left-16 scale-x-[-1] transition-transform duration-500",
          isHovered ? 'translate-y-0' : 'translate-y-[18%]',
          imgClassName,
        )} />
      </div>

      <div
        className={twMerge(
          'flex p-3 w-full h-full relative items-center justify-center',
          disabled
            ? 'cursor-not-allowed opacity-40'
            : 'cursor-pointer duration-300',
        )}
        onClick={() => {
          if (disabled) return;

          onClick();
        }}
      >
        <div className="text-lg font-boldy flex items-center pt-1 pb-1 pl-3 pr-3">{name}</div>

        {recommended ? <div className={twMerge('absolute left-2 top-2 flex text-xs font-boldy text-white', isHovered ? 'opacity-100' : 'opacity-80')}>Team's choice ❤️</div> : null}
        {beta ? <div className={twMerge('absolute left-2 top-2 flex text-xs font-boldy text-white', isHovered ? 'opacity-100' : 'opacity-80')}>Beta Testing</div> : null}

        {lastConnected ? <div className={twMerge('absolute bottom-3 flex text-xs italic', isHovered ? 'text-white' : 'text-txtfade')}>Your Last Pick!</div> : null}
      </div>
    </div>
  );

  console.log(name, readyState);

  return walletBlock;
};
