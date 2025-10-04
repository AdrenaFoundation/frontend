import { Wallet } from '@coral-xyz/anchor';
import { Connection } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import TabSelect from '@/components/common/TabSelect/TabSelect';
import JupiterWidget from '@/components/JupiterWidget/JupiterWidget';
import WalletConnection from '@/components/WalletAdapter/WalletConnection';
import { ALTERNATIVE_SWAP_TOKENS } from '@/constant';
import { Action } from '@/pages/trade';
import { PositionExtended, Token, WalletAdapterExtended } from '@/types';
import { getWalletAddress } from '@/utils/walletUtils';

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
  className,
  isBigScreen,
  activeRpc,
  terminalId,
  adapters,
  onLimitOrderAdded,
  setActivePositionModal,
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
  className?: string;
  isBigScreen?: boolean | null;
  activeRpc: {
    name: string;
    connection: Connection;
  };
  terminalId: string;
  adapters: WalletAdapterExtended[];
  setActivePositionModal?: (e: Action | null) => void;
  onLimitOrderAdded: () => void;
}) {
  const [isJupSwap, setIsJupSwap] = useState(true);
  const [isWhitelistedSwapper, setIsWhitelistedSwapper] = useState(false);

  useEffect(() => {
    const walletAddress = getWalletAddress(wallet);
    if (
      walletAddress &&
      window.adrena.client.mainPool.whitelistedSwapper.toBase58() === walletAddress
    ) {
      setIsWhitelistedSwapper(true);
    }
  }, [wallet]);

  return (
    <div
      className={twMerge(
        'sm:flex w-full sm:bg-main flex-col sm:flex-row lg:flex-col sm:border sm:rounded-md',
        isBigScreen ? 'mt-0 w-[30em]' : 'mt-4',
        className,
      )}
    >
      <div className="w-full flex flex-col sm:p-3">
        <TabSelect
          selected={selectedAction}
          tabs={[
            { title: 'long', activeColor: 'border-transparent [border-image:linear-gradient(to_right,#10b981,#22c55e,#14b8a6)_1]' },
            { title: 'short', activeColor: 'border-transparent [border-image:linear-gradient(to_right,#ef4444,#e11d48,#db2777)_1]' },
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
                // Adrena tokens + swappable tokens
                allowedTokenA={[
                  ...window.adrena.client.tokens,
                  ...ALTERNATIVE_SWAP_TOKENS,
                ]}
                allowedTokenB={window.adrena.client.tokens.filter(
                  (t) => !t.isStable,
                )}
                tokenA={tokenA}
                tokenB={tokenB}
                position={openedPosition}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
                wallet={wallet}
                connected={connected}
                onLimitOrderAdded={onLimitOrderAdded}
                setActivePositionModal={setActivePositionModal}
              />
            ) : (
              <>
                {/* Always render Jupiter widget but hide when not needed */}
                <div className={twMerge(
                  'relative h-[575px] min-w-[300px] w-full',
                  !connected && 'overflow-hidden',
                  !(isJupSwap || !isWhitelistedSwapper) && 'hidden'
                )}>
                  <div className={!connected ? 'blur-sm' : ''}>
                    <JupiterWidget
                      adapters={adapters}
                      activeRpc={activeRpc}
                      id={terminalId}
                      className="bg-transparent border-transparent min-w-[300px] w-full min-h-[550px]"
                    />
                  </div>

                  {!connected ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-full w-full backdrop-blur-sm">
                      <WalletConnection />
                    </div>
                  ) : null}
                </div>

                {/* Show SwapTradingInputs when not using Jupiter */}
                {!(isJupSwap || !isWhitelistedSwapper) && (
                  <SwapTradingInputs
                    allowedTokenA={window.adrena.client.tokens}
                    allowedTokenB={window.adrena.client.tokens}
                    tokenA={tokenA}
                    tokenB={tokenB}
                    setTokenA={setTokenA}
                    setTokenB={setTokenB}
                    wallet={wallet}
                    connected={connected}
                  />
                )}

                {isWhitelistedSwapper ? (
                  <div className="flex items-center justify-evenly w-[14em] ml-auto mr-auto">
                    <span
                      className={twMerge(
                        'font-semibold uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
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
                        'font-semibold uppercase w-15 h-8 flex items-center justify-center opacity-40 cursor-pointer hover:opacity-100',
                        !isJupSwap ? 'opacity-100' : '',
                      )}
                      onClick={() => {
                        setIsJupSwap(false);
                      }}
                    >
                      Adrena
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
