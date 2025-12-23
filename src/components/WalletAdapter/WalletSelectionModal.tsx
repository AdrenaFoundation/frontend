import Tippy from '@tippyjs/react';
import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import adxLogo from '@/../public/images/adx.svg';
import arrowRight from '@/../public/images/arrow-right.svg';
import infoIcon from '@/../public/images/Icons/info.svg';
import {
  connectWalletAction,
  openCloseConnectionModalAction,
} from '@/actions/walletActions';
import { useDispatch, useSelector } from '@/store/store';
import { WalletAdapterExtended } from '@/types';
import { BulletPoint } from '@/utils';

import Modal from '../common/Modal/Modal';

export default function WalletSelectionModal({
  adapters,
}: {
  adapters: WalletAdapterExtended[];
}) {
  const { t } = useTranslation();
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
          title={t('common.connectNow')}
        >
          <div className={twMerge("flex flex-col grow items-start gap-6 pb-4 pt-4 w-full")}>
            {privyAdapter && (
              <div className="w-full px-3 sm:px-4">
                <div className="space-y-3 sm:space-y-4">
                  <button
                    className="overflow-hidden group relative w-full h-24 border border-bcolor rounded-md cursor-pointer group transition-all hover:opacity-90 shadow-md hover:shadow-lg flex items-center justify-between px-3 sm:px-4 focus:outline-none"
                    style={{
                      background: 'linear-gradient(90deg, #1a1b3a, #2f3c7e, #5b3ea8)',
                    }}
                    onClick={() => {
                      dispatch(openCloseConnectionModalAction(false));
                      dispatch(connectWalletAction(privyAdapter));
                    }}
                  >
                    <div className='flex flex-col gap-1'>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm sm:text-base text-white font-bold">{t('common.smartAccount')}</span>
                        <Tippy
                          placement='top'
                          content={
                            <div className="space-y-2">
                              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                                {t('common.smartAccountDescription')}
                              </p>
                            </div>
                          }
                        >
                          <div
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.preventDefault()}
                          >
                            <Image
                              src={infoIcon}
                              width={14}
                              height={14}
                              alt="info icon"
                              className="opacity-50 hover:opacity-100 transition-opacity cursor-help"
                            />
                          </div>
                        </Tippy>
                      </div>

                      {privyAdapter.beta && (
                        <span className="px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wide bg-white/10 backdrop-blur-sm text-white/90 border border-white/20 shadow-[0_0_4px_rgba(255,255,255,0.1)]">
                          {t('common.new')}
                        </span>
                      )}
                    </div>

                    <Image
                      src={adxLogo}
                      alt={`ADX logo`}
                      width={150}
                      height={150}
                      className="h-25 w-25 object-contain relative top-4 grayscale opacity-5"
                    />

                    <Image
                      src={arrowRight}
                      alt={`Arrow right icon`}
                      width={32}
                      height={32}
                      className="h-10 w-10 object-contain group-hover:animate-[arrowSlide_2s_ease-in-out_infinite]"
                    />

                    <div className="absolute bottom-1 right-2 text-xxs font-medium text-[#cbd5e1]/40 mix-blend-screen">
                      {t('common.poweredBy')} <span className="text-[#cbd5e1]/70">Privy</span>
                    </div>
                  </button>

                  {/* Benefits */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 pt-1">
                    <BulletPoint text={t('common.autoConfirm')} />
                    <BulletPoint text={t('common.secure')} />
                    <BulletPoint text={t('common.easyToUse')} />

                    <Link
                      href='https://www.privy.io/wallets'
                      target="_blank"
                      className={twMerge(
                        'text-xs opacity-50 hover:opacity-100 transition-opacity duration-300 hover:grayscale-0 flex ml-auto',
                      )}
                    >
                      {t('common.learnMoreAboutPrivy')}
                    </Link>
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

                  <Tippy content={t('common.directConnectDescription')}>
                    <div className="relative flex justify-center text-xs cursor-help">
                      <span className="px-3 bg-secondary text-white/50">{t('common.directConnect')}</span>
                    </div>
                  </Tippy>
                </div>
              </div>
            )}

            {/* Native Adapters Grid */}
            {nativeAdapters.length > 0 && (
              <div className="w-full px-3 sm:px-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                  {nativeAdapters.map((adapter) => (
                    <button
                      key={adapter.name}
                      className="relative overflow-hidden rounded-md transition-all group flex items-center gap-2 border border-bcolor pt-1 pb-1 pl-2 pr-1 opacity-90 hover:opacity-100"
                      style={{
                        background: `linear-gradient(90deg, ${adapter.color}08 0%, ${adapter.color}03 100%)`,
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
                        <div className="w-4 h-4 flex-shrink-0 relative z-10 flex items-center justify-center">
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
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal >
      )
      }
    </AnimatePresence >
  );
}
