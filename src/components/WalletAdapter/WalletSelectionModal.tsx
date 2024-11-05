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

import Modal from '../common/Modal/Modal';
import { WALLET_COLORS, WALLET_ICONS } from './WalletAdapter';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

export default function WalletSelectionModal() {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);
  const isMobile = useBetterMediaQuery('(max-width: 640px)');

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full items-center relative overflow-visible"
          title="Pick a wallet"
        >
          <div className={twMerge("flex flex-col min-w-[25em] grow items-center", isMobile ? 'gap-4 pb-4' : '')}>
            <WalletBlock
              isMobile={isMobile}
              name="Phantom"
              bgColor={WALLET_COLORS.phantom}
              recommended={true}
              imgClassName='top-[5.3em] relative'
              logo={WALLET_ICONS.phantom}
              onClick={() => {
                dispatch(connectWalletAction('phantom'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['phantom'].readyState}
            />

            <WalletBlock
              isMobile={isMobile}
              name="Coinbase"
              bgColor={WALLET_COLORS.coinbase}
              imgClassName='w-[9em] top-[5.3em] right-[2em] relative right-16'
              logo={WALLET_ICONS.coinbase}
              onClick={() => {
                dispatch(connectWalletAction('coinbase'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['coinbase'].readyState}
            />

            <WalletBlock
              isMobile={isMobile}
              name="Solflare"
              bgColor={WALLET_COLORS.solflare}
              imgClassName='w-[9em] top-[5.3em] right-[2em] relative'
              logo={WALLET_ICONS.solflare}
              onClick={() => {
                dispatch(connectWalletAction('solflare'));
                dispatch(openCloseConnectionModalAction(false));
              }}
              readyState={walletAdapters['solflare'].readyState}
            />

            <WalletBlock
              isMobile={isMobile}
              name="WalletConnect"
              bgColor={WALLET_COLORS.walletconnect}
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
  isMobile,
  logo,
  recommended,
  onClick,
  imgClassName,
  beta,
  bgColor,
  readyState,
  className,
}: {
  name: string;
  isMobile: boolean | null;
  logo: StaticImageData;
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
      'flex relative overflow-hidden',
      isMobile ? 'border-bcolor rounded-full border w-[80%] h-[3.7em]' : 'flex-row w-full h-[5em]',
      className,
    )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={twMerge('absolute top-0 left-0 w-full h-full flex items-end justify-end', isHovered || isMobile ? 'opacity-80 grayscale-0' : 'opacity-10 grayscale')}
        style={{
          backgroundColor: bgColor,
        }}
      >
        <Image src={logo} alt={`${name} icon`} className={twMerge(
          "w-[12em] h-auto left-16 scale-x-[-1] transition-transform duration-500",
          isHovered || isMobile ? 'translate-y-0' : 'translate-y-[18%]',
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
        <div className='flex relative flex-col items-center justify-center'>
          <div className="text-lg font-boldy flex items-center justify-center pt-1 pb-1 pl-3 pr-3">{name}</div>

          {recommended ?
            <div className={twMerge(
              'flex text-[0.6em] font-boldy rounded-full bg-black text-yellow-200 border-2 pt-0 pl-3 pr-3 pb-0 border-yellow-200',
              isHovered ? 'opacity-100' : 'opacity-80',
            )}>
              Recommended
            </div> : null}

          {beta ?
            <div className={twMerge(
              'flex text-[0.6em] font-boldy rounded-full bg-black text-yellow-200 border-2 pt-0 pl-3 pr-3 pb-0 border-yellow-200',
              isHovered ? 'opacity-100' : 'opacity-80',
            )}>
              Beta
            </div> : null}
        </div>
      </div>
    </div>
  );

  console.log(name, readyState);

  return walletBlock;
};
