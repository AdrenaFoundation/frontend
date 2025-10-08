import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../public/images/adx.svg';
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

  const privyAdapter = adapters.find(adapter => adapter.name === 'Privy');
  const nativeAdapters = adapters.filter(adapter => adapter.name !== 'Privy');

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <Modal
          close={() => dispatch(openCloseConnectionModalAction(false))}
          className="flex flex-col w-full sm:w-[90vw] md:w-[28em] max-w-[30em] items-center relative overflow-visible"
          title="Pick a wallet"
        >
          <div className={twMerge("flex flex-col grow items-start gap-6 pb-4 pt-4 w-full")}>
            {/* Privy Section */}
            {privyAdapter && (
              <div className="w-full px-3 sm:px-4">
                <div className="space-y-3 sm:space-y-4">
                  {/* Title */}
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                      Connect from socials or with any Solana wallet supported by Privy. Switch between your external wallets and Adrena account instantly without disconnecting.
                    </p>
                  </div>

                  {/* Card */}
                  <button
                    className="relative w-full h-11 rounded-lg cursor-pointer group transition-all hover:opacity-90 shadow-md hover:shadow-lg flex items-center justify-between px-3 sm:px-4"
                    style={{
                      background: 'linear-gradient(to right, #ED1C24, #5B4FFF)',
                    }}
                    onClick={() => {
                      dispatch(openCloseConnectionModalAction(false));
                      dispatch(connectWalletAction(privyAdapter));
                    }}
                  >
                    <span className="text-sm sm:text-base text-white font-semibold">Adrena Account × Privy</span>
                    {privyAdapter.beta && (
                      <span className="px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded text-[0.65rem] font-bold text-white uppercase tracking-wide">
                        NEW
                      </span>
                    )}
                  </button>

                  {/* Benefits */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/90">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/60 font-medium">Auto-confirm</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/90">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/60 font-medium">Secure</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/90">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-xs text-white/60 font-medium">Easy to use</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Separator */}
            {privyAdapter && nativeAdapters.length > 0 && (
              <div className="w-full px-3 sm:px-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-secondary text-white/50">Direct Connect</span>
                  </div>
                </div>
              </div>
            )}

            {/* Native Adapters Grid */}
            {nativeAdapters.length > 0 && (
              <div className="w-full px-3 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {nativeAdapters.map((adapter) => (
                    <button
                      key={adapter.name}
                      className="relative overflow-hidden rounded-lg px-3 py-2.5 transition-all group flex items-center gap-3"
                      style={{
                        background: `linear-gradient(90deg, ${adapter.color}08 0%, ${adapter.color}03 100%)`,
                        borderLeft: `4px solid ${adapter.color}70`,
                        borderTop: `1px solid ${adapter.color}10`,
                        borderRight: `1px solid ${adapter.color}10`,
                        borderBottom: `1px solid ${adapter.color}10`,
                      }}
                      onClick={() => {
                        dispatch(connectWalletAction(adapter));
                        dispatch(openCloseConnectionModalAction(false));
                      }}
                    >
                      {/* Enhanced color on hover */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        style={{
                          background: `linear-gradient(90deg, ${adapter.color}20 0%, ${adapter.color}08 100%)`,
                        }}
                      />

                      {/* Logo */}
                      {adapter.iconOverride ?? adapter.icon ? (
                        <div className="w-8 h-8 flex-shrink-0 relative z-10 flex items-center justify-center">
                          <Image
                            src={adapter.iconOverride ?? adapter.icon}
                            alt={`${adapter.name} icon`}
                            width={32}
                            height={32}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      ) : null}

                      {/* Name */}
                      <span className="text-sm font-semibold text-white relative z-10">
                        {adapter.name}
                      </span>

                      {/* Beta badge */}
                      {adapter.beta && (
                        <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-yellow-500/20 border border-yellow-500/30 rounded text-[0.6rem] font-semibold text-yellow-200 z-10">
                          Beta
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
}
