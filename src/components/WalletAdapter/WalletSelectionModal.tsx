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
import walletConnectLogo from '../../../public/images/waller-connect.png';
import Modal from '../common/Modal/Modal';

function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  if (!modalIsOpen) return <></>;

  return (
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
}: {
  name: string;
  logo: StaticImageData;
  onClick: () => void;
  height: number;
  width: number;
  readyState: WalletReadyState;
}) => {
  const disabled =
    readyState !== WalletReadyState.Installed || name === 'WalletConnect';

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
