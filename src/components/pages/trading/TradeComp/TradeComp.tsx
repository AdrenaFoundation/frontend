import React from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import TabSelect from '@/components/common/TabSelect/TabSelect';
import { Action } from '@/pages/trade';
import { PositionExtended, Token } from '@/types';

import LongShortTradingInputs from '../TradingInputs/LongShortTradingInputs';
import SwapTradingInputs from '../TradingInputs/SwapTradingInputs';

export const TradeComp = ({
  selectedAction,
  setSelectedAction,
  tokenA,
  tokenB,
  setTokenA,
  setTokenB,
  setInputAValue,
  setInputBValue,
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
  setInputAValue: (v: number | null) => void;
  setInputBValue: (v: number | null) => void;
  openedPosition: PositionExtended | null;
  setLeverage: (value: number) => void;
  buttonTitle: string;
  handleExecuteButton: () => void;
  className?: string;
}) => {
  return (
    <div
      className={twMerge(
        'sm:flex w-full lg:w-[30em] min-w-[350px] flex-col sm:flex-row lg:flex-col mt-4 lg:ml-4 lg:mt-0',
        className,
      )}
    >
      <div className="w-full bg-gray-300/85 backdrop-blur-md border border-gray-200 rounded-2xl pt-3 pl-3 pr-3 pb-4 flex flex-col">
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
                onChangeInputA={setInputAValue}
                onChangeInputB={setInputBValue}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
                onChangeLeverage={setLeverage}
              />
            ) : (
              <SwapTradingInputs
                allowedTokenA={window.adrena.client.tokens}
                allowedTokenB={window.adrena.client.tokens}
                tokenA={tokenA}
                tokenB={tokenB}
                onChangeInputA={setInputAValue}
                onChangeInputB={setInputBValue}
                setTokenA={setTokenA}
                setTokenB={setTokenB}
              />
            )}
          </>
        )}

        {/* Button to execute action */}
        <Button
          className="w-full justify-center mt-8"
          size="lg"
          title={buttonTitle}
          disabled={
            buttonTitle.includes('Insufficient') ||
            buttonTitle.includes('not handled yet')
          }
          onClick={handleExecuteButton}
        />
      </div>
    </div>
  );
};
