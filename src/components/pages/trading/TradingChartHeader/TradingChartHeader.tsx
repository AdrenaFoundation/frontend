import Tippy from '@tippyjs/react';
import Head from 'next/head';
import { useState, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from './TradingChartHeaderStats';
import TokenSelector from './TokenSelector';
import FavoritesBar from './FavoritesBar';

interface TradingChartHeaderProps {
  allActivePositions: PositionExtended[] | null;
  className?: string;
  tokenList: Token[];
  selected: Token;
  onChange: (t: Token) => void;
  selectedAction: 'long' | 'short' | 'swap';
}

export default function TradingChartHeader({
  allActivePositions,
  className,
  tokenList,
  selected,
  onChange,
  selectedAction,
}: TradingChartHeaderProps) {
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
  );

  const numberLong = allActivePositions?.filter(
    (p) => p.side === 'long',
  ).length;
  const numberShort = allActivePositions?.filter(
    (p) => p.side === 'short',
  ).length;

  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  const favoriteTokens = useMemo(
    () =>
      tokenList
        .filter(
          (token) =>
            favorites.includes(getTokenSymbol(token.symbol)) &&
            token.symbol !== selected.symbol,
        )
        .slice(0, 3),
    [tokenList, favorites, selected.symbol],
  );

  const favoritesBarClasses = useMemo(
    () =>
      twMerge(
        'min-w-0 flex-1 overflow-hidden',
        'lg:min-w-0 lg:overflow-hidden lg:w-auto lg:flex-1',
      ),
    [],
  );

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
          'flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 lg:gap-2 z-30 bg-main border-b p-3 lg:p-1',
          className,
        )}
      >
        {/* Left side: Token Selector + Favorites */}
        <div className="flex items-center justify-between w-full lg:w-auto lg:flex-1 gap-3 lg:gap-3 min-w-0">
          {/* Token Selector */}
          <div className="flex-shrink-0">
            <TokenSelector
              tokenList={tokenList}
              selected={selected}
              onChange={onChange}
              favorites={favorites}
              setFavorites={setFavorites}
              selectedAction={selectedAction}
            />
          </div>

          {/* Favorites Bar */}
          <div className={favoritesBarClasses}>
            <FavoritesBar
              favoriteTokens={favoriteTokens}
              selected={selected}
              onChange={onChange}
            />
          </div>

          {/* Long/Short positions */}
          {numberLong && numberShort ? (
            <div className="flex md:hidden gap-0.5 flex-shrink-0">
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

        {/* Right side: Stats */}
        <div className="flex-shrink-0 w-full md:w-auto md:justify-end lg:self-center">
          <TradingChartHeaderStats
            selected={selected}
            numberLong={numberLong}
            numberShort={numberShort}
            className="p-1"
          />
        </div>
      </div>
    </>
  );
}
