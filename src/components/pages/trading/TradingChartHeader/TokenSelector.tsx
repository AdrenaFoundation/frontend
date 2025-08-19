import { useState, useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';
import useDailyStats from '@/hooks/useDailyStats';

import chevronDownIcon from '../../../../../public/images/chevron-down.svg';
import starIcon from '../../../../../public/images/Icons/star.svg';
import starFilledIcon from '../../../../../public/images/Icons/star-filled.svg';

// TODO: add this as an option to FormatNumber global utils
const formatVolume = (value: number): string => {
  if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}k`;
  } else {
    return value.toFixed(2);
  }
};

interface TokenSelectorProps {
  tokenList: Token[];
  selected: Token;
  onChange: (token: Token) => void;
  className?: string;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
}

export default function TokenSelector({
  tokenList,
  selected,
  onChange,
  className,
  favorites,
  setFavorites,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const allTokenPrices = useSelector((s) => s.streamingTokenPrices);
  const stats = useDailyStats();

  const custodyData = useMemo(() => {
    return tokenList.reduce(
      (acc, token) => {
        const custody = window.adrena.client.getCustodyByMint(token.mint);
        if (custody) {
          acc[token.symbol] = custody;
        }
        return acc;
      },
      {} as Record<string, any>,
    );
  }, [tokenList]);

  const liquidityData = useMemo(() => {
    return tokenList.reduce(
      (acc, token) => {
        const custody = custodyData[token.symbol];
        if (custody) {
          const availableLiquidity =
            custody.availableLiquidity ||
            custody.available ||
            custody.liquidity ||
            0;

          const shortLiquidity =
            (custody.maxCumulativeShortPositionSizeUsd || 0) -
            (custody.oiShortUsd || 0);

          acc[token.symbol] = {
            long: Math.max(0, availableLiquidity),
            short: Math.max(0, shortLiquidity),
          };
        }
        return acc;
      },
      {} as Record<string, { long: number; short: number }>,
    );
  }, [tokenList, custodyData]);

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

  const toggleFavorite = (symbol: string) => {
    const newFavorites = favorites.includes(symbol)
      ? favorites.filter((f) => f !== symbol)
      : favorites.length < 5
        ? [...favorites, symbol]
        : favorites;

    setFavorites(newFavorites);
    localStorage.setItem('tokenFavorites', JSON.stringify(newFavorites));
  };

  const allTokens = tokenList;

  const filteredTokens = allTokens.filter((token) => {
    const symbol = getTokenSymbol(token.symbol);
    const matchesSearch = symbol
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || true;
    return matchesSearch && matchesCategory;
  });

  const sortedTokens = [...filteredTokens].sort((a, b) => {
    const aSymbol = getTokenSymbol(a.symbol);
    const bSymbol = getTokenSymbol(b.symbol);
    const aIsFavorite = favorites.includes(aSymbol);
    const bIsFavorite = favorites.includes(bSymbol);

    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;

    const aVolume = stats?.[a.symbol]?.dailyVolume ?? 0;
    const bVolume = stats?.[b.symbol]?.dailyVolume ?? 0;
    return bVolume - aVolume;
  });

  const favoriteTokens = allTokens
    .filter(
      (token) =>
        favorites.includes(getTokenSymbol(token.symbol)) &&
        token.symbol !== selected.symbol,
    )
    .slice(0, 5);

  return (
    <div className={twMerge('relative', className)} ref={dropdownRef}>
      {/* Just the token selector button */}
      <div className="flex-shrink-0">
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
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[30rem] bg-main border border-bcolor rounded-lg shadow-lg z-50">
          {/* Search and category bar */}
          <div className="p-2 border-b border-bcolor">
            <div className="flex flex-row items-center gap-2">
              {/* Search input */}
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search token"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-inputcolor border border-white/10 rounded-lg text-white font-mono placeholder-white/30 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Column headers */}
          <div className="px-2 py-1.5 bg-third/20 border-b border-bcolor">
            <div className="grid grid-cols-10 gap-2 text-sm">
              <div className="col-span-3 font-boldy text-white/50">Ticker</div>
              <div className="col-span-3 font-boldy text-white/50">
                Price / 24h%
              </div>
              <div className="col-span-2 font-boldy text-white/50">
                24h Vol.
              </div>
              <div className="col-span-2 font-boldy text-white/50">
                Avail. Liq.
              </div>
            </div>
          </div>

          {/* Token list */}
          <div
            className="overflow-y-auto"
            style={{
              maxHeight: `${Math.min(sortedTokens.length * 3.5 + 2, 25)}rem`,
            }}
          >
            {sortedTokens.map((token) => {
              const symbol = getTokenSymbol(token.symbol);
              const tokenPrice = allTokenPrices[symbol] ?? null;
              const dailyChange = stats?.[token.symbol]?.dailyChange ?? null;
              const dailyVolume = stats?.[token.symbol]?.dailyVolume ?? null;
              const isFavorite = favorites.includes(symbol);

              const custody = custodyData[token.symbol];

              const liquidity = liquidityData[token.symbol];

              return (
                <div
                  key={token.symbol}
                  className={twMerge(
                    'grid grid-cols-10 gap-2 items-center p-2 hover:bg-third cursor-pointer border-b border-bcolor/20 last:border-b-0',
                    selected.symbol === token.symbol ? 'bg-third/50' : '',
                  )}
                  onClick={() => {
                    onChange(token);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  {/* Ticker column */}
                  <div className="col-span-3 flex items-center gap-2">
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
                          !isFavorite ? 'opacity-50' : '',
                        )}
                      />
                    </button>

                    <div className="flex items-center gap-1.5">
                      <Image
                        src={getTokenImage(token)}
                        alt={symbol}
                        width={18}
                        height={18}
                      />
                      <span className="text-base font-boldy text-white">
                        {symbol}
                      </span>
                    </div>
                  </div>

                  {/* Price / 24h% column */}
                  <div className="col-span-3 flex flex-col gap-0.5">
                    {tokenPrice ? (
                      <span className="text-base font-mono text-white">
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

                  {/* 24h Volume column */}
                  <div className="col-span-2 text-base text-white">
                    {dailyVolume ? (
                      <span className="font-mono text-base">
                        {formatVolume(dailyVolume)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>

                  {/* Available Liquidity */}
                  <div className="col-span-2 flex flex-col gap-0.5">
                    {/* Long liquidity */}
                    <span className="text-base text-green font-mono">
                      {(() => {
                        if (liquidity && tokenPrice) {
                          const longValue = liquidity.long * tokenPrice;
                          return formatVolume(longValue);
                        }
                        return '-';
                      })()}
                    </span>
                    {/* Short liquidity */}
                    <span className="text-sm text-red font-mono">
                      {(() => {
                        if (liquidity) {
                          const shortValue = liquidity.short;
                          return formatVolume(shortValue);
                        }
                        return '-';
                      })()}
                    </span>
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
