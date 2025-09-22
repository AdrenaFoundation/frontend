import Tippy from '@tippyjs/react';
import Head from 'next/head';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { MAX_FAVORITE_TOKENS } from '@/constant';
import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenSymbol } from '@/utils';

import FavoritesBar from './FavoritesBar';
import TokenSelector from './TokenSelector';
import TradingChartHeaderStats from './TradingChartHeaderStats';

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
    try {
      const savedFavorites = localStorage.getItem('tokenFavorites');
      if (!savedFavorites) return;

      const parsed = JSON.parse(savedFavorites);
      if (
        !Array.isArray(parsed) ||
        !parsed.every((item) => typeof item === 'string')
      ) {
        localStorage.removeItem('tokenFavorites');
        setFavorites([]);
        return;
      }

      const validTokenSymbols = new Set(
        tokenList.map((token) => getTokenSymbol(token.symbol)),
      );
      const validFavorites = parsed.filter((symbol) =>
        validTokenSymbols.has(symbol),
      );

      const contentChanged =
        validFavorites.length !== parsed.length ||
        !validFavorites.every((fav, index) => fav === parsed[index]);

      if (contentChanged) {
        localStorage.setItem('tokenFavorites', JSON.stringify(validFavorites));
      }

      setFavorites(validFavorites);
    } catch {
      localStorage.removeItem('tokenFavorites');
      setFavorites([]);
    }
  }, [tokenList]);

  const addFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const newFavorites = [...prev, symbol];

      try {
        localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }

      return newFavorites;
    });
  }, []);

  const removeFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.filter((fav) => fav !== symbol);

      try {
        localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
      } catch (error) {
        console.error('Error saving favorites:', error);
      }

      return newFavorites;
    });
  }, []);

  const toggleFavorite = useCallback(
    (symbol: string) => {
      if (favorites.includes(symbol)) {
        removeFavorite(symbol);
      } else {
        addFavorite(symbol);
      }
    },
    [favorites, addFavorite, removeFavorite],
  );

  const favoriteTokens = useMemo(
    () =>
      tokenList
        .filter(
          (token) =>
            favorites.includes(getTokenSymbol(token.symbol)) &&
            token.symbol !== selected.symbol,
        )
        .slice(-MAX_FAVORITE_TOKENS),
    [tokenList, favorites, selected.symbol],
  );

  const favoritesBarClasses =
    'min-w-0 flex-1 overflow-hidden sm:min-w-0 sm:overflow-hidden sm:w-auto sm:flex-1';

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
          'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2 z-30 bg-main border-b px-3 py-1',
          className,
        )}
      >
        {/* Left side: Token Selector + Favorites */}
        <div className="flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-3 sm:gap-3 min-w-0">
          {/* Token Selector */}
          <div className="flex-shrink-0">
            <TokenSelector
              tokenList={tokenList}
              selected={selected}
              onChange={onChange}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
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
        <div className="flex-shrink-0 w-full sm:w-auto sm:justify-end sm:self-center">
          <TradingChartHeaderStats
            selected={selected}
            numberLong={numberLong}
            numberShort={numberShort}
            selectedAction={selectedAction}
          />
        </div>
      </div>
    </>
  );
}
