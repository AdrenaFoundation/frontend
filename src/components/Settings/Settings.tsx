import { Switch } from '@mui/material';
import { Connection } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
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
import Modal from '../common/Modal/Modal';
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
  preferredSolanaExplorer,
  isMobile = false,
  showFeesInPnl,
  setShowFeesInPnl,
  setCloseMobileModal,
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
  preferredSolanaExplorer: SolanaExplorerOptions;
  isMobile?: boolean;
  showFeesInPnl: boolean;
  setShowFeesInPnl: (showFeesInPnl: boolean) => void;
  setCloseMobileModal?: (close: boolean) => void;
}) {

  const [, setCookies] = useCookies(['solanaExplorer']);

  const [activeSolanaExplorer, setActiveSolanaExplorer] =
    useState<SolanaExplorerOptions>(preferredSolanaExplorer);

  const SOLANA_EXPLORERS = Object.keys(
    SOLANA_EXPLORERS_OPTIONS,
  ) as Array<SolanaExplorerOptions>;

  useEffect(() => {
    window.adrena.settings.solanaExplorer = activeSolanaExplorer;

    setCookies('solanaExplorer', activeSolanaExplorer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSolanaExplorer]);

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
              leftIcon={EXPLORERS[exp].img}
              className={twMerge(
                'justify-start transition duration-300',
                exp !== activeSolanaExplorer &&
                'grayscale border-transparent hover:bg-transparent opacity-50',
              )}
              iconClassName="w-[20px] h-[20px]"
              variant="outline"
              title={exp}
              key={exp}
            />
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-bcolor my-5" />

      <h2>preferences</h2>
      <div className="flex flex-row mt-2 justify-between">
        <p className="opacity-50 w-full">Show fees in PnL</p>
        <Switch
          checked={showFeesInPnl}
          onChange={(event) => setShowFeesInPnl(event.target.checked)}
          size="small"
          sx={{
            transform: 'scale(0.7)',
            '& .MuiSwitch-switchBase': {
              color: '#ccc',
            },
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: '#1a1a1a',
            },
            '& .MuiSwitch-track': {
              backgroundColor: '#555',
            },
            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
              backgroundColor: '#10e1a3',
            },
          }}
        />
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
      {content}
    </Menu>
  );
}
