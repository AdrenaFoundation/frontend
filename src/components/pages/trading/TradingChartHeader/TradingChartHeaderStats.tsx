import Link from 'next/link';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenSymbol } from '@/utils';

export default function TradingChartHeaderStats({
  className,
  priceClassName,
  selected,
  statsClassName,
  numberLong,
  numberShort,
}: {
  className?: string;
  selected: Token;
  priceClassName?: string;
  statsClassName?: string;
  numberLong?: number;
  numberShort?: number;
}) {
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
  );
  const stats = useDailyStats();
  const [previousTokenPrice, setPreviousTokenPrice] = useState<number | null>(
    null,
  );
  const [tokenColor, setTokenColor] = useState<
    'text-white' | 'text-green' | 'text-red'
  >('text-white');

  if (selectedTokenPrice !== null) {
    if (previousTokenPrice !== null) {
      // if streamingTokenPrices is higher than previous value, set color to green
      // if streamingTokenPrices is smaller than previous value, set color to red
      const newTokenColor =
        selectedTokenPrice > previousTokenPrice
          ? 'text-green'
          : selectedTokenPrice < previousTokenPrice
            ? 'text-red'
            : tokenColor;
      // make sure we're only updating the local state if the new color is different.
      if (newTokenColor !== tokenColor) {
        setTokenColor(newTokenColor);
      }
    }

    if (selectedTokenPrice !== previousTokenPrice) {
      setPreviousTokenPrice(selectedTokenPrice);
    }
  }

  const dailyChange = stats?.[selected.symbol]?.dailyChange ?? null;
  const dailyVolume = stats?.[selected.symbol]?.dailyVolume ?? null;
  const lastDayHigh = stats?.[selected.symbol]?.lastDayHigh ?? null;
  const lastDayLow = stats?.[selected.symbol]?.lastDayLow ?? null;

  return (
    <div
      className={twMerge(
        'flex w-full flex-row sm:flex-row justify-between sm:justify-end lg:gap-6 items-center sm:items-center sm:pr-5',
        className,
      )}
    >
      {/* Mobile: Price on left */}
      <div className="flex sm:hidden items-center ml-2">
        <FormatNumber
          nb={selectedTokenPrice}
          format="currency"
          minimumFractionDigits={2}
          precision={selected.displayPriceDecimalsPrecision}
          className={twMerge('text-xl font-bold', tokenColor, priceClassName)}
        />
      </div>

      {/* Mobile: Compact stats on right - labels above values */}
      <div className="flex sm:hidden items-center justify-center gap-2 text-xxs font-mono mt-1">
        {/* 24h Change */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-txtfade text-xxs leading-none mb-0.5">
            24h Change
          </span>
          <span
            className={`font-mono leading-none text-xxs ${
              dailyChange
                ? dailyChange > 0
                  ? 'text-green'
                  : 'text-red'
                : 'text-white'
            }`}
          >
            {dailyChange ? `${dailyChange.toFixed(2)}%` : '-'}
          </span>
        </div>

        {/* Volume */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-txtfade text-xxs leading-none mb-0.5">
            24h Vol
          </span>
          <span className="text-white text-xxs font-mono leading-none">
            {dailyVolume ? (
              <FormatNumber
                nb={dailyVolume}
                format="currency"
                isAbbreviate={true}
                isDecimalDimmed={false}
                className="font-mono text-xxs"
              />
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* 24h High */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-txtfade text-xxs leading-none mb-0.5">
            24h Hi
          </span>
          <span className="text-white text-xxs font-mono leading-none">
            {lastDayHigh ? (
              <FormatNumber
                nb={lastDayHigh}
                format="currency"
                className="font-mono text-xxs"
              />
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* 24h Low */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-txtfade text-xxs leading-none mb-0.5">
            24h Lo
          </span>
          <span className="text-white text-xxs font-mono leading-none">
            {lastDayLow ? (
              <FormatNumber
                nb={lastDayLow}
                format="currency"
                className="font-mono text-xxs"
              />
            ) : (
              '-'
            )}
          </span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex w-auto justify-start gap-3 lg:gap-6 items-center">
        {/* Desktop: Long/Short first, Mobile: Price first */}
        {numberLong && numberShort ? (
          <div className="flex flex-row gap-2 mr-0 xl:mr-4">
            <div className="px-2 py-1 bg-green/10 rounded-lg inline-flex justify-center items-center gap-2">
              <Link
                href="/monitoring?view=livePositions"
                className="text-center justify-start text-greenSide text-xxs font-mono"
              >
                Long:{numberLong}
              </Link>
            </div>
            <div className="px-2 py-1 bg-red/10 rounded-lg inline-flex justify-center items-center gap-2">
              <Link
                href="/monitoring?view=livePositions"
                className="text-center justify-start text-redSide text-xxs font-mono"
              >
                Short:{numberShort}
              </Link>
            </div>
          </div>
        ) : null}

        <FormatNumber
          nb={selectedTokenPrice}
          format="currency"
          minimumFractionDigits={2}
          precision={selected.displayPriceDecimalsPrecision}
          className={twMerge('text-lg font-bold', tokenColor, priceClassName)}
        />

        {/* Desktop stats section */}
        <div className="flex flex-row gap-3">
          <div className="flex items-center rounded-full flex-wrap">
            <span className="flex font-mono sm:text-xxs text-txtfade text-right">
              24h:
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
              Ch.
            </span>
            <span
              className={twMerge(
                'font-mono text-xs sm:text-xxs', // Adjusted to text-xs
                dailyChange
                  ? dailyChange > 0
                    ? 'text-green'
                    : 'text-red'
                  : 'text-white',
              )}
            >
              {dailyChange
                ? `${dailyChange.toFixed(2)}%` // Manually format to 2 decimal places
                : '-'}
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
              Vol.
            </span>
            <span className="font-mono text-xs sm:text-xxs">
              <FormatNumber
                nb={dailyVolume}
                format="currency"
                isAbbreviate={true}
                isDecimalDimmed={false}
                className="font-mono text-xxs" // Ensure smaller font
              />
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
              Hi
            </span>
            <span className="font-mono text-xs sm:text-xxs">
              <FormatNumber
                nb={lastDayHigh} // Assuming high is available in stats
                format="currency"
                className="font-mono text-xxs"
              />
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-xs sm:text-xxs text-txtfade text-right">
              Lo
            </span>
            <span className="font-mono text-xxs sm:text-xs">
              <FormatNumber
                nb={lastDayLow} // Assuming low is available in stats
                format="currency"
                className="font-mono text-xxs"
              />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
