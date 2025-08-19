import Tippy from '@tippyjs/react';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { PositionExtended, Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

import TradingChartHeaderStats from './TradingChartHeaderStats';
import TokenSelector from './TokenSelector';
import FavoritesBar from './FavoritesBar';

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

  // Get favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Create test tokens for development
  const TEST_FAVORITES = [
    'TEST1',
    'TEST2',
    'TEST3',
    'TEST4',
    'TEST5',
    'TEST6',
    'TEST7',
    'TEST8',
    'TEST9',
    'TEST10',
  ];

  const testTokens: Token[] = TEST_FAVORITES.map((testSymbol) => ({
    symbol: testSymbol,
    mint: `test-mint-${testSymbol}` as any,
    color: '#666',
    name: `Test Token ${testSymbol}`,
    decimals: 6,
    displayAmountDecimalsPrecision: 2,
    displayPriceDecimalsPrecision: 2,
    isStable: false,
    image:
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iOCIgZmlsbD0iIzY2NiIvPgo8L3N2Zz4K',
  }));

  const allTokens = [...tokenList, ...testTokens];

  const favoriteTokens = allTokens
    .filter(
      (token) =>
        favorites.includes(getTokenSymbol(token.symbol)) &&
        token.symbol !== selected.symbol,
    )
    .slice(0, 5);

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
          'flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2 z-30 bg-main border-b', // Changed from items-center to items-start
          className,
        )}
      >
        {/* Left side: Token Selector + Favorites - LEFT ALIGNED */}
        <div className="flex items-center gap-3 min-w-0 flex-1 p-1 lg:justify-start justify-start">
          {/* Token Selector - never shrinks */}
          <div className="flex-shrink-0">
            <TokenSelector
              tokenList={tokenList}
              selected={selected}
              onChange={onChange}
              favorites={favorites}
              setFavorites={setFavorites}
            />
          </div>

          {/* Favorites Bar - responsive behavior */}
          <div
            className="min-w-0 flex-1 overflow-hidden lg:min-w-0 lg:overflow-hidden"
            style={{
              minWidth: 0,
              width: window.innerWidth >= 1024 ? 0 : 'auto',
            }}
          >
            <FavoritesBar
              favoriteTokens={favoriteTokens}
              selected={selected}
              onChange={onChange}
            />
          </div>

          {/* Long/Short positions - on the RIGHT of favorites bar for mobile */}
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

        {/* Right side: Stats - RIGHT ALIGNED on second row */}
        <div className="flex-shrink-0 lg:justify-end self-end lg:self-center">
          {' '}
          {/* Added self-end and lg:self-center */}
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
