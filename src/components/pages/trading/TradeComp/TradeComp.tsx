import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { Action } from '@/pages/trade';
import { PositionExtended, Token } from '@/types';

import PositionDetails from '../PositionDetails/PositionDetails';
import SwapDetails from '../SwapDetails/SwapDetails';
import TradingInputs from '../TradingInputs/TradingInputs';

export const TradeComp = ({
  selectedAction,
  setSelectedAction,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  inputAValue,
  inputBValue,
  setInputAValue,
  setInputBValue,
  tokenPrices,
  openedPosition,
  setLeverage,
  buttonTitle,
  handleExecuteButton,
  className,
}: {
  selectedAction: Action;
  setSelectedAction: (title: Action) => void;
  tokenA: Token | null;
  tokenB: Token | null;
  setTokenA: (t: Token | null) => void;
  setTokenB: (t: Token | null) => void;
  inputAValue: number | null;
  inputBValue: number | null;
  setInputAValue: (v: number | null) => void;
  setInputBValue: (v: number | null) => void;
  tokenPrices: { [key: string]: number | null } | null;
  openedPosition: PositionExtended | null;
  setLeverage: (value: number) => void;
  buttonTitle: string;
  handleExecuteButton: () => void;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        'sm:flex w-full lg:w-[30em]  flex-col sm:flex-row lg:flex-col gap-3 mt-4 lg:ml-4 lg:mt-0',
        className,
      )}
    >
      <div className="w-full bg-black/50 backdrop-blur-md border border-gray-300 rounded-lg p-4">
        <TabSelect
          selected={selectedAction}
          tabs={[{ title: 'long' }, { title: 'short' }, { title: 'swap' }]}
          onClick={(title) => {
            setSelectedAction(title);
          }}
          wrapperClassName="hidden sm:flex"
        />

        {window.adrena.client.tokens.length && tokenA && tokenB && (
          <>
            <TradingInputs
              actionType={selectedAction}
              allowedTokenA={
                selectedAction === 'swap'
                  ? window.adrena.client.tokens.filter(
                      (t) => t.symbol !== tokenB.symbol,
                    )
                  : window.adrena.client.tokens
              }
              allowedTokenB={
                selectedAction === 'swap'
                  ? window.adrena.client.tokens.filter(
                      (t) => t.symbol !== tokenA.symbol,
                    )
                  : window.adrena.client.tokens.filter((t) => !t.isStable)
              }
              tokenA={tokenA}
              tokenB={tokenB}
              openedPosition={openedPosition}
              onChangeInputA={setInputAValue}
              onChangeInputB={setInputBValue}
              setTokenA={setTokenA}
              setTokenB={setTokenB}
              onChangeLeverage={setLeverage}
            />
          </>
        )}

        {/* Button to execute action */}
        <Button
          size="lg"
          title={buttonTitle}
          className="w-full justify-center mt-5"
          disabled={
            buttonTitle.includes('Insufficient') ||
            buttonTitle.includes('not handled yet')
          }
          onClick={handleExecuteButton}
        />
      </div>

      {/* Position details */}
      <div className="w-full bg-black/50 backdrop-blur-md border border-gray-300 rounded-lg p-4 mt-4 sm:mt-0">
        <div className="pb-0">
          <span className="capitalize text-xs opacity-25">
            {selectedAction}
            {selectedAction === 'short' || selectedAction === 'long' ? (
              <span> {tokenB?.symbol ?? '-'}</span>
            ) : null}
          </span>
        </div>

        {tokenA && tokenB ? (
          <>
            {selectedAction === 'short' || selectedAction === 'long' ? (
              <PositionDetails
                tokenB={tokenB}
                entryPrice={
                  tokenB &&
                  inputBValue &&
                  tokenPrices &&
                  tokenPrices[tokenB.symbol]
                    ? tokenPrices[tokenB.symbol]
                    : null
                }
                exitPrice={
                  tokenB &&
                  inputBValue &&
                  tokenPrices &&
                  tokenPrices[tokenB.symbol]
                    ? tokenPrices[tokenB.symbol]
                    : null
                }
              />
            ) : (
              <SwapDetails tokenA={tokenA} tokenB={tokenB} />
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
