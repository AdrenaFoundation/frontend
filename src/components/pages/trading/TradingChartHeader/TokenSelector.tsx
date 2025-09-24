import { AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/chevron-down.svg';
import starIcon from '@/../public/images/Icons/star.svg';
import starFilledIcon from '@/../public/images/Icons/star-filled.svg';
import Modal from '@/components/common/Modal/Modal';
import {
  TokenDataItem,
  useTokenSelectorData,
} from '@/hooks/useTokenSelectorData';
import { Token } from '@/types';
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
  favorites?: string[];
  onToggleFavorite?: (symbol: string) => void;
  selectedAction: 'long' | 'short' | 'swap';
  asModal?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

function TokenList({
  tokens,
  selected,
  onTokenSelect,
  onToggleFavorite,
  selectedAction,
}: {
  tokens: TokenDataItem[];
  selected: Token;
  onTokenSelect: (token: Token) => void;
  favorites: string[];
  onToggleFavorite?: (symbol: string) => void;
  selectedAction: 'long' | 'short' | 'swap';
}) {
  return (
    <>
      {/* Column headers */}
      <div className="px-2 py-1.5 bg-third/20 border-b border-bcolor">
        <div className="grid grid-cols-10 gap-1.5 sm:gap-2 text-sm">
          <div className="col-span-4 sm:col-span-3 font-semibold text-white/50">
            Ticker
          </div>
          <div className="col-span-4 sm:col-span-3 font-semibold text-white/50">
            Price
          </div>
          <div className="hidden sm:block col-span-2 font-semibold text-white/50">
            24h%
          </div>
          <div className="col-span-2 font-semibold text-white/50">Avail. Liq.</div>
        </div>
      </div>

      {/* Token list */}
      <div
        className="overflow-y-auto"
        style={{
          maxHeight: `${Math.min(tokens.length * 3.5 + 2, 25)}rem`,
        }}
      >
        {tokens.map((item, index) => (
          <div
            key={item.token.symbol}
            className={twMerge(
              'grid grid-cols-10 gap-1.5 sm:gap-2 items-center p-2 hover:bg-third cursor-pointer border-b border-bcolor/20 last:border-b-0 pr-4 sm:pr-2',
              selected.symbol === item.token.symbol ? 'bg-third/50' : '',
              index % 2 === 0 ? 'bg-main' : 'bg-third/70',
            )}
            onClick={() => onTokenSelect(item.token)}
          >
            {/* Ticker column */}
            <div className="col-span-4 sm:col-span-3 flex items-center gap-2">
              {onToggleFavorite && (
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
              )}

              <div className="flex items-center gap-1.5">
                <Image
                  src={getTokenImage(item.token)}
                  alt={item.symbol}
                  width={20}
                  height={20}
                />
                <span className="text-base font-semibold text-white">
                  {item.symbol}
                </span>
              </div>
            </div>

            {/* Price column */}
            <div className="col-span-4 sm:col-span-3">
              {item.tokenPrice ? (
                <span className="text-sm font-mono text-white">
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
                      ? 'text-green text-sm font-mono'
                      : item.dailyChange < 0
                        ? 'text-redbright text-sm font-mono'
                        : 'text-gray-400 text-sm font-mono'
                  }
                >
                  {formatPercentage(item.dailyChange, 2)}
                </span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            {/* Avail. Liq. column */}
            <div className="col-span-2 text-sm font-mono text-white">
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
    </>
  );
}

export default function TokenSelector({
  tokenList,
  selected,
  onChange,
  className,
  favorites = [],
  onToggleFavorite,
  selectedAction,
  asModal = false,
  isOpen: controlledIsOpen,
  onClose,
}: TokenSelectorProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOpen = asModal ? (controlledIsOpen ?? false) : internalIsOpen;
  const handleClose = asModal
    ? () => {
      onClose?.();
      setSearchTerm('');
    }
    : () => {
      setInternalIsOpen(false);
      setSearchTerm('');
    };

  const tokenData = useTokenSelectorData(tokenList, selectedAction, favorites);

  const sortedAndFilteredTokens = useMemo(() => {
    const sorted = [...tokenData].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;

      const aLiquidityUsd =
        selectedAction === 'short'
          ? a.availableLiquidity
          : a.availableLiquidity * (a.liquidityPrice ?? 0);
      const bLiquidityUsd =
        selectedAction === 'short'
          ? b.availableLiquidity
          : b.availableLiquidity * (b.liquidityPrice ?? 0);

      return bLiquidityUsd - aLiquidityUsd;
    });

    if (!searchTerm) return sorted;
    const searchLower = searchTerm.toLowerCase();
    return sorted.filter((item) =>
      item.symbol.toLowerCase().includes(searchLower),
    );
  }, [tokenData, selectedAction, searchTerm]);

  const handleTokenSelect = useCallback(
    (token: Token) => {
      onChange(token);
      handleClose();
    },
    [onChange, handleClose],
  );

  useEffect(() => {
    if (asModal) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setInternalIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [asModal]);

  if (!tokenData.length) {
    if (asModal) {
      return (
        <AnimatePresence>
          {isOpen && (
            <Modal
              title="Select Token"
              close={handleClose}
              className="flex flex-col overflow-hidden max-w-2xl w-full mx-4"
            >
              <div className="p-4 text-center text-white/50">
                <span className="text-base font-semibold">Loading...</span>
              </div>
            </Modal>
          )}
        </AnimatePresence>
      );
    }

    return (
      <div className={twMerge('relative', className)}>
        <div className="flex flex-row items-center gap-2 border rounded-md p-2 px-3 bg-main opacity-50">
          <span className="text-base font-semibold text-white">Loading...</span>
        </div>
      </div>
    );
  }

  // Modal mode
  if (asModal) {
    return (
      <AnimatePresence>
        {isOpen && (
          <Modal
            title="Select Token"
            close={handleClose}
            className="flex flex-col overflow-hidden max-w-2xl w-full mx-4"
          >
            <div className="w-full bg-main border border-bcolor rounded-md shadow-2xl overflow-hidden">
              {/* Search bar */}
              <div className="p-2 border-b border-bcolor">
                <input
                  type="text"
                  placeholder="Search token"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-inputcolor border border-white/10 rounded-md text-white font-mono placeholder-white/30 text-sm"
                />
              </div>

              <TokenList
                tokens={sortedAndFilteredTokens}
                selected={selected}
                onTokenSelect={handleTokenSelect}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
                selectedAction={selectedAction}
              />
            </div>
          </Modal>
        )}
      </AnimatePresence>
    );
  }

  // Dropdown mode
  return (
    <div className={twMerge('relative', className)} ref={dropdownRef}>
      {/* Token selector button */}
      <div className="flex-shrink-0">
        <div
          className="flex flex-row items-center gap-2 border rounded-md p-2 cursor-pointer hover:bg-third transition duration-300 bg-main"
          onClick={() => setInternalIsOpen(!internalIsOpen)}
        >
          <Image
            src={getTokenImage(selected)}
            alt={getTokenSymbol(selected.symbol)}
            width={20}
            height={20}
          />
          <span className="text-lg font-semibold text-white">
            {getTokenSymbol(selected.symbol)}
          </span>
          <Image
            src={chevronDownIcon}
            alt="Dropdown"
            width={24}
            height={24}
            className={twMerge(
              'transition-transform duration-300 w-6 h-6',
              isOpen ? 'rotate-180' : '',
            )}
          />
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-[94vw] min-w-[21rem] sm:w-[28rem] bg-main border border-bcolor rounded-md shadow-2xl z-50 overflow-hidden">
          {/* Search bar */}
          <div className="p-2 border-b border-bcolor">
            <input
              type="text"
              placeholder="Search token"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 bg-inputcolor border border-white/10 rounded-md text-white font-mono placeholder-white/30 text-sm"
            />
          </div>

          <TokenList
            tokens={sortedAndFilteredTokens}
            selected={selected}
            onTokenSelect={handleTokenSelect}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
            selectedAction={selectedAction}
          />
        </div>
      )}
    </div>
  );
}
