import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import { Token } from '@/types';
import { getTokenSymbol, getTokenImage } from '@/utils';

import chevronDownIcon from '../../../../../public/images/chevron-down.svg';

interface FavoritesBarProps {
  favoriteTokens: Token[];
  selected: Token;
  onChange: (token: Token) => void;
  className?: string;
}

function ArrowButton({
  direction,
  onClick,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
}) {
  const isLeft = direction === 'left';
  return (
    <div
      className={twMerge(
        'absolute top-0 bottom-0 flex items-center z-10 pointer-events-none',
        isLeft ? 'left-0' : 'right-0',
      )}
    >
      <div
        className={twMerge(
          'w-8 h-full flex items-center justify-center',
          isLeft
            ? 'bg-gradient-to-r from-main to-transparent'
            : 'bg-gradient-to-l from-main to-transparent',
        )}
      >
        <button
          onClick={onClick}
          className="w-6 h-6 bg-third/40 hover:bg-third/70 rounded-full flex items-center justify-center transition-colors pointer-events-auto"
        >
          <Image
            src={chevronDownIcon}
            alt={isLeft ? 'Scroll left' : 'Scroll right'}
            width={16}
            height={16}
            className={twMerge(
              'transition-transform duration-200',
              isLeft ? 'rotate-90' : '-rotate-90',
            )}
          />
        </button>
      </div>
    </div>
  );
}

export default function FavoritesBar({
  favoriteTokens,
  selected,
  onChange,
  className,
}: FavoritesBarProps) {
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollPosition();
  }, [favoriteTokens]);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= 200;
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += 200;
    }
  };

  if (favoriteTokens.length === 0) return null;

  return (
    <div
      className={twMerge(
        'relative flex flex-row items-center gap-1 min-w-0 flex-1 overflow-hidden',
        className,
      )}
    >
      {showLeftArrow && <ArrowButton direction="left" onClick={scrollLeft} />}

      <div
        ref={scrollContainerRef}
        className="flex flex-row items-center gap-1 min-w-0 overflow-x-auto px-0"
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {favoriteTokens.map((token) => {
          const symbol = getTokenSymbol(token.symbol);
          return (
            <div
              key={token.symbol}
              className={twMerge(
                'flex flex-row items-center gap-2 border rounded-lg p-1 px-3 pr-5 cursor-pointer opacity-50 hover:opacity-100 hover:bg-third transition duration-300 flex-shrink-0 min-w-0',
                selected.symbol === token.symbol ? 'opacity-100 bg-third' : '',
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
                  'text-base font-boldy min-w-0 truncate',
                  selected.symbol === token.symbol && 'font-interBold',
                )}
              >
                {symbol}
              </p>
            </div>
          );
        })}
      </div>

      {showRightArrow && (
        <ArrowButton direction="right" onClick={scrollRight} />
      )}
    </div>
  );
}
