import { Connection } from '@solana/web3.js';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { setSettings } from '@/actions/settingsActions';
import { SOLANA_EXPLORERS_OPTIONS } from '@/constant';
import { useDispatch, useSelector } from '@/store/store';
import { SolanaExplorerOptions } from '@/types';

import settingsIcon from '../../../public/images/Icons/settings.svg';
import solanaBeachIcon from '../../../public/images/Icons/solana_beach.svg';
import solanaFMIcon from '../../../public/images/Icons/solana_fm.svg';
import solscanIcon from '../../../public/images/Icons/solscan.svg';
import solanaExplorerIcon from '../../../public/images/sol.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
import Modal from '../common/Modal/Modal';
import Switch from '../common/Switch/Switch';
import RPCSetting from './RPCSetting';

export default function Settings({
  activeRpc,
  rpcInfos,
  autoRpcMode,
  customRpcUrl,
  customRpcLatency,
  favoriteRpc,
  setAutoRpcMode,
  setCustomRpcUrl,
  setFavoriteRpc,
  isGenesis = false,
  isMobile = false,
  setCloseMobileModal,
  isOpen,
  setIsOpen,
}: {
  activeRpc: {
    name: string;
    connection: Connection;
  };
  rpcInfos: {
    name: string;
    latency: number | null;
  }[];
  customRpcLatency: number | null;
  autoRpcMode: boolean;
  customRpcUrl: string | null;
  favoriteRpc: string | null;
  setAutoRpcMode: (autoRpcMode: boolean) => void;
  setCustomRpcUrl: (customRpcUrl: string | null) => void;
  setFavoriteRpc: (favoriteRpc: string) => void;
  isIcon?: boolean;
  isGenesis?: boolean;
  isMobile?: boolean;
  setCloseMobileModal?: (close: boolean) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) {
  const dispatch = useDispatch();
  const settings = useSelector((state) => state.settings);

  const SOLANA_EXPLORERS = Object.keys(
    SOLANA_EXPLORERS_OPTIONS,
  ) as Array<SolanaExplorerOptions>;

  const EXPLORERS = {
    'Solana Explorer': {
      img: solanaExplorerIcon,
    },
    'Solana Beach': {
      img: solanaBeachIcon,
    },
    Solscan: {
      img: solscanIcon,
    },
    'Solana FM': {
      img: solanaFMIcon,
    },
  } as const;

  const content = (
    <>
      <RPCSetting
        activeRpc={activeRpc}
        rpcInfos={rpcInfos}
        autoRpcMode={autoRpcMode}
        customRpcUrl={customRpcUrl}
        customRpcLatency={customRpcLatency}
        favoriteRpc={favoriteRpc}
        setAutoRpcMode={setAutoRpcMode}
        setCustomRpcUrl={setCustomRpcUrl}
        setFavoriteRpc={setFavoriteRpc}
      />

      <div className="w-full h-[1px] bg-bcolor my-3" />

      <h4 className="font-interSemibold">Explorer</h4>
      <div className="flex flex-col gap-2 mt-1">
        <p className="text-sm opacity-50">Select solana explorer</p>
        <div className="flex flex-col gap-1">
          {SOLANA_EXPLORERS.map((exp) => (
            <Button
              onClick={() => {
                dispatch(
                  setSettings({
                    preferredSolanaExplorer: exp,
                  }),
                );
              }}
              leftIcon={EXPLORERS[exp].img}
              className={twMerge(
                'justify-start transition duration-300 rounded-lg px-2 py-4 border border-bcolor hover:bg-third bg-third hover:opacity-100 hover:grayscale-0',
                exp !== settings.preferredSolanaExplorer &&
                'grayscale border-transparent bg-transparent hover:bg-transparent opacity-30',
              )}
              iconClassName="w-[20px] h-[20px]"
              variant="outline"
              title={exp}
              key={exp}
            />
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-bcolor my-3" />

      <h4 className="font-interSemibold">Preferences</h4>
      <div className="flex flex-col gap-1 mt-1">
        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-boldy opacity-50 w-full">Disable chat</p>
          <Switch
            checked={settings.disableChat}
            onChange={() => {
              dispatch(
                setSettings({
                  disableChat: !settings.disableChat,
                }),
              );
            }}
            size="small"
          />
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-boldy opacity-50 w-full">
            Disable Friend Requests
          </p>
          <Switch
            checked={settings.disableFriendReq}
            onChange={() => {
              dispatch(
                setSettings({
                  disableFriendReq: !settings.disableFriendReq,
                }),
              );
            }}
            size="small"
          />
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-boldy opacity-50 w-full">
            Show fees in PnL
          </p>
          <Switch
            checked={settings.showFeesInPnl}
            onChange={() => {
              dispatch(
                setSettings({
                  showFeesInPnl: !settings.showFeesInPnl,
                }),
              );
            }}
            size="small"
          />
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-boldy opacity-50 w-full">
            Display popup when position closes
          </p>
          <Switch
            checked={settings.showPopupOnPositionClose}
            onChange={() => {
              dispatch(
                setSettings({
                  showPopupOnPositionClose: !settings.showPopupOnPositionClose,
                }),
              );
            }}
            size="small"
          />
        </div>

        <div className="flex flex-row justify-between items-center">
          <p className="text-sm font-boldy opacity-50 w-full">
            Disable in-app notifications
          </p>
          <Switch
            checked={!settings.enableAdrenaNotifications}
            onChange={() => {
              dispatch(
                setSettings({
                  enableAdrenaNotifications: !settings.enableAdrenaNotifications,
                }),
              );
            }}
            size="small"
          />
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Modal
        close={() => setCloseMobileModal?.(false)}
        className="flex flex-col w-full p-5 relative overflow-visible"
      >
        {content}
      </Modal>
    );
  }
  return (
    <Menu
      trigger={
        <div className="p-1 px-1.5 hover:bg-third transition-colors cursor-pointer rounded-r-md">
          <Image
            src={settingsIcon}
            alt="Settings Icon"
            width={14}
            height={14}
            className="w-[0.875rem] h-[0.875rem]"
          />
        </div>
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[18.75rem] bg-secondary border border-bcolor p-3 shadow-lg transition duration-300',
        isGenesis ? 'sm:right-0 right-[-175px]' : 'right-0',
      )}
      disableOnClickInside={true}
      isDim={true}
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      {content}
    </Menu>
  );
}
