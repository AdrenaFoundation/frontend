import Tippy from '@tippyjs/react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import chevronDownIcon from '@/../public/images/chevron-down.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import useCustodyVolume from '@/hooks/useCustodyVolume';
import useDailyStats from '@/hooks/useDailyStats';
import { useSelector } from '@/store/store';
import { Token } from '@/types';
import { getTokenImage, getTokenSymbol } from '@/utils';

export default function TradingChartHeaderStats({
  className,
  priceClassName,
  selected,
  statsClassName,
  numberLong,
  numberShort,
  selectedAction,
  compact = false,
  showIcon = false,
  showMainLineOnly = false,
  showExpandedStatsOnly = false,
  isStatsExpanded,
  setIsStatsExpanded,
}: {
  className?: string;
  selected: Token;
  priceClassName?: string;
  statsClassName?: string;
  numberLong?: number;
  numberShort?: number;
  selectedAction: 'long' | 'short' | 'swap';
  compact?: boolean;
  showIcon?: boolean;
  showMainLineOnly?: boolean;
  showExpandedStatsOnly?: boolean;
  isStatsExpanded?: boolean;
  setIsStatsExpanded?: (expanded: boolean) => void;
}) {
  const selectedTokenPrice = useSelector(
    (s) => s.streamingTokenPrices[getTokenSymbol(selected.symbol)] ?? null,
  );
  const borrowRates = useSelector((s) => s.borrowRates);
  const stats = useDailyStats();
  const { volumeStats } = useCustodyVolume();
  const [previousTokenPrice, setPreviousTokenPrice] = useState<number | null>(
    null,
  );
  const [tokenColor, setTokenColor] = useState<
    'text-white' | 'text-green' | 'text-redbright'
  >('text-white');
  const [localIsStatsExpanded, setLocalIsStatsExpanded] = useState(false);
  const statsExpanded =
    isStatsExpanded !== undefined ? isStatsExpanded : localIsStatsExpanded;
  const setStatsExpanded = setIsStatsExpanded || setLocalIsStatsExpanded;

  const borrowingRate = useMemo(() => {
    if (!window.adrena?.client) return null;

    try {
      if (selectedAction === 'short') {
        const usdcToken = window.adrena.client.getUsdcToken();
        const usdcCustody = window.adrena.client.getCustodyByMint(
          usdcToken.mint,
        );
        if (!usdcCustody) return null;
        return borrowRates[usdcCustody.pubkey.toBase58()] ?? null;
      } else {
        const custody = window.adrena.client.getCustodyByMint(selected.mint);
        if (!custody) return null;
        return borrowRates[custody.pubkey.toBase58()] ?? null;
      }
    } catch (error) {
      console.warn('Error getting borrowing rate:', error);
      return null;
    }
  }, [selectedAction, selected.mint, borrowRates]);

  const platformDailyVolume = useMemo(() => {
    if (!window.adrena?.client) return null;

    try {
      const custody = window.adrena.client.getCustodyByMint(selected.mint);
      if (!custody) return null;

      const custodyKey = custody.pubkey.toBase58();
      return volumeStats[custodyKey]?.dailyVolume ?? null;
    } catch (error) {
      console.warn('Error getting platform daily volume:', error);
      return null;
    }
  }, [selected.mint, volumeStats]);

  useEffect(() => {
    if (selectedTokenPrice !== null && previousTokenPrice !== null) {
      if (selectedTokenPrice > previousTokenPrice) {
        setTokenColor('text-green');
      } else if (selectedTokenPrice < previousTokenPrice) {
        setTokenColor('text-redbright');
      }
    }
    if (selectedTokenPrice !== null) {
      setPreviousTokenPrice(selectedTokenPrice);
    }
  }, [selectedTokenPrice, previousTokenPrice]);

  const dailyChange = stats?.[selected.symbol]?.dailyChange ?? null;

  if (showExpandedStatsOnly) {
    return (
      <div className="sm:hidden">
        {statsExpanded && (
          <div className="flex items-center justify-between w-full mt-2 text-xs font-mono">
            {/* Left side: Position counts */}
            {numberLong && numberShort ? (
              <div className="flex gap-0.5">
                <span className="text-greenSide text-xxs leading-none bg-green/10 rounded-lg px-2 py-1.5">
                  Long: {numberLong}
                </span>
                <span className="text-redSide text-xxs leading-none bg-red/10 rounded-lg px-2 py-1.5">
                  Short: {numberShort}
                </span>
              </div>
            ) : (
              <div></div>
            )}

            {/* Right side: Volume and Borrow Rate */}
            <div className="flex items-center gap-4">
              <span className="text-txtfade">
                24h Vol.{' '}
                {platformDailyVolume !== null && platformDailyVolume > 0 ? (
                  <FormatNumber
                    nb={platformDailyVolume}
                    format="currency"
                    isAbbreviate={true}
                    isDecimalDimmed={false}
                    className="text-white font-mono ml-1"
                  />
                ) : (
                  '-'
                )}
              </span>
              <Tippy
                content={
                  <div className="text-sm">
                    Hourly borrow rate in % of position size
                  </div>
                }
                placement="bottom"
              >
                <span className="text-txtfade cursor-help">
                  B.Rate{' '}
                  <span className="text-white font-mono ml-1 cursor-help">
                    {borrowingRate !== null
                      ? `${(borrowingRate * 100).toFixed(4)}%/h`
                      : '-'}
                  </span>
                </span>
              </Tippy>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (showMainLineOnly) {
    return (
      <div className="flex items-center gap-3 sm:hidden">
        <span className="text-xs font-mono text-txtfade">
          <span
            className={`${
              dailyChange
                ? dailyChange > 0
                  ? 'text-green'
                  : 'text-redbright'
                : 'text-white'
            } font-mono`}
          >
            {dailyChange
              ? `${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}%`
              : '-'}
          </span>
        </span>
        <FormatNumber
          nb={selectedTokenPrice}
          format="currency"
          minimumFractionDigits={2}
          precision={selected.displayPriceDecimalsPrecision}
          className={twMerge('text-2xl font-bold', tokenColor, priceClassName)}
        />
        <button
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="p-1 bg-third rounded transition-colors"
        >
          <Image
            src={chevronDownIcon}
            alt="Toggle stats"
            width={16}
            height={16}
            className={twMerge(
              'transition-transform duration-200',
              statsExpanded ? 'rotate-180' : '',
            )}
          />
        </button>
      </div>
    );
  }

  return (
    <div
      className={twMerge(
        'flex w-full flex-row sm:flex-row justify-between sm:justify-end lg:gap-6 items-center sm:items-center sm:pr-1',
        className,
      )}
    >
      {/* Mobile: Expandable stats layout */}
      <div
        className={twMerge(
          'flex flex-col w-full',
          compact ? 'hidden' : 'flex sm:hidden',
        )}
      >
        {/* Main line with price and expand button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-txtfade ml-2">
              <span
                className={`${
                  dailyChange
                    ? dailyChange > 0
                      ? 'text-green'
                      : 'text-redbright'
                    : 'text-white'
                } font-mono`}
              >
                {dailyChange
                  ? `${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(2)}%`
                  : '-'}
              </span>
            </span>
            <FormatNumber
              nb={selectedTokenPrice}
              format="currency"
              minimumFractionDigits={2}
              precision={selected.displayPriceDecimalsPrecision}
              className={twMerge(
                'text-2xl font-bold mr-2',
                tokenColor,
                priceClassName,
              )}
            />
          </div>

          {/* Expand button */}
          <button
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="p-1 bg-third rounded transition-colors"
          >
            <Image
              src={chevronDownIcon}
              alt="Toggle stats"
              width={16}
              height={16}
              className={twMerge(
                'transition-transform duration-200',
                statsExpanded ? 'rotate-180' : '',
              )}
            />
          </button>
        </div>

        {/* Expandable stats row */}
        {statsExpanded && (
          <div className="flex items-center justify-between w-full mt-1 mb-1 text-xs font-mono">
            {/* Left side: Position counts */}
            {numberLong && numberShort ? (
              <div className="flex gap-0.5">
                <span className="text-greenSide text-xxs leading-none bg-green/10 rounded-lg px-2 py-1.5">
                  Long: {numberLong}
                </span>
                <span className="text-redSide text-xxs leading-none bg-red/10 rounded-lg px-2 py-1.5">
                  Short: {numberShort}
                </span>
              </div>
            ) : (
              <div></div>
            )}

            {/* Right side: Volume and Borrow Rate */}
            <div className="flex items-center gap-4">
              <span className="text-txtfade">
                24h Vol.{' '}
                {platformDailyVolume !== null && platformDailyVolume > 0 ? (
                  <FormatNumber
                    nb={platformDailyVolume}
                    format="currency"
                    isAbbreviate={true}
                    isDecimalDimmed={false}
                    className="text-white font-mono ml-1"
                  />
                ) : (
                  '-'
                )}
              </span>
              <Tippy
                content={
                  <div className="text-sm">
                    Hourly borrow rate in % of position size
                  </div>
                }
                placement="bottom"
              >
                <span className="text-txtfade cursor-help">
                  B.Rate{' '}
                  <span className="text-white font-mono ml-1 cursor-help">
                    {borrowingRate !== null
                      ? `${(borrowingRate * 100).toFixed(4)}%/h`
                      : '-'}
                  </span>
                </span>
              </Tippy>
            </div>
          </div>
        )}
      </div>

      {/* Compact single-line layout - show only when compact */}
      {compact && (
        <div className="flex flex-col w-full">
          {/* Main line */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              {showIcon && (
                <Image
                  src={getTokenImage(selected)}
                  alt={selected.symbol}
                  className="w-[20px] h-[20px]"
                />
              )}
              <span className="text-lg font-boldy">
                {getTokenSymbol(selected.symbol)} / USD
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-txtfade">
                <span
                  className={`${
                    dailyChange
                      ? dailyChange > 0
                        ? 'text-green'
                        : 'text-redbright'
                      : 'text-white'
                  } font-mono`}
                >
                  {dailyChange ? `${dailyChange.toFixed(2)}%` : '-'}
                </span>
              </span>
              <FormatNumber
                nb={selectedTokenPrice}
                format="currency"
                minimumFractionDigits={2}
                precision={selected.displayPriceDecimalsPrecision}
                className={twMerge(
                  'text-2xl font-bold',
                  tokenColor,
                  priceClassName,
                )}
              />
              <button
                onClick={() => setStatsExpanded(!statsExpanded)}
                className="p-1 bg-third rounded transition-colors"
              >
                <Image
                  src={chevronDownIcon}
                  alt="Toggle stats"
                  width={16}
                  height={16}
                  className={twMerge(
                    'transition-transform duration-200',
                    statsExpanded ? 'rotate-180' : '',
                  )}
                />
              </button>
            </div>
          </div>

          {/* Expandable stats row for compact mode */}
          {statsExpanded && (
            <div className="flex items-center justify-between w-full mt-2 text-xs font-mono">
              {/* Left side: Position counts */}
              {numberLong && numberShort ? (
                <div className="flex gap-0.5">
                  <span className="text-greenSide text-xxs leading-none bg-green/10 rounded-lg px-2 py-1.5">
                    Long: {numberLong}
                  </span>
                  <span className="text-redSide text-xxs leading-none bg-red/10 rounded-lg px-2 py-1.5">
                    Short: {numberShort}
                  </span>
                </div>
              ) : (
                <div></div>
              )}

              {/* Right side: Volume and Borrow Rate */}
              <div className="flex items-center gap-4">
                <span className="text-txtfade">
                  24h Vol.{' '}
                  {platformDailyVolume !== null && platformDailyVolume > 0 ? (
                    <FormatNumber
                      nb={platformDailyVolume}
                      format="currency"
                      isAbbreviate={true}
                      isDecimalDimmed={false}
                      className="text-white font-mono ml-1"
                    />
                  ) : (
                    '-'
                  )}
                </span>
                <Tippy
                  content={
                    <div className="text-sm">
                      Hourly borrow rate in % of position size
                    </div>
                  }
                  placement="bottom"
                >
                  <div className="flex items-center">
                    <span className="font-mono text-sm sm:text-xs text-txtfade text-right cursor-help">
                      B.Rate
                    </span>
                    <span className="font-mono text-sm sm:text-xs text-white ml-1 cursor-help">
                      {borrowingRate !== null
                        ? `${(borrowingRate * 100).toFixed(4)}%/h`
                        : '-'}
                    </span>
                  </div>
                </Tippy>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Desktop layout - hide when compact */}
      <div
        className={twMerge(
          'w-auto justify-start gap-3 lg:gap-6 items-center',
          compact ? 'hidden' : 'hidden sm:flex',
        )}
      >
        {numberLong && numberShort ? (
          <div className="flex-row gap-2 mr-0 xl:mr-2 hidden lg:flex">
            <div className="px-2 py-1 bg-green/10 rounded-lg inline-flex justify-center items-center gap-2">
              <Link
                href="/monitoring?view=livePositions"
                className="text-center justify-start text-greenSide text-xxs font-mono"
              >
                Long:{numberLong}
              </Link>
            </div>
            <div className="px-2 py-1 bg-red/10 rounded-md inline-flex justify-center items-center gap-2">
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
          className={twMerge(
            'text-lg font-bold -mr-1',
            tokenColor,
            priceClassName,
          )}
        />

        <div className="flex flex-row gap-3">
          <div className="flex items-center rounded-full flex-wrap">
            <span className="flex font-mono sm:text-xxs text-txtfade text-right"></span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-2 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-sm sm:text-xs text-txtfade">
              24h Ch.
            </span>
            <span
              className={twMerge(
                'font-mono text-sm sm:text-xs',
                dailyChange
                  ? dailyChange > 0
                    ? 'text-green'
                    : 'text-redbright'
                  : 'text-white',
              )}
            >
              {dailyChange ? `${dailyChange.toFixed(2)}%` : '-'}
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <span className="font-mono text-sm sm:text-xxs text-txtfade text-right">
              Vol.
            </span>
            <span className="font-mono text-sm sm:text-xs">
              <FormatNumber
                nb={platformDailyVolume}
                format="currency"
                isAbbreviate={true}
                isDecimalDimmed={false}
                className="font-mono text-sm sm:text-xs"
              />
            </span>
          </div>

          <div
            className={twMerge(
              'flex items-center sm:gap-1 rounded-full flex-wrap',
              statsClassName,
            )}
          >
            <Tippy
              content={
                <div className="text-sm">
                  Hourly borrow rate in % of position size
                </div>
              }
              placement="bottom"
            >
              <div className="flex items-center">
                <span className="font-mono text-sm sm:text-xs text-txtfade text-right cursor-help">
                  B.Rate
                </span>
                <span className="font-mono text-sm sm:text-xs text-white ml-1 cursor-help">
                  {borrowingRate !== null
                    ? `${(borrowingRate * 100).toFixed(4)}%/h`
                    : '-'}
                </span>
              </div>
            </Tippy>
          </div>
        </div>
      </div>
    </div>
  );
}
