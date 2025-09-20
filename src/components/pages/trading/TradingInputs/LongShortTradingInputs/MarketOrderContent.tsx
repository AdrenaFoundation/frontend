import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '@/components/common/Button/Button';
import FormatNumber from '@/components/Number/FormatNumber';
import TokenSelector from '@/components/pages/trading/TradingChartHeader/TokenSelector';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import { CustodyExtended, PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import InfoAnnotation from '../../../monitoring/InfoAnnotation';
import { ErrorDisplay } from './ErrorDisplay';
import SolanaIDInfo from './SolanaIDInfo';

interface MarketOrderContentProps {
  side: 'long' | 'short';
  tokenB: Token;
  allowedTokenB: Token[];
  inputB: number | null;
  openedPosition: PositionExtended | null;
  isInfoLoading: boolean;
  custody: CustodyExtended | null;
  usdcCustody: CustodyExtended | null;
  availableLiquidityShort: number;
  tokenPriceB: number | null;
  usdcPrice: number | null;
  errorMessage: string | null;
  buttonTitle: string;
  insufficientAmount: boolean;
  onTokenBSelect: (token: Token) => void;
  onInputBChange: (value: number | null) => void;
  onExecute: () => void;
  tokenPriceBTrade: number | undefined | null;
  walletAddress: string | null;
  custodyLiquidity: number | null;
}

export const MarketOrderContent = ({
  side,
  tokenB,
  allowedTokenB,
  inputB,
  openedPosition,
  isInfoLoading,
  custody,
  usdcCustody,
  availableLiquidityShort,
  tokenPriceB,
  usdcPrice,
  errorMessage,
  buttonTitle,
  insufficientAmount,
  onTokenBSelect,
  onExecute,
  tokenPriceBTrade,
  walletAddress,
  custodyLiquidity,
  favorites = [],
  onToggleFavorite,
}: MarketOrderContentProps & {
  favorites?: string[];
  onToggleFavorite?: (symbol: string) => void;
}) => {
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const isMobile = useBetterMediaQuery('(max-width: 639px)');

  return (
    <div className="flex flex-col transition-opacity duration-500 mt-4">
      <h5 className="flex items-center text-sm font-medium">Size</h5>

      <div className="flex items-center h-[3.5rem] pr-3 bg-third mt-1 border rounded-lg z-40">
        {/* Token selector button */}
        <div className="flex items-center pl-3">
          <button
            className="flex items-center gap-2 sm:cursor-default cursor-pointer hover:bg-fourth sm:hover:bg-transparent rounded p-1 transition-colors"
            onClick={() => {
              if (isMobile) {
                setShowTokenSelector(true);
              }
            }}
          >
            <Image
              src={getTokenImage(tokenB)}
              alt={getTokenSymbol(tokenB.symbol)}
              width={20}
              height={20}
            />
            <span className="text-lg font-medium text-white">
              {getTokenSymbol(tokenB.symbol)}
            </span>
            {/* Show chevron only on mobile */}
            <div className="sm:hidden">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                className="text-white/50"
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </button>
        </div>

        {/* TokenSelector Modal */}
        <TokenSelector
          asModal={true}
          isOpen={showTokenSelector}
          onClose={() => setShowTokenSelector(false)}
          tokenList={allowedTokenB}
          selected={tokenB}
          onChange={(token) => {
            onTokenBSelect(token);
            setShowTokenSelector(false);
          }}
          selectedAction={side}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />

        {!isInfoLoading ? (
          <div className="flex ml-auto">
            {openedPosition && tokenPriceB && inputB ? (
              <div className="flex flex-col self-center items-end line-through mr-3">
                <FormatNumber
                  nb={openedPosition.sizeUsd / tokenPriceB}
                  precision={tokenB.symbol === 'BTC' ? 4 : 2}
                  className="opacity-50"
                  isAbbreviate={tokenB.symbol === 'BONK'}
                  info={
                    tokenB.symbol === 'BONK'
                      ? (openedPosition.sizeUsd / tokenPriceB).toString()
                      : null
                  }
                />
                <FormatNumber
                  nb={openedPosition.sizeUsd}
                  format="currency"
                  className="opacity-50 text-xs line-through"
                />
              </div>
            ) : null}

            <div className="relative flex flex-col">
              <div className="flex flex-col items-end font-mono">
                <FormatNumber
                  nb={inputB}
                  precision={tokenB.displayAmountDecimalsPrecision}
                  className="text-lg"
                  isAbbreviate={tokenB.symbol === 'BONK'}
                  info={tokenB.symbol === 'BONK' ? inputB?.toString() : null}
                />
                {inputB && tokenPriceBTrade && (
                  <FormatNumber
                    nb={inputB * tokenPriceBTrade}
                    format="currency"
                    className="opacity-50 text-sm"
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex ml-auto">
            <div className="w-[150px] h-[40px] bg-bcolor rounded-xl" />
          </div>
        )}
      </div>

      <div className="flex sm:mt-2">
        <div className="flex items-center ml-2">
          <span className="opacity-50">max size:</span>
          <FormatNumber
            nb={
              side === 'long'
                ? custody?.maxPositionLockedUsd
                : (usdcCustody?.maxPositionLockedUsd ?? null)
            }
            format="currency"
            className="opacity-50 text-xs ml-1"
          />
          <InfoAnnotation
            className="ml-1 inline-flex"
            text="The maximum size of the position you can open, for that market and side."
          />
        </div>

        <div className="ml-auto items-center flex mr-2">
          <span className="opacity-50 mr-1">avail. liq.:</span>
          <FormatNumber
            nb={
              side === 'long'
                ? custody &&
                tokenPriceB &&
                custodyLiquidity &&
                custodyLiquidity * tokenPriceB
                : usdcPrice &&
                usdcCustody &&
                custody &&
                custodyLiquidity &&
                Math.min(
                  custodyLiquidity * usdcPrice,
                  availableLiquidityShort,
                )
            }
            format="currency"
            precision={0}
            className="opacity-50 text-xs"
          />
          <InfoAnnotation
            className="inline-flex"
            text="This value represents the total size available for borrowing in this market and side by all traders. It depends on the pool's available liquidity and configuration restrictions."
          />
        </div>
      </div>

      {errorMessage && <ErrorDisplay errorMessage={errorMessage} />}

      <SolanaIDInfo walletAddress={walletAddress} />

      <Button
        className={twMerge(
          'w-full justify-center mt-2 mb-1 sm:mb-2',
          // side === 'short' ? 'bg-red text-white' : 'bg-green text-white',
        )}
        size="lg"
        variant={side === 'short' ? 'red' : 'green'}
        title={buttonTitle}
        disabled={errorMessage != null || insufficientAmount}
        onClick={onExecute}
      />
    </div>
  );
};
