import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/chevron-down.svg';
import starIcon from '@/../public/images/Icons/star.svg';
import starFilledIcon from '@/../public/images/Icons/star-filled.svg';
import useDailyStats from '@/hooks/useDailyStats';
import useDynamicCustodyAvailableLiquidity from '@/hooks/useDynamicCustodyAvailableLiquidity';
import { useSelector } from '@/store/store';
import { CustodyExtended, Token } from '@/types';
import {
  formatNumberShort,
  formatPercentage,
  formatPriceInfo,
  getTokenImage,
  getTokenSymbol,
} from '@/utils';

interface TokenSelectorProps {
  tokenList: Token[];
  selected: Token;
  onChange: (token: Token) => void;
  className?: string;
  favorites: string[];
  onToggleFavorite: (symbol: string) => void;
  selectedAction: 'long' | 'short' | 'swap';
}

interface TokenDataItem {
  token: Token;
  symbol: string;
  custody: CustodyExtended;
  tokenPrice: number | null;
  liquidityPrice: number | null;
  availableLiquidity: number;
  dailyChange: number | null;
  isFavorite: boolean;
}

export default function TokenSelector({
  tokenList,
  selected,
  onChange,
  className,
  favorites,
  onToggleFavorite,
  selectedAction,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const streamingTokenPrices = useSelector((s) => s.streamingTokenPrices);
  const stats = useDailyStats();

  const custodyList = useMemo(() => {
    if (selectedAction === 'short') return [];

    return tokenList
      .map((token) => window.adrena.client.getCustodyByMint(token.mint))
      .filter((custody) => !!custody);
  }, [tokenList, selectedAction]);

  const custodyLiquidity = useDynamicCustodyAvailableLiquidity(custodyList);

  const tokenData = useMemo((): TokenDataItem[] => {
    return tokenList
      .map((token) => {
        const symbol = getTokenSymbol(token.symbol);
        const custody = window.adrena.client.getCustodyByMint(token.mint);

        if (!custody) return null;

        const tokenPrice = streamingTokenPrices[symbol] ?? null;
        const { liquidityPrice, availableLiquidity } =
          selectedAction === 'short'
            ? {
                liquidityPrice: null as number | null,
                availableLiquidity:
                  custody.maxCumulativeShortPositionSizeUsd -
                  custody.oiShortUsd,
              }
            : {
                liquidityPrice: streamingTokenPrices[token.symbol] ?? null,
                availableLiquidity:
                  (custodyLiquidity as Record<string, number>)?.[
                    custody.pubkey.toBase58()
                  ] ?? 0,
              };

        return {
          token,
          symbol,
          custody,
          tokenPrice,
          liquidityPrice,
          availableLiquidity,
          dailyChange: stats?.[token.symbol]?.dailyChange ?? null,
          isFavorite: favorites.includes(symbol),
        };
      })
      .filter((item): item is TokenDataItem => item !== null);
  }, [
    tokenList,
    selectedAction,
    streamingTokenPrices,
    stats,
    favorites,
    custodyLiquidity,
  ]);

  const sortedTokens = useMemo(() => {
    return [...tokenData].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      const aLiquidityUsd =
        selectedAction === 'short'
          ? a.availableLiquidity
          : a.availableLiquidity * (a.tokenPrice ?? 0);
      const bLiquidityUsd =
        selectedAction === 'short'
          ? b.availableLiquidity
          : b.availableLiquidity * (b.tokenPrice ?? 0);

      return bLiquidityUsd - aLiquidityUsd;
    });
  }, [tokenData, selectedAction]);

  const filteredTokens = useMemo(() => {
    if (!searchTerm) return sortedTokens;
    const searchLower = searchTerm.toLowerCase();
    return sortedTokens.filter((item) =>
      item.symbol.toLowerCase().includes(searchLower),
    );
  }, [sortedTokens, searchTerm]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      onChange(token);
      setIsOpen(false);
      setSearchTerm('');
    },
    [onChange],
  );

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

  if (!tokenData.length) {
    return (
      <div className={twMerge('relative', className)}>
        <div className="flex flex-row items-center gap-2 border rounded-lg p-2 px-3 bg-main opacity-50">
          <span className="text-base font-boldy text-white">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={twMerge('relative', className)} ref={dropdownRef}>
      {/* Token selector button */}
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
          <span className="text-lg font-boldy text-white">
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
        <div className="absolute top-full left-0 mt-1 w-[94vw] min-w-[21rem] sm:w-[28rem] bg-main border border-bcolor rounded-lg shadow-lg z-50">
          {/* Search bar */}
          <div className="p-2 border-b border-bcolor">
            <input
              type="text"
              placeholder="Search token"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-inputcolor border border-white/10 rounded-lg text-white font-mono placeholder-white/30 text-sm"
            />
          </div>

          {/* Column headers */}
          <div className="px-2 py-1.5 bg-third/20 border-b border-bcolor">
            <div className="grid grid-cols-10 gap-1.5 sm:gap-2 text-sm">
              <div className="col-span-4 sm:col-span-3 font-boldy text-white/50">
                Ticker
              </div>
              <div className="col-span-4 sm:col-span-3 font-boldy text-white/50">
                Price
              </div>
              <div className="hidden sm:block col-span-2 font-boldy text-white/50">
                24h%
              </div>
              <div className="col-span-2 font-boldy text-white/50">
                Avail. Liq.
              </div>
            </div>
          </div>

          {/* Token list */}
          <div
            className="overflow-y-auto pr-2"
            style={{
              maxHeight: `${Math.min(filteredTokens.length * 3.5 + 2, 25)}rem`,
            }}
          >
            {filteredTokens.map((item, index) => (
              <div
                key={item.token.symbol}
                className={twMerge(
                  'grid grid-cols-10 gap-1.5 sm:gap-2 items-center p-2 hover:bg-third cursor-pointer border-b border-bcolor/20 last:border-b-0',
                  selected.symbol === item.token.symbol ? 'bg-third/50' : '',
                  index % 2 === 0 ? 'bg-main' : 'bg-third/70',
                )}
                onClick={() => handleTokenSelect(item.token)}
              >
                {/* Ticker column */}
                <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.symbol);
                    }}
                    className="p-1 hover:bg-fourth rounded transition-colors"
                  >
                    <Image
                      src={item.isFavorite ? starFilledIcon : starIcon}
                      alt={
                        item.isFavorite
                          ? 'Remove from favorites'
                          : 'Add to favorites'
                      }
                      width={14}
                      height={14}
                      className={twMerge(
                        'transition-all duration-200',
                        item.isFavorite
                          ? 'scale-110 opacity-100'
                          : 'scale-100 opacity-50',
                      )}
                    />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <Image
                      src={getTokenImage(item.token)}
                      alt={item.symbol}
                      width={20}
                      height={20}
                    />
                    <span className="text-lg font-boldy text-white">
                      {item.symbol}
                    </span>
                  </div>
                </div>

                {/* Price column */}
                <div className="col-span-4 sm:col-span-3">
                  {item.tokenPrice ? (
                    <span className="text-base font-mono text-white">
                      {formatPriceInfo(
                        item.tokenPrice,
                        item.token.displayPriceDecimalsPrecision || 2,
                        2,
                        8,
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>

                {/* 24h% column */}
                <div className="hidden sm:block col-span-2">
                  {item.dailyChange !== null ? (
                    <span
                      className={
                        item.dailyChange > 0
                          ? 'text-green text-base font-mono'
                          : item.dailyChange < 0
                            ? 'text-red text-base font-mono'
                            : 'text-gray-400 text-base font-mono'
                      }
                    >
                      {formatPercentage(item.dailyChange, 2)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>

                {/* Avail. Liq. column */}
                <div className="col-span-2 text-base font-mono text-white">
                  {(() => {
                    const liquidityUsd =
                      selectedAction === 'short'
                        ? item.availableLiquidity
                        : item.liquidityPrice
                          ? item.availableLiquidity * item.liquidityPrice
                          : 0;

                    return `$${formatNumberShort(liquidityUsd, 2)}`;
                  })()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
