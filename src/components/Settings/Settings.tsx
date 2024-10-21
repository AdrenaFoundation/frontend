import { Connection } from '@solana/web3.js';
import React, { useEffect, useRef, useState } from 'react';
import { useCookies } from 'react-cookie';
import { twMerge } from 'tailwind-merge';

import { SOLANA_EXPLORERS_OPTIONS } from '@/constant';
import { SolanaExplorerOptions } from '@/types';

import settingsIcon from '../../../public/images/Icons/settings.svg';
import solanaBeachIcon from '../../../public/images/Icons/solana_beach.svg';
import solanaFMIcon from '../../../public/images/Icons/solana_fm.svg';
import solscanIcon from '../../../public/images/Icons/solscan.svg';
import solanaExplorerIcon from '../../../public/images/sol.svg';
import Button from '../common/Button/Button';
import Menu from '../common/Menu/Menu';
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
}) {
  const [cookies, setCookies] = useCookies(['solanaExplorer']);

  const [activeSolanaExplorer, setActiveSolanaExplorer] =
    useState<SolanaExplorerOptions>(
      cookies.solanaExplorer || 'Solana Explorer',
    );

  const SOLANA_EXPLORERS = Object.keys(
    SOLANA_EXPLORERS_OPTIONS,
  ) as Array<SolanaExplorerOptions>;

  useEffect(() => {
    window.adrena.settings.solanaExplorer = activeSolanaExplorer;

    setCookies('solanaExplorer', activeSolanaExplorer);
  }, [activeSolanaExplorer]);

  const WALLETS = {
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

  return (
    <Menu
      trigger={
        <Button
          variant={isGenesis ? 'text' : 'lightbg'}
          leftIcon={settingsIcon}
          className={'w-7 h-7 p-0'}
          iconClassName="w-4 h-4 opacity-75 hover:opacity-100"
        />
      }
      openMenuClassName={twMerge(
        'rounded-lg w-[300px] bg-secondary border border-bcolor p-3 shadow-lg transition duration-300',
        isGenesis ? 'sm:right-0 right-[-175px]' : 'right-0',
      )}
      disableOnClickInside={true}
      isDim={true}
    >
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

      <div className="w-full h-[1px] bg-bcolor my-5" />

      <h2>Explorer</h2>
      <div className="flex flex-col gap-2 mt-2">
        <p className="opacity-50">Select solana explorer</p>
        <div className="flex flex-col gap-1">
          {SOLANA_EXPLORERS.map((exp) => (
            <Button
              onClick={() => {
                setActiveSolanaExplorer(exp);
              }}
              leftIcon={WALLETS[exp].img}
              className={twMerge(
                'justify-start transition duration-300',
                exp !== activeSolanaExplorer &&
                'grayscale border-transparent hover:bg-transparent opacity-50',
              )}
              iconClassName="w-[20px] h-[20px]"
              variant={exp === activeSolanaExplorer ? 'outline' : 'outline'}
              title={exp}
              key={exp}
            />
          ))}
        </div>
      </div>
    </Menu>
  );
}
