import Tippy from '@tippyjs/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';

import calendarIcon from '@/../public/images/Icons/calendar.svg';
import monitorIcon from '@/../public/images/Icons/monitor-icon.svg';
import SelectOptions from '@/components/common/SelectOptions/SelectOptions';
import LoaderWrapper from '@/components/Loader/LoaderWrapper';
import FormatNumber from '@/components/Number/FormatNumber';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';
import usePositionsHistory from '@/hooks/usePositionHistory';

import ActivityMiniChart from './ActivityMiniChart';
import DateSelector from './DateSelector';
import PositionHistoryTable from './PositionHistoryTable/PositionHistoryTable';
import {
  calculateCalendarDimensions,
  calculateMonthPosition,
} from './utils/calendarUtils';

export type ActivityDataType = {
  date: Date;
  stats: {
    totalPositions: number;
    winrate: number;
    color: string;
    size: number;
    pnl: number;
    volume: number;
    increaseSize: number;
    totalFees: number;
    bubbleSize: number;
  } | null;
};

export default function ActivityCalendar({
  data,
  bubbleBy,
  setBubbleBy,
  setSelectedRange,
  wrapperClassName,
  walletAddress,
  selectedRange,
  isLoading,
  hasData = false,
}: {
  data: ActivityDataType[] | null;
  bubbleBy: string;
  setBubbleBy: (bubbleBy: string) => void;
  setSelectedRange: (range: string) => void;
  wrapperClassName?: string;
  walletAddress?: string | null;
  selectedRange: string;
  isLoading: boolean;
  hasData?: boolean;
}) {
  const { t } = useTranslation();

  // Map internal values to translated display values
  const bubbleByOptions = {
    'pnl': t('monitoring.pnl'),
    'volume': t('monitoring.volume'),
    'position count': t('monitoring.positionCount'),
  };

  // Get the translated display value for the current bubbleBy
  const getDisplayValue = (internalValue: string) => {
    return bubbleByOptions[internalValue as keyof typeof bubbleByOptions] || internalValue;
  };

  // Convert translated display value back to internal value
  const getInternalValue = (displayValue: string) => {
    const entry = Object.entries(bubbleByOptions).find(([, v]) => v === displayValue);
    return entry ? entry[0] : displayValue;
  };

  const {
    positionsData,
    isInitialLoad,
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    handleSort,
    sortBy,
    sortDirection,
    currentPage,
    totalPages,
    loadPageData,
  } = usePositionsHistory({
    walletAddress: walletAddress ?? null,
    batchSize: 20,
    itemsPerPage: 20,
  });

  const isMobile = useBetterMediaQuery('(max-width: 640px)');
  const isTablet = useBetterMediaQuery('(max-width: 1024px)');
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = React.useState(1); // in rem
  const [blockMargin, setBlockMargin] = React.useState(0.125); // in rem
  const [scaleFactor, setScaleFactor] = React.useState(1);

  const isToday = React.useCallback((dateToCheck: Date) => {
    const today = new Date();
    return dateToCheck.toDateString() === today.toDateString();
  }, []);

  const processedData = isMobile
    ? data?.slice(-100)
    : isTablet
      ? data?.slice(-200)
      : data;

  const exportCalendarData = React.useCallback(() => {
    if (!data) return;

    const csvData = data.map(({ date, stats }) => ({
      date: new Date(date).toLocaleDateString(),
      pnl: stats?.pnl || 0,
      volume: stats?.volume || 0,
      positions: stats?.totalPositions || 0,
      fees: stats?.totalFees || 0,
    }));

    const headers = ['Date', 'PNL', 'Volume', 'Positions', 'Fees'];
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        [row.date, row.pnl, row.volume, row.positions, row.fees].join(','),
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'trading-activity.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

  const monthsInActivityData = useMemo(() => {
    if (!processedData) return {};

    const result = processedData.reduce(
      (acc, curr) => {
        if (curr === null) {
          return acc;
        }
        const date = new Date(curr.date);
        const month = date.toLocaleString('en-US', { month: 'short' });
        const key = `${date.getFullYear()}-${date.getMonth()}`; // Use this for sorting

        if (!acc[key]) {
          acc[key] = {
            month,
            count: 0,
            year: date.getFullYear(),
            rawMonthIndex: date.getMonth(),
            firstDayIndex: -1, // Will store the index of first day in the month
            lastDayIndex: -1, // Will store the index of last day in the month
          };
        }
        // Track the first and last occurrence of each month
        const currentIndex = processedData.indexOf(curr);
        if (acc[key].firstDayIndex === -1)
          acc[key].firstDayIndex = currentIndex;
        acc[key].lastDayIndex = currentIndex;
        acc[key].count += 1;
        return acc;
      },
      {} as {
        [key: string]: {
          month: string;
          count: number;
          year: number;
          rawMonthIndex: number;
          firstDayIndex: number;
          lastDayIndex: number;
        };
      },
    );

    return result;
  }, [processedData]);

  const sortedMonths = useMemo(() => {
    if (!monthsInActivityData || Object.keys(monthsInActivityData).length === 0)
      return [];

    return Object.entries(monthsInActivityData)
      .sort(([keyA], [keyB]) => {
        const [yearA, monthA] = keyA.split('-').map(Number);
        const [yearB, monthB] = keyB.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      })
      .map(([, value], index) => ({
        ...value,
        order: index,
        monthIndex: index,
      }));
  }, [monthsInActivityData]);

  // Combined loading state that includes month processing
  const isFullyLoading = useMemo(() => {
    return Boolean(isLoading || (processedData && sortedMonths.length === 0));
  }, [isLoading, processedData, sortedMonths.length]);

  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current && processedData) {
        const containerWidth = containerRef.current.offsetWidth;
        const dimensions = calculateCalendarDimensions(
          containerWidth,
          processedData.length
        );

        setBlockSize(dimensions.blockSize);
        setBlockMargin(dimensions.blockMargin);
        setScaleFactor(dimensions.scaleFactor);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [processedData, isMobile]);

  if (!processedData) {
    return (
      <div
        className={twMerge(
          'bg-[#040D14] border rounded-md p-3',
          wrapperClassName,
        )}
      >
        <div className="flex flex-col sm:flex-row mb-6 px-3 justify-between items-center">
          <p className="font-semibold text-lg">{t('monitoring.dailyTradingActivity')}</p>
          <div className="flex flex-row gap-3 animate-pulse">
            <div className="h-4 w-20 bg-third/20 rounded" />
          </div>
        </div>
        <div className="gap-3 mt-4 flex flex-col items-center justify-center">
          <div
            ref={containerRef}
            className="hide-scrollbar w-full flex justify-center"
          >
            <div
              className="animate-pulse grid grid-flow-col grid-rows-7"
              style={{ gap: '0.125rem' }}
            >
              {Array(91)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-third/20 rounded-sm"
                    style={{
                      width: '1rem',
                      height: '1rem',
                    }}
                  />
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="m-3 border rounded-md overflow-hidden bg-[#040D14] mt-6 mb-3">
      <div className="flex flex-col sm:flex-row gap-3 mb-6 p-3 sm:p-0 justify-between items-center bg-third border-b">
        <div className="flex flex-row items-center gap-2 p-2 sm:px-3">
          <Image
            src={monitorIcon}
            alt="Monitor Icon"
            width={12}
            height={12}
            className="w-4 h-4 opacity-50"
          />

          <p className="font-semibold text-lg sm:text-lg">
            {t('monitoring.dailyTradingActivity')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-0 w-full sm:w-auto">
          <div className="flex flex-row gap-3 p-3 border sm:border-y-0 sm:border-r-0 rounded-md sm:rounded-none sm:border-l border-inputcolor w-full sm:w-auto">
            <SelectOptions
              selected={getDisplayValue(bubbleBy)}
              options={Object.values(bubbleByOptions)}
              onClick={(displayValue) => setBubbleBy(getInternalValue(displayValue))}
              className="p-0 border-0"
            />
          </div>

          <div className="flex flex-row items-center gap-2 px-3 p-2 border sm:border-y-0 sm:border-r-0 rounded-md sm:rounded-none border-l border-inputcolor flex-none">
            <DateSelector
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
              setSelectedRange={setSelectedRange}
              selectedRange={selectedRange}
            />
          </div>
        </div>
      </div>
      <div className={twMerge('bg-[#040D14] rounded-md p-3', wrapperClassName)}>
        <LoaderWrapper
          isLoading={isFullyLoading}
          height="10.75rem"
          key="activity-calendar-loader"
        >
          <div className="gap-3 mt-4 flex flex-col items-center justify-center">
            <div
              ref={containerRef}
              className="hide-scrollbar w-full lg:w-[80%] flex justify-center"
            >
              <div className="relative flex flex-col">
                <div className="relative flex flex-row mt-4">
                  {sortedMonths.map((monthData, i) => {
                    let weekNumber = Math.floor(monthData.firstDayIndex / 7);

                    if (i > 0) {
                      const prevMonth = sortedMonths[i - 1];
                      const prevWeek = Math.floor(prevMonth.firstDayIndex / 7);
                      if (weekNumber === prevWeek) {
                        weekNumber += 1;
                      }
                    }

                    const position = calculateMonthPosition(
                      weekNumber,
                      blockSize,
                      blockMargin
                    );

                    return (
                      <div
                        key={i}
                        className="absolute text-sm font-semibold opacity-50 z-10 whitespace-nowrap"
                        style={{
                          left: `${position}rem`,
                          top: '-1.5rem',
                          fontSize: '0.75rem',
                        }}
                      >
                        {monthData.month}
                      </div>
                    );
                  })}
                </div>
                <div
                  className="relative grid w-fit grid-flow-col grid-rows-7 overflow-auto"
                  style={{
                    columnGap: `${blockMargin}rem`,
                    rowGap: `${blockMargin}rem`,
                    padding: '0.0625rem', // Add padding to ensure highlights are visible
                  }}
                >
                  {processedData.map(({ date, stats }, i) => {
                    if (stats === null) {
                      return (
                        <Tippy
                          content={
                            <p className="text-xs font-semibold">
                              {new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                day: 'numeric',
                                month: 'short',
                              })}
                            </p>
                          }
                          key={i}
                        >
                          <div
                            key={i}
                            className={twMerge(
                              'bg-third hover:bg-secondary rounded-sm transition duration-300 relative',
                              isToday(new Date(date)) &&
                              'after:absolute after:inset-[-1px] after:rounded-sm after:border after:border-[#2C3A47] after:z-10',
                              (new Date(startDate) > new Date(date) ||
                                new Date(endDate) < new Date(date)) &&
                              'opacity-30',
                            )}
                            style={{
                              width: `${blockSize}rem`,
                              height: `${blockSize}rem`,
                            }}
                          />
                        </Tippy>
                      );
                    }
                    return (
                      <Tippy
                        content={
                          <div className="flex flex-col gap-1">
                            <div className="flex flex-row gap-1 items-center mb-1">
                              <Image
                                src={calendarIcon}
                                alt="calendar"
                                width={10}
                                height={10}
                              />
                              <p className="text-xs font-semibold">
                                {new Date(date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  day: 'numeric',
                                  month: 'short',
                                })}
                              </p>
                            </div>

                            <FormatNumber
                              nb={stats.totalPositions}
                              prefix={`${t('monitoring.positions')}: `}
                              prefixClassName={twMerge(
                                'font-mono opacity-50',
                                bubbleBy === 'position count' &&
                                'text-[#F1C40F] opacity-100',
                              )}
                            />

                            <div className="flex items-center gap-2">
                              <FormatNumber
                                nb={stats.pnl}
                                prefix={`${t('monitoring.pnl')}: `}
                                format="currency"
                                prefixClassName={twMerge(
                                  'font-mono opacity-50',
                                  bubbleBy === 'pnl' &&
                                  'text-[#F1C40F] opacity-100',
                                )}
                              />
                              {stats.pnl !== 0 && (
                                <span
                                  className={
                                    stats.pnl > 0
                                      ? 'text-[#17AC81]'
                                      : 'text-[#AB2E42]'
                                  }
                                >
                                  {stats.pnl > 0 ? '↑' : '↓'}
                                </span>
                              )}
                            </div>

                            <FormatNumber
                              nb={stats.size}
                              prefix={`${t('monitoring.size')}: `}
                              format="currency"
                              prefixClassName={twMerge(
                                'font-mono opacity-50',
                                bubbleBy === 'Open Size'
                                  ? 'text-[#F1C40F] opacity-100'
                                  : '',
                              )}
                            />

                            <FormatNumber
                              nb={stats.volume}
                              prefix={`${t('monitoring.volume')}: `}
                              format="currency"
                              prefixClassName={twMerge(
                                'font-mono opacity-50',
                                bubbleBy === 'volume' &&
                                'text-[#F1C40F] opacity-100',
                              )}
                            />
                            <FormatNumber
                              nb={stats.totalFees}
                              prefix={`${t('monitoring.fees')}: `}
                              format="currency"
                              prefixClassName={twMerge(
                                'font-mono opacity-50',
                                bubbleBy === 'Fees'
                                  ? 'text-[#F1C40F] opacity-100'
                                  : '',
                              )}
                            />

                            <FormatNumber
                              nb={stats.winrate}
                              prefix={`${t('monitoring.winrate')}: `}
                              format="percentage"
                              prefixClassName="font-mono opacity-50"
                            />
                          </div>
                        }
                        key={'cell-' + i}
                      >
                        <div
                          className={twMerge(
                            'flex items-center justify-center bg-third hover:bg-secondary rounded-sm cursor-pointer transition duration-300 relative',
                            isToday(new Date(date)) &&
                            'after:absolute after:inset-[-1px] after:rounded-sm after:border after:border-[#2C3A47] after:z-10',

                            (new Date(startDate) > new Date(date) ||
                              new Date(endDate) < new Date(date)) &&
                            'opacity-30',
                          )}
                          style={{
                            width: `${blockSize}rem`,
                            height: `${blockSize}rem`,
                          }}
                          onClick={() => {
                            const currentDate = new Date(date);
                            const startDate = new Date(date);
                            const endDate = new Date(
                              currentDate.setHours(currentDate.getHours() + 24),
                            );

                            setSelectedRange?.('Custom');

                            setStartDate?.(startDate.toISOString());

                            setEndDate?.(endDate.toISOString());
                          }}
                        >
                          <svg height="100%" width="100%">
                            <motion.circle
                              cx="50%"
                              cy="50%"
                              initial={{ r: 0 }}
                              animate={{
                                r: Math.min(
                                  (stats.bubbleSize * scaleFactor) / 2,
                                  (blockSize * 16) / 2, // Convert rem to pixels for radius calculation
                                ),
                              }}
                              transition={{ duration: 0.3 }}
                              fill={
                                new Date(startDate) > new Date(date) ||
                                  new Date(endDate) < new Date(date)
                                  ? '#1C2D42'
                                  : stats.color
                              }
                              className="inline-block"
                            ></motion.circle>
                          </svg>
                        </div>
                      </Tippy>
                    );
                  })}
                </div>

                <div className="flex flex-row items-center justify-center mt-3 gap-6">
                  <div className="flex flex-row gap-2 items-center">
                    <p className="font-mono opacity-30 text-sm">{t('monitoring.pnl')}</p>

                    <div className="flex flex-row items-center gap-1">
                      {[
                        { color: '#AB2E42', label: t('monitoring.loss') },
                        { color: '#BD773E', label: t('monitoring.belowAvg') },
                        { color: '#17AC81', label: t('monitoring.aboveAvg') },
                      ].map(({ color, label }, i) => (
                        <Tippy key={i} content={label}>
                          <div
                            className={`h-2 w-2 rounded-sm cursor-help transition-opacity duration-300 hover:opacity-80`}
                            style={{ backgroundColor: color }}
                          />
                        </Tippy>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-row items-center gap-2 justify-center">
                    <button
                      onClick={exportCalendarData}
                      className="text-xs opacity-30 hover:opacity-100 transition-opacity duration-300 flex items-center gap-1"
                    >
                      {t('monitoring.exportCsv')}
                      <svg
                        className="w-3 h-3 translate-y-[-0.35em]"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </LoaderWrapper>
      </div>

      {hasData ? (
        <ActivityMiniChart
          data={data}
          bubbleBy={
            bubbleBy.toLowerCase() as 'pnl' | 'volume' | 'position count'
          }
        />
      ) : null}

      {walletAddress ? (
        <PositionHistoryTable
          positionsData={positionsData}
          isLoadingPositionsHistory={isInitialLoad}
          handleSort={handleSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          currentPage={currentPage}
          totalPages={totalPages}
          loadPageData={loadPageData}
          walletAddress={walletAddress}
        />
      ) : null}
    </div>
  );
}
