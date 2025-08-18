import Tippy from '@tippyjs/react';
import Head from 'next/head';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from './TradingChartHeaderStats';
import TokenSelector from './TokenSelector';

export default function TradingChartHeader({
  allActivePositions,
  className,
  tokenList,
  selected,
  onChange,
}: {
  allActivePositions: PositionExtended[] | null;
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
}) {
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
  );

  const numberLong = allActivePositions?.filter(
    (p) => p.side === 'long',
  ).length;
  const numberShort = allActivePositions?.filter(
    (p) => p.side === 'short',
  ).length;

  return (
    <>
      <Head>
        <title>
          {selectedTokenPrice?.toFixed(selected.symbol === 'BONK' ? 8 : 2) ??
            '-'}{' '}
          – {getTokenSymbol(selected.symbol)} / USD
        </title>
      </Head>
      <div
        className={twMerge(
          'flex flex-col md:flex-row items-center justify-between md:gap-3 z-30 bg-main border-b',
          className,
        )}
      >
        <div className="flex items-center justify-between min-w-fit w-full border-b p-1 md:border-b-0 border-bcolor">
          <div className="flex flex-row items-center gap-3 p-1">
            {/* Token Selector */}
            <TokenSelector
              tokenList={tokenList}
              selected={selected}
              onChange={onChange}
            />
          </div>

          {/* Long/Short positions */}
          {numberLong && numberShort ? (
            <div className="flex sm:hidden gap-0.5">
              <Tippy
                content="Long positions"
                className="flex flex-col items-center"
              >
                <span className="text-greenSide text-xxs leading-none bg-green/10 rounded-lg px-2 py-1.5">
                  {numberLong}
                </span>
              </Tippy>
              <Tippy
                content="Short positions"
                className="flex flex-col items-center"
              >
                <span className="text-redSide text-xxs leading-none bg-red/10 rounded-lg px-2 py-1.5">
                  {numberShort}
                </span>
              </Tippy>
            </div>
          ) : null}
        </div>

        <TradingChartHeaderStats
          selected={selected}
          numberLong={numberLong}
          numberShort={numberShort}
          className="p-1"
        />
      </div>
    </>
  );
}
