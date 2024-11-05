import { WalletReadyState } from '@solana/wallet-adapter-base';
import { AnimatePresence } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import {
  connectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { walletAdapters } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';

import backpackLogo from '../../../public/images/backpack.png';
import coinbaseLogo from '../../../public/images/coinbase.png';
import phantomLogo from '../../../public/images/phantom.svg';
import solflareLogo from '../../../public/images/solflare.png';
import Modal from '../common/Modal/Modal';
import DisplayInfo from '../DisplayInfo/DisplayInfo';

export default function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full p-5 relative overflow-visible"
        >
          <div className="text-3xl opacity-80 font-special text-center mb-6">
            Pick a wallet
          </div>
          <div className="flex flex-col justify-center items-center gap-3">
            <WalletBlock
              name="Phantom"
              logo={phantomLogo}
              onClick={() => {
                dispatch(connectWalletAction('phantom'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['phantom'].readyState}
            />

            <WalletBlock
              name="Coinbase"
              logo={coinbaseLogo}
              onClick={() => {
                dispatch(connectWalletAction('coinbase'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['coinbase'].readyState}
            />

            <WalletBlock
              name="Solflare"
              logo={solflareLogo}
              onClick={() => {
                dispatch(connectWalletAction('solflare'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['solflare'].readyState}
            />

            <DisplayInfo body={"Backpack wallet is deprecated and will be removed from the app the 8th of november."} className='items-center justify-center max-w-[25em] bg-orange/30 border-orange' />

            <WalletBlock
              name="Backpack"
              logo={backpackLogo}
              onClick={() => {
                dispatch(connectWalletAction('backpack'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['backpack'].readyState}
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
  onClick,
  readyState,
  className,
}: {
  name: string;
  logo: StaticImageData;
  onClick: () => void;
  readyState: WalletReadyState;
  className?: string;
}) => {
  const disabled = readyState !== WalletReadyState.Installed;

  const walletBlock = (
    <div
      className={twMerge(
        'flex flex-row gap-3 items-center justify-between p-3 border rounded-lg w-[300px] h-[50px]',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer hover:bg-bcolor duration-300',
        className,
      )}
      onClick={() => {
        if (disabled) return;

        onClick();
      }}
    >
      <div className="flex flex-row items-center gap-3">
        <Image src={logo} alt={`${name} icon`} className="w-[30px]" />
        <p className="text-base font-semibold">{name}</p>
      </div>

      <div
        className={twMerge(
          'px-2 py-1 rounded-md',
          readyState === WalletReadyState.Installed && 'bg-green/10',
          readyState === WalletReadyState.NotDetected && 'bg-orange/10',
          readyState === WalletReadyState.Unsupported && 'bg-red/10',
          readyState === WalletReadyState.Loadable && 'bg-blue-400/10',
        )}
      >
        <p
          className={twMerge(
            'text-xs font-semibold font-mono',
            readyState === WalletReadyState.Installed && 'text-green',
            readyState === WalletReadyState.NotDetected && 'text-orange',
            readyState === WalletReadyState.Unsupported && 'text-red',
            readyState === WalletReadyState.Loadable && 'text-blue-400',
          )}
        >
          {(() => {
            return (
              {
                [WalletReadyState.NotDetected]: 'Not installed',
                [WalletReadyState.Loadable]: 'Not loaded yet',
                [WalletReadyState.Unsupported]: 'Not supported',
                [WalletReadyState.Installed]: 'Installed',
              }[readyState.toString()] ?? 'Cannot connect'
            );
          })()}
        </p>
      </div>
    </div>
  );

  console.log(name, readyState);

  return walletBlock;
};
