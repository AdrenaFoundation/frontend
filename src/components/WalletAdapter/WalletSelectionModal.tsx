import { WalletReadyState } from '@solana/wallet-adapter-base';
import Tippy from '@tippyjs/react';
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
import phantomLogo from '../../../public/images/phantom.png';
import walletConnectLogo from '../../../public/images/wallet-connect.png';
import Modal from '../common/Modal/Modal';
import GeoBlockedModal from '../GeoBlockedModal/GeoBlockedModal';

function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  if (!window.adrena.geoBlockingData.allowed) {
    return (
      <GeoBlockedModal
        isOpen={modalIsOpen}
        closeTrigger={() => dispatch(openCloseConnectionModalAction(false))}
      />
    );
  }

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
          <div className="flex flex-col justify-center items-center gap-3 sm:flex-row">
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
              name="Backpack"
              logo={backpackLogo}
              onClick={() => {
                dispatch(connectWalletAction('backpack'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['backpack'].readyState}
            />

            <WalletBlock
              name="WalletConnect"
              logo={walletConnectLogo}
              onClick={() => {
                dispatch(connectWalletAction('walletConnect'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['walletConnect'].readyState}
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
  const disabled =
    readyState !== WalletReadyState.Installed || name === 'WalletConnect';

  const walletBlock = (
    <div
      className={twMerge(
        'flex flex-row sm:flex-col gap-3 items-center justify-center p-3 border rounded-lg w-[300px] h-[50px] sm:h-40 sm:w-40 relative',
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
      <Image src={logo} alt={`${name} icon`} className="w-[20px] sm:w-[50px]" />

      <p className="sm:mt-6">{name}</p>

      <div className="hidden sm:block h-1 w-32 bg-bcolor right-3 absolute sm:bottom-2 sm:right-auto"></div>
    </div>
  );

  if (disabled) {
    return (
      <Tippy
        content={
          <div className="text-sm w-auto flex flex-col justify-between">
            {(() => {
              if (name == 'WalletConnect') {
                return 'Support coming soon';
              }

              return (
                {
                  [WalletReadyState.NotDetected]: 'Wallet is not installed',
                  [WalletReadyState.Loadable]: 'Wallet is not loaded yet',
                  [WalletReadyState.Unsupported]: 'Wallet is not supported',
                }[readyState.toString()] ?? 'Cannot connect wallet'
              );
            })()}
          </div>
        }
        placement="bottom"
      >
        {walletBlock}
      </Tippy>
    );
  }

  return walletBlock;
};

export default WalletSelectionModal;
