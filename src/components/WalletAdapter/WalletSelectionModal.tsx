import { WalletReadyState } from '@solana/wallet-adapter-base';
import Tippy from '@tippyjs/react';
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

function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  if (!modalIsOpen) return <></>;

  return (
    <Modal
      title=""
      close={() => dispatch(openCloseConnectionModalAction(false))}
      className="flex flex-col pb-8 pr-16 pl-16 sm:pr-8 sm:pl-8 relative overflow-visible"
    >
      <div className="text-3xl opacity-80 ml-auto mr-auto mb-8 font-specialmonster mt-5">
        Pick a wallet
      </div>
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0 flex-wrap">
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
          height={58}
          width={40}
          onClick={() => {
            dispatch(connectWalletAction('backpack'));
            dispatch(openCloseConnectionModalAction(false));
          }}
          readyState={walletAdapters['backpack'].readyState}
        />

        <WalletBloc
          name="WalletConnect"
          logo={walletConnectLogo}
          height={50}
          width={50}
          onClick={() => {
            dispatch(connectWalletAction('walletConnect'));
            dispatch(openCloseConnectionModalAction(false));
          }}
          readyState={walletAdapters['walletConnect'].readyState}
        />
      </div>
    </Modal>
  );
}

const WalletBloc = ({
  name,
  logo,
  onClick,
  height,
  width,
  readyState,
  className,
}: {
  name: string;
  logo: StaticImageData;
  onClick: () => void;
  height: number;
  width: number;
  readyState: WalletReadyState;
  className?: string;
}) => {
  const disabled =
    readyState !== WalletReadyState.Installed || name === 'WalletConnect';

  const walletBloc = (
    <div
      className={twMerge(
        'flex flex-col items-center justify-center p-3 border border-gray-200 rounded-2xl h-40 w-40 relative',
        disabled
          ? 'cursor-not-allowed opacity-40'
          : 'cursor-pointer hover:bg-gray-200 duration-300',
        className,
      )}
      onClick={() => {
        if (disabled) return;

        onClick();
      }}
    >
      <Image src={logo} alt={`${name} icon`} height={height} width={width} />

      <p className="mt-6">{name}</p>

      <div className="h-1 w-32 bg-gray-300 absolute bottom-2"></div>
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
        {walletBloc}
      </Tippy>
    );
  }

  return walletBloc;
};

export default WalletSelectionModal;
