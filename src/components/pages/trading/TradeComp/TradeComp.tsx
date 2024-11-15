import { Wallet } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import IntegratedTerminal from '@/components/Footer/IntegratedTerminal';
import { Action } from '@/pages/trade';
import { PositionExtended, Token, WalletAdapterExtended } from '@/types';

import LongShortTradingInputs from '../TradingInputs/LongShortTradingInputs';
import SwapTradingInputs from '../TradingInputs/SwapTradingInputs';

export default function TradeComp({
  selectedAction,
  setSelectedAction,
  tokenA,
  tokenB,
  wallet,
  connected,
  setTokenA,
  setTokenB,
  openedPosition,
  triggerWalletTokenBalancesReload,
  className,
  isBigScreen,
  activeRpc,
  terminalId,
  adapters,
}: {
  selectedAction: Action;
  setSelectedAction: (title: Action) => void;
  tokenA: Token | null;
  tokenB: Token | null;
  wallet: Wallet | null;
  connected: boolean;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
  openedPosition: PositionExtended | null;
  triggerWalletTokenBalancesReload: () => void;
  className?: string;
  isBigScreen?: boolean | null;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  terminalId: string;
  adapters: WalletAdapterExtended[];
}) {
  const [isJupSwap, setIsJupSwap] = useState(true);
  const [isWhitelistedSwapper, setIsWhitelistedSwapper] = useState(false);

  useEffect(() => {
    if (window.adrena.client.mainPool.whitelistedSwapper.toBase58() == wallet?.publicKey?.toBase58()) {
      setIsWhitelistedSwapper(true);
    }
  }, [wallet]);

  return (
    <div
      className={twMerge(
        'sm:flex w-full bg-main/90 flex-col sm:flex-row lg:flex-col sm:border sm:rounded-lg ',
        isBigScreen ? 'mt-0 w-[30em]' : 'mt-4',
        className,
      )}
    >
      <div className="w-full flex flex-col sm:p-3">
        <TabSelect
          selected={selectedAction}
          tabs={[
            { title: 'long', activeColor: 'border-b-green text-green' },
            { title: 'short', activeColor: 'border-b-red text-red' },
            { title: 'swap', activeColor: 'border-white' },
          ]}
          onClick={(title) => {
            setSelectedAction(title);
          }}
          wrapperClassName="hidden sm:flex"
        />

        {window.adrena.client.tokens.length && tokenA && tokenB && (
          <>
            {selectedAction === 'long' || selectedAction === 'short' ? (
              <LongShortTradingInputs
                side={selectedAction}
                allowedTokenA={window.adrena.client.tokens}
                allowedTokenB={window.adrena.client.tokens.filter(
                  (t) => !t.isStable,
                )}
                tokenA={tokenA}
                tokenB={tokenB}
                openedPosition={openedPosition}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
                wallet={wallet}
                connected={connected}
                triggerWalletTokenBalancesReload={
                  triggerWalletTokenBalancesReload
                }
              />
            ) : (
              <>
                {isJupSwap || !isWhitelistedSwapper ? (
                  <IntegratedTerminal
                    connected={connected}
                    activeRpc={activeRpc}
                    id={terminalId}
                    className="bg-transparent border-transparent h-[575px] min-w-[300px] w-full p-0"
                    adapters={adapters}
                  />
                ) : (
                  <SwapTradingInputs
                    allowedTokenA={window.adrena.client.tokens}
                    allowedTokenB={window.adrena.client.tokens}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    setTokenA={setTokenA}
                    setTokenB={setTokenB}
                    wallet={wallet}
                    connected={connected}
                    triggerWalletTokenBalancesReload={
                      triggerWalletTokenBalancesReload
                    }
                  />
                )}

                {isWhitelistedSwapper ? <div className="flex items-center justify-evenly w-[14em] ml-auto mr-auto">
                  <span
                    className={twMerge(
                      'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
                      isJupSwap ? 'opacity-100' : '',
                    )}
                    onClick={() => {
                      setIsJupSwap(true);
                    }}
                  >
                    JUP
                  </span>

                  <span className="opacity-20 text-2xl">/</span>

                  <span
                    className={twMerge(
                      'font-boldy uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
                      !isJupSwap ? 'opacity-100' : '',
                    )}
                    onClick={() => {
                      setIsJupSwap(false);
                    }}
                  >
                    Adrena
                  </span>
                </div> : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
