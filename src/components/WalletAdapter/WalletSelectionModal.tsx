import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import {
  connectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { WalletAdapterName } from '@/hooks/useWalletAdapters';
import { useDispatch, useSelector } from '@/store/store';
import { ImageRef, WalletAdapterExtended } from '@/types';

import Modal from '../common/Modal/Modal';

export default function WalletSelectionModal({
  adapters,
}: {
  adapters: WalletAdapterExtended[];
}) {
  const dispatch = useDispatch();
  const { modalIsOpen } = useSelector((s) => s.walletState);

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full items-center relative overflow-visible"
          title="Pick a wallet"
        >
          <div className={twMerge("flex flex-col min-w-[25em] grow items-center gap-4 pb-4 pt-4")}>
            {adapters.map((adapter) => {
              return <WalletBlock
                key={adapter.name}
                name={adapter.name}
                bgColor={adapter.color}
                beta={adapter.beta}
                recommended={adapter.recommended}
                logo={adapter.iconOverride ?? adapter.icon}
                imgClassName={({
                  // Add custom classes here for each wallet if needed
                  'Phantom': 'w-[10em] left-14',
                  'Coinbase Wallet': 'w-[6em] left-6 top-6',
                  Solflare: 'w-[6em] -left-2 top-12',
                  'Backpack': 'w-[5em] left-2 top-6',
                  'WalletConnect': 'w-[7em] left-8 top-2',
                  SquadsX: 'w-[6em] left-4 top-10',
                  'Privy': 'w-[8em] left-10 top-4',
                } as Record<WalletAdapterName, Partial<string>>)[adapter.name as WalletAdapterName] ?? ''}
                onClick={() => {
                  // Special handling for Privy - just open the login modal
                  if (adapter.name === 'Privy') {
                    // Close the wallet selection modal
                    dispatch(openCloseConnectionModalAction(false));
                    // The Privy adapter will handle opening the login modal
                    dispatch(connectWalletAction(adapter));
                  } else {
                    // Normal wallet connection
                    dispatch(connectWalletAction(adapter));
                    dispatch(openCloseConnectionModalAction(false));
                  }
                }}
              />
            })}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}

const WalletBlock = ({
  name,
  logo,
  recommended,
  onClick,
  imgClassName,
  beta,
  bgColor,
  className,
  disabled,
}: {
  name: string;
  logo?: string | ImageRef;
  imgClassName?: string;
  beta?: boolean;
  recommended?: boolean;
  onClick: () => void;
  bgColor: string;
  className?: string;
  disabled?: boolean;
}) => {
  const walletBlock = (
    <div className={twMerge(
      'flex relative overflow-hidden border-bcolor rounded-full border w-[80%] h-[3.7em]',
      className,
    )}
      key={name}
    >
      <div
        className={twMerge('absolute top-0 left-0 w-full h-full flex items-end justify-end opacity-80 grayscale-0')}
        style={{
          backgroundColor: bgColor,
        }}
      >
        {logo ? <Image src={logo} alt={`${name} icon`} width="150" height="150" className={twMerge(
          "w-[9em] h-auto relative left-8 top-16 scale-x-[-1]",
          imgClassName,
        )} /> : null}
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
          <div className="text-lg font-semibold flex items-center justify-center pt-1 pl-3 pr-3">{name}</div>

          {recommended ?
            <div className={twMerge(
              'flex text-[0.6em] font-semibold rounded-full bg-black text-yellow-200 border-2 pt-0 pl-3 pr-3 pb-0 border-yellow-200 opacity-80',
            )}>
              Recommended
            </div> : null}

          {beta ?
            <div className={twMerge(
              'flex text-[0.55em] font-semibold rounded-full bg-black text-yellow-200 border-2 pt-0 pl-3 pr-3 pb-0 border-yellow-200 opacity-80',
            )}>
              Beta
            </div> : null}
        </div>
      </div>
    </div>
  );

  return walletBlock;
};
