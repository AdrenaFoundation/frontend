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
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

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
          'flex flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-2 z-30 bg-main border-b px-3 py-1',
          className,
        )}
      >
        {/* Mobile: Wrapping layout */}
        <div className="flex sm:hidden flex-row items-center justify-between flex-wrap gap-2">
          {/* Left side: Token Selector + Favorites */}
          <div className="flex items-center gap-3 min-w-0">
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

            {/* Favorites Bar*/}
            <div className="min-w-0 overflow-hidden">
              <FavoritesBar
                favoriteTokens={favoriteTokens}
                selected={selected}
                onChange={onChange}
              />
            </div>
          </div>

          {/* Right side: 24h% + Price + Expand Button */}
          <div className="flex items-center gap-3 ml-auto">
            <TradingChartHeaderStats
              selected={selected}
              numberLong={numberLong}
              numberShort={numberShort}
              selectedAction={selectedAction}
              compact={true}
              showMainLineOnly={true}
              isStatsExpanded={isStatsExpanded}
              setIsStatsExpanded={setIsStatsExpanded}
            />
          </div>
        </div>

        {/* Desktop: Original layout */}
        <div className="hidden sm:flex items-center justify-between w-full sm:w-auto sm:flex-1 gap-3 sm:gap-3 min-w-0">
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
        </div>

        {/* Desktop Stats */}
        <div className="hidden sm:block flex-shrink-0 sm:self-center">
          <TradingChartHeaderStats
            selected={selected}
            numberLong={numberLong}
            numberShort={numberShort}
            selectedAction={selectedAction}
          />
        </div>

        {/* Mobile: Expandable stats section */}
        <TradingChartHeaderStats
          selected={selected}
          numberLong={numberLong}
          numberShort={numberShort}
          selectedAction={selectedAction}
          showExpandedStatsOnly={true}
          isStatsExpanded={isStatsExpanded}
        />
      </div>
    </>
  );
}
