import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import FormatNumber from '@/components/Number/FormatNumber';
import useCustodyVolume from '@/hooks/useCustodyVolume';
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
  selectedAction,
}: {
  className?: string;
  selected: Token;
  priceClassName?: string;
  statsClassName?: string;
  numberLong?: number;
  numberShort?: number;
  selectedAction: 'long' | 'short' | 'swap';
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

  return (
    <div
      className={twMerge(
        'flex w-full flex-row sm:flex-row justify-between sm:justify-end lg:gap-6 items-center sm:items-center sm:pr-1',
        className,
      )}
    >
      {/* Mobile: Compact single line layout */}
      <div className="flex sm:hidden items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <FormatNumber
            nb={selectedTokenPrice}
            format="currency"
            minimumFractionDigits={2}
            precision={selected.displayPriceDecimalsPrecision}
            className={twMerge('text-lg font-bold', tokenColor, priceClassName)}
          />
          <span className="text-xs font-mono text-txtfade">
            24h Ch.{' '}
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
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-txtfade">
            24h Vol.{' '}
            {platformDailyVolume !== null && platformDailyVolume > 0 ? (
              <FormatNumber
                nb={platformDailyVolume}
                format="currency"
                isAbbreviate={true}
                isDecimalDimmed={false}
                className="text-white font-mono"
              />
            ) : (
              '-'
            )}
          </span>
          <span className="text-txtfade">
            Bor. R.{' '}
            <span className="text-white font-mono">
              {borrowingRate !== null
                ? `${(borrowingRate * 100).toFixed(4)}%/h`
                : '-'}
            </span>
          </span>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden sm:flex w-auto justify-start gap-3 lg:gap-6 items-center">
        {numberLong && numberShort ? (
          <div className="flex-row gap-2 mr-0 xl:mr-2 hidden md:flex">
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
            <span className="font-mono text-sm sm:text-xs text-txtfade text-right">
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
            <span className="font-mono text-sm sm:text-xs text-txtfade text-right">
              Bor. R.
            </span>
            <span className="font-mono text-sm sm:text-xs text-white mr-1">
              {borrowingRate !== null
                ? `${(borrowingRate * 100).toFixed(4)}%/h`
                : '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
