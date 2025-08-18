import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';
import useDailyStats from '@/hooks/useDailyStats';

import chevronDownIcon from '../../../../../public/images/chevron-down.svg';
import starIcon from '../../../../../public/images/Icons/star.svg';
import starFilledIcon from '../../../../../public/images/Icons/star-filled.svg';

interface TokenSelectorProps {
  tokenList: Token[];
  selected: Token;
  onChange: (token: Token) => void;
  className?: string;
}

export default function TokenSelector({
  tokenList,
  selected,
  onChange,
  className,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const favoritesContainerRef = useRef<HTMLDivElement>(null);

  const allTokenPrices = useSelector((s) => s.streamingTokenPrices);
  const stats = useDailyStats();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('tokenFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Check scroll position and show/hide arrows
  const checkScrollPosition = () => {
    if (favoritesContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        favoritesContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // Scroll favorites left/right
  const scrollFavorites = (direction: 'left' | 'right') => {
    if (favoritesContainerRef.current) {
      const scrollAmount = 200; // Scroll by 200px
      const newScrollLeft =
        favoritesContainerRef.current.scrollLeft +
        (direction === 'left' ? -scrollAmount : scrollAmount);
      favoritesContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // Save favorites to localStorage
  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter((f) => f !== symbol)
      : [...favorites, symbol];

    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Check scroll position when favorites change
  useEffect(() => {
    checkScrollPosition();
  }, [favorites]);

  // Filter tokens based on search term
  const filteredTokens = tokenList.filter((token) => {
    const symbol = getTokenSymbol(token.symbol);
    return symbol.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort tokens: favorites first, then alphabetically
  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aSymbol = getTokenSymbol(a.symbol);
    const bSymbol = getTokenSymbol(b.symbol);
    const aIsFavorite = favorites.includes(aSymbol);
    const bIsFavorite = favorites.includes(bSymbol);

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return aSymbol.localeCompare(bSymbol);
  });

  // Add test tokens for development - remove in production!
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

  // Get favorite tokens for display in header
  // Filter out the currently selected token to avoid redundancy
  const favoriteTokens = [
    ...tokenList.filter(
      (token) =>
        favorites.includes(getTokenSymbol(token.symbol)) &&
        token.symbol !== selected.symbol,
    ),
    // Add test tokens for development - remove in production!
    ...TEST_FAVORITES.map((testSymbol) => ({
      symbol: testSymbol,
      mint: 'test-mint' as any,
      color: '#666',
      name: `Test Token ${testSymbol}`,
      decimals: 6,
      displayAmountDecimalsPrecision: 2,
      displayPriceDecimalsPrecision: 2,
      isStable: false,
      image:
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTAiIGN5PSIxMCIgcj0iMTAiIGZpbGw9IiM2NjY2NjYiLz4KPHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTYgMkw3LjUgNkgxMS41TDguNSA4TDEwIDEyTDYgMTBMNC41IDhMMS41IDZINi41TDYgMloiIGZpbGw9IiNGQkIyNCIvPgo8L3N2Zz4KPC9zdmc+',
    })),
  ];

  return (
    <div className={twMerge('relative', className)} ref={dropdownRef}>
      {/* Main row: Token selector + Favorites */}
      <div className="flex flex-row items-center gap-3">
        {/* Current token display with dropdown arrow */}
        <div
          className="flex flex-row items-center gap-2 border rounded-lg p-2 px-3 cursor-pointer hover:bg-third transition duration-300 bg-main"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Image
            src={getTokenImage(selected)}
            alt={getTokenSymbol(selected.symbol)}
            width={20}
            height={20}
          />
          <span className="text-base font-boldy text-white">
            {getTokenSymbol(selected.symbol)}
          </span>
          <Image
            src={chevronDownIcon}
            alt="Dropdown"
            width={16}
            height={16}
            className={twMerge(
              'transition-transform duration-300',
              isOpen ? 'rotate-180' : '',
            )}
          />
        </div>

        {/* Favorites display to the right with scroll */}
        {favoriteTokens.length > 0 && (
          <div className="relative w-64 sm:w-80 md:w-96 lg:w-[400px] flex-shrink-0">
            {/* Left fade and arrow */}
            {showLeftArrow && (
              <div className="absolute left-0 top-0 bottom-0 flex items-center z-10">
                <div className="w-8 h-full bg-gradient-to-r from-main to-transparent flex items-center justify-center">
                  <button
                    onClick={() => scrollFavorites('left')}
                    className="w-6 h-6 bg-third/80 hover:bg-third rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 3L4.5 6L7.5 9"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Right fade and arrow */}
            {showRightArrow && (
              <div className="absolute right-0 top-0 bottom-0 flex items-center z-10">
                <div className="w-6 h-full bg-gradient-to-l from-main to-transparent flex items-center justify-center min-w-0">
                  <button
                    onClick={() => scrollFavorites('right')}
                    className="w-6 h-6 bg-third/40 hover:bg-third/70 rounded-full flex items-center justify-center transition-colors"
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.5 3L7.5 6L4.5 9"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable favorites container */}
            <div
              ref={favoritesContainerRef}
              className="flex flex-row items-center gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onScroll={checkScrollPosition}
            >
              {favoriteTokens.map((token) => {
                const symbol = getTokenSymbol(token.symbol);
                return (
                  <div
                    key={token.symbol}
                    className={twMerge(
                      'flex flex-row items-center gap-2 border rounded-lg p-1 px-3 pr-5 cursor-pointer opacity-50 hover:opacity-100 hover:bg-third transition duration-300 flex-shrink-0',
                      selected.symbol === token.symbol
                        ? 'opacity-100 bg-third'
                        : '',
                    )}
                    onClick={() => onChange(token)}
                  >
                    <Image
                      src={getTokenImage(token)}
                      alt={symbol}
                      width={16}
                      height={16}
                    />
                    <p
                      className={twMerge(
                        'text-base font-boldy',
                        selected.symbol === token.symbol && 'font-interBold',
                      )}
                    >
                      {symbol}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 max-h-96 overflow-y-auto bg-main border border-bcolor rounded-lg shadow-lg z-50">
          {/* Search bar */}
          <div className="p-3 border-b border-bcolor">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-third border border-bcolor rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-base"
              />
            </div>
          </div>

          {/* Token list */}
          <div className="max-h-80 overflow-y-auto">
            {sortedTokens.map((token) => {
              const symbol = getTokenSymbol(token.symbol);
              const tokenPrice = allTokenPrices[symbol] ?? null;
              const dailyChange = stats?.[token.symbol]?.dailyChange ?? null;
              const isFavorite = favorites.includes(symbol);

              return (
                <div
                  key={token.symbol}
                  className={twMerge(
                    'flex items-center justify-between p-3 hover:bg-third cursor-pointer border-b border-bcolor/20 last:border-b-0',
                    selected.symbol === token.symbol ? 'bg-third/50' : '',
                  )}
                  onClick={() => {
                    onChange(token);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {/* Left side: Star and Symbol */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(symbol);
                      }}
                      className="p-1 hover:bg-fourth rounded transition-colors"
                    >
                      <Image
                        src={isFavorite ? starFilledIcon : starIcon}
                        alt={
                          isFavorite
                            ? 'Remove from favorites'
                            : 'Add to favorites'
                        }
                        width={16}
                        height={16}
                        className={twMerge(
                          'transition-all duration-200',
                          isFavorite ? 'scale-110' : 'scale-100',
                        )}
                      />
                    </button>

                    <div className="flex items-center gap-2">
                      <Image
                        src={getTokenImage(token)}
                        alt={symbol}
                        width={20}
                        height={20}
                      />
                      <span className="text-base font-boldy text-white">
                        {symbol}
                      </span>
                    </div>
                  </div>

                  {/* Right side: Price and 24h change */}
                  <div className="flex flex-col items-end gap-1">
                    {tokenPrice ? (
                      <span className="text-base font-boldy text-white">
                        $
                        {tokenPrice.toFixed(
                          token.displayPriceDecimalsPrecision || 2,
                        )}
                      </span>
                    ) : (
                      <span className="text-base text-gray-400">-</span>
                    )}

                    {dailyChange !== null ? (
                      <span
                        className={twMerge(
                          'text-sm font-mono',
                          dailyChange > 0
                            ? 'text-green'
                            : dailyChange < 0
                              ? 'text-red'
                              : 'text-gray-400',
                        )}
                      >
                        {dailyChange > 0 ? '+' : ''}
                        {dailyChange.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
