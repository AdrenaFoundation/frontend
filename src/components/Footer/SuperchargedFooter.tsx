import { Connection } from '@solana/web3.js';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import adrenaLogo from '@/../public/images/adrena_logo_adx_white.svg';
import chatIcon from '@/../public/images/chat-text.svg';
import discorLogo from '@/../public/images/discord.png';
import githubIcon from '@/../public/images/github.svg';
import bookIcon from '@/../public/images/Icons/book.svg';
import documentIcon from '@/../public/images/Icons/document.svg';
import fuelIcon from '@/../public/images/Icons/fuel-pump-fill.svg';
import searchIcon from '@/../public/images/Icons/search-user.svg';
import voteIcon from '@/../public/images/Icons/vote-icon.svg';
import offsideLabsLogo from '@/../public/images/offside-labs-logo.svg';
import ottersecLogo from '@/../public/images/ottersec-logo.svg';
import rpcIcon from '@/../public/images/rpc.svg';
import xLogo from '@/../public/images/x.svg';
import usePriorityFee from '@/hooks/usePriorityFees';
import { useSelector } from '@/store/store';
import { PageProps } from '@/types';
import { formatNumber } from '@/utils';

import ChatContainer from '../Chat/ChatContainer';
import FooterAnnouncement from './FooterAnnouncement';
import FooterStats from './FooterStats';
import FooterStatus from './FooterStatus';

export default function SuperchargedFooter({
  disableChat,
  isMobile,
  isChatOpen,
  setIsChatOpen,
  mainPool,
  activeRpc,
  rpcInfos,
  setIsSearchUserProfilesOpen,
}: {
  disableChat?: boolean;
  isMobile: boolean;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  mainPool: PageProps['mainPool'];
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  setIsSearchUserProfilesOpen: (open: boolean) => void;
}) {
  const [title, setTitle] = useState('Chat');
  const priorityFeeAmounts = usePriorityFee();
  const priorityFeeOption = useSelector(
    (state) => state.settings.priorityFeeOption,
  );

  const [isNewNotification, setIsNewNotification] = useState(false);

  const [isAnnouncementView, setIsAnnouncementView] = useState(false);

  const currentPriorityFeeValue =
    priorityFeeAmounts[priorityFeeOption] || priorityFeeAmounts.medium;

  const [showAudits, setShowAudits] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnnouncementView((prev) => !prev);
    }, 10000); //
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <footer className="fixed bottom-0 flex flex-row items-center justify-between w-full px-4 py-0 bg-secondary border-t border-t-inputcolor z-50">
        <div className="flex flex-row items-center ">
          <div className="p-2 pl-0 pr-4 border-r border-inputcolor">
            <Image
              src={adrenaLogo}
              alt="Adrena Logo"
              className="w-4 h-4"
              height={12}
              width={12}
            />
          </div>

          <div
            className="relative hidden xl:flex flex-row items-center gap-3 p-2 px-4 border-r border-inputcolor hover:bg-third cursor-pointer"
            onMouseEnter={() => setShowAudits(true)}
            onMouseLeave={() => setShowAudits(false)}
          >
            <p className="text-xs font-interMedium">Audited by</p>
            <Image
              src={ottersecLogo}
              alt="OtterSec Logo"
              className="w-4 h-4"
              height={12}
              width={12}
            />
            <Image
              src={offsideLabsLogo}
              alt="Offside Labs Logo"
              className="w-4 h-4"
              height={12}
              width={12}
            />

            <AnimatePresence>
              {showAudits && (
                <motion.div
                  initial={{ opacity: 0, y: '-2rem' }}
                  animate={{ opacity: 1, y: '-2.5rem' }}
                  exit={{ opacity: 0, y: '-2rem' }}
                  transition={{ duration: 0.3 }}
                  className="absolute left-0 bottom-0 min-w-[18.75rem] flex flex-col gap-3 bg-secondary border border-inputcolor rounded-lg p-3 z-50"
                >
                  <Link
                    href="https://2570697779-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSrdLcmUOicAVBsHQeHAa%2Fuploads%2FJwTdoGS6JrPpPxYMJJAh%2FAdrena_Dec_2024_OffsideLabs.pdf?alt=media&token=f9f9753d-cc91-457a-a674-1fd0d3b5460a"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-3 border border-bcolor hover:bg-third p-2 pr-4 rounded-lg transition-colors duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-inputcolor">
                      <Image
                        src={documentIcon}
                        alt="Document Icon"
                        width={14}
                        height={14}
                        className="w-3 h-3"
                      />
                    </div>

                    <div>
                      <p className="text-base font-interMedium">
                        Offside Labs Audit.pdf
                      </p>
                      <p className="text-xs font-mono opacity-50">
                        02. Feb 2025
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="https://2570697779-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FSrdLcmUOicAVBsHQeHAa%2Fuploads%2FflVY9AoiV2b2dzv0wbZ3%2Fadrena_audit_ottersec.pdf?alt=media&token=25f7c2c0-052f-4fce-a44c-759d9bdd39b5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-row items-center gap-3 border border-bcolor  hover:bg-third p-2 rounded-lg transition-colors duration-300 cursor-pointer"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-inputcolor">
                      <Image
                        src={documentIcon}
                        alt="Document Icon"
                        width={14}
                        height={14}
                        className="w-3 h-3"
                      />
                    </div>

                    <div>
                      <p className="text-base font-interMedium">
                        Ottersec Audit.pdf
                      </p>
                      <p className="text-xs font-mono opacity-50">
                        02. Feb 2025
                      </p>
                    </div>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <FooterStatus />

          <div className="flex flex-row items-center gap-2 p-2 px-4 border-r border-inputcolor">
            <Image
              src={fuelIcon}
              alt="Priority Fee Settings"
              className="w-3 h-3 opacity-50"
              height={12}
              width={12}
            />
            <p className="text-xs font-interMedium capitalize">
              {priorityFeeOption}
              <span className="font-mono ml-1 text-xs">
                @ {formatNumber(currentPriorityFeeValue, 0)} μLamport / CU
              </span>
            </p>
          </div>

          <div className="flex flex-row items-center gap-1 p-2 px-4 border-r border-inputcolor">
            <Image
              src={rpcIcon}
              alt="RPC Settings"
              className="w-4 h-4 opacity-50"
              height={12}
              width={12}
            />
            <p className="text-xs font-interMedium"> {activeRpc.name} </p>
            <div
              className={twMerge(
                'w-1.5 h-1.5 bg-green rounded-full ml-1',
                (() => {
                  const rpcInfo = rpcInfos.find(
                    (info) => info.name === activeRpc.name,
                  );
                  if (
                    rpcInfo &&
                    rpcInfo.latency !== null &&
                    rpcInfo.latency < 100
                  )
                    return 'bg-green';
                  if (
                    rpcInfo &&
                    rpcInfo.latency !== null &&
                    rpcInfo.latency < 500
                  )
                    return 'bg-orange';
                  return 'bg-red';
                })(),
              )}
            />
            <p className="text-xxs font-mono">
              {rpcInfos.find((info) => info.name === activeRpc.name)?.latency}ms
            </p>
          </div>
        </div>

        <div className="flex flex-row items-center">
          <AnimatePresence mode="wait">
            {isAnnouncementView ? (
              <FooterAnnouncement />
            ) : (
              <FooterStats mainPool={mainPool} />
            )}
          </AnimatePresence>

          {disableChat === true ? null : (
            <div
              className="flex flex-row items-center gap-2 p-1.5 px-4 border-l border-inputcolor cursor-pointer hover:bg-third transition-colors duration-300"
              onClick={() => {
                setIsChatOpen(!isChatOpen);
              }}
            >
              <Image
                src={chatIcon}
                alt="Chat Icon"
                className="w-3 h-3"
                height={12}
                width={12}
              />
              <p className="text-sm font-interMedium capitalize">
                <span className="opacity-50">#</span> {title}
              </p>
              {isNewNotification ? (
                <div className="flex items-center justify-center bg-redbright min-w-1.5 h-1.5 rounded-full ml-2" />
              ) : null}
            </div>
          )}

          <div
            className="p-2 px-4 border-l border-inputcolor cursor-pointer hover:bg-third transition-colors duration-300"
            onClick={() => setIsSearchUserProfilesOpen(true)}
          >
            <Image
              src={searchIcon}
              alt="Search Icon"
              className="w-3.5 h-3.5"
              height={12}
              width={12}
            />
          </div>

          <div className="hidden 2xl:flex flex-row items-center gap-4 p-2 px-4 border-l border-inputcolor">
            <Link
              href="https://docs.adrena.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={bookIcon}
                alt="Learn Icon"
                className="w-3 h-3 hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>

            <Link
              href="https://dao.adrena.xyz/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={voteIcon}
                alt="Vote Icon"
                className="w-3 h-3 hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
          </div>

          <div className="hidden xl:flex flex-row items-center gap-4 p-2 pl-4 pr-0 border-l border-inputcolor">
            <Link
              href="https://github.com/AdrenaFoundation"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={githubIcon}
                alt="GitHub Icon"
                className="w-3 h-3 hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
            <Link
              href="https://discord.com/invite/adrena"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={discorLogo}
                alt="Discord Logo"
                className="w-3 h-3 hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
            <Link
              href="https://x.com/AdrenaProtocol"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src={xLogo}
                alt="X Logo"
                className="w-3 h-3 hover:opacity-50 transition-opacity duration-300 cursor-pointer"
                height={12}
                width={12}
              />
            </Link>
          </div>
        </div>
      </footer>

      {disableChat === true ? null : (
        <ChatContainer
          title={title}
          setTitle={setTitle}
          setIsNewNotification={setIsNewNotification}
          isMobile={isMobile}
          isChatOpen={isChatOpen}
          setIsChatOpen={setIsChatOpen}
        />
      )}
    </>
  );
}
