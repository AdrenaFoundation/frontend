import Tippy from '@tippyjs/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import calendarIcon from '@/../public/images/Icons/calendar.svg';
import FormatNumber from '@/components/Number/FormatNumber';
import useBetterMediaQuery from '@/hooks/useBetterMediaQuery';

export default function ActivityCalendar({
    data,
    setStartDate,
    setEndDate,
    bubbleBy,
    setBubbleBy,
    setSelectedRange,
    wrapperClassName,
    isUserActivity = false,
}: {
    data:
    | {
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
    }[]
    | null;
    setEndDate?: (date: string) => void;
    setStartDate?: (date: string) => void;
    bubbleBy: string;
    setBubbleBy: (bubbleBy: string) => void;
    setSelectedRange?: (range: string) => void;
    wrapperClassName?: string;
    isUserActivity?: boolean;
}) {
    const isMobile = useBetterMediaQuery('(max-width: 640px)');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [blockSize, setBlockSize] = React.useState(16);
    const [blockMargin, setBlockMargin] = React.useState(2);
    const [scaleFactor, setScaleFactor] = React.useState(1);

    const isToday = React.useCallback((dateToCheck: Date) => {
        const today = new Date();
        return dateToCheck.toDateString() === today.toDateString();
    }, []);

    React.useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const containerWidth = containerRef.current.offsetWidth;
                const totalColumns = Math.ceil((data?.length || 0) / 7) || 1;
                const baseSize = 16;
                const maxBlockSize = 32;

                const availableWidth = containerWidth - 40;
                const calculatedSize = Math.min(
                    maxBlockSize,
                    Math.max(baseSize, Math.floor((availableWidth - (totalColumns * 4)) / totalColumns))
                );
                const newScaleFactor = calculatedSize / baseSize;

                setBlockSize(calculatedSize);
                setBlockMargin(2);
                setScaleFactor(newScaleFactor);
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [data]);

    const exportCalendarData = React.useCallback(() => {
        if (!data) return;

        const csvData = data.map(({ date, stats }) => ({
            date: new Date(date).toLocaleDateString(),
            pnl: stats?.pnl || 0,
            volume: stats?.volume || 0,
            positions: stats?.totalPositions || 0,
            fees: stats?.totalFees || 0
        }));

        const headers = ['Date', 'PNL', 'Volume', 'Positions', 'Fees'];
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => [
                row.date,
                row.pnl,
                row.volume,
                row.positions,
                row.fees
            ].join(','))
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

    if (!data) {
        return (
            <div className={twMerge('bg-[#040D14] border rounded-lg p-3', wrapperClassName)}>
                <div className="flex flex-col sm:flex-row mb-6 pl-3 pr-3 justify-between items-center">
                    <p className="font-boldy text-lg">Daily Trading activity</p>
                    <div className="flex flex-row gap-3 animate-pulse">
                        <div className="h-4 w-20 bg-third/20 rounded" />
                    </div>
                </div>
                <div className="gap-3 mt-4 flex flex-col items-center justify-center">
                    <div ref={containerRef} className="hide-scrollbar w-full flex justify-center">
                        <div className="animate-pulse grid grid-flow-col grid-rows-7" style={{ gap: '2px' }}>
                            {Array(91).fill(0).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-third/20 rounded-sm"
                                    style={{
                                        width: 16,
                                        height: 16
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isMobile) {
        data = data.slice(90);
    }

    const monthsInActivityData = data.reduce((acc, curr) => {
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
                lastDayIndex: -1   // Will store the index of last day in the month
            };
        }
        // Track the first and last occurrence of each month
        const currentIndex = data.indexOf(curr);
        if (acc[key].firstDayIndex === -1) acc[key].firstDayIndex = currentIndex;
        acc[key].lastDayIndex = currentIndex;
        acc[key].count += 1;
        return acc;
    }, {} as {
        [key: string]: {
            month: string;
            count: number;
            year: number;
            rawMonthIndex: number;
            firstDayIndex: number;
            lastDayIndex: number;
        }
    });

    const sortedMonths = Object.entries(monthsInActivityData)
        .sort(([keyA], [keyB]) => {
            const [yearA, monthA] = keyA.split('-').map(Number);
            const [yearB, monthB] = keyB.split('-').map(Number);
            return yearA !== yearB ? yearA - yearB : monthA - monthB;
        })
        .map(([, value], index) => ({
            ...value,
            order: index,
            monthIndex: index
        }));

    return (
        <div className={twMerge('bg-[#040D14] border rounded-lg p-3', wrapperClassName)}>
            <div className="flex flex-col sm:flex-row mb-6 pl-3 pr-3 justify-between items-center">
                <p className="font-boldy text-lg">Daily Trading activity</p>

                <div className="flex flex-row gap-3">
                    <p className='opacity-25'>by: </p>
                    {['pnl', 'volume', 'position count'].map((filter, i) => (
                        <p
                            className={twMerge(
                                'opacity-50 hover:opacity-100 cursor-pointer transition-opacity duration-300 font-regular text-sm',
                                bubbleBy === filter && 'opacity-100 underline',
                            )}
                            onClick={() => setBubbleBy(filter)}
                            key={i}
                        >
                            {filter}
                        </p>
                    ))}
                </div>
            </div>

            <div className="gap-3 mt-4 flex flex-col items-center justify-center">
                <div ref={containerRef} className="hide-scrollbar w-full lg:w-[80%] flex justify-center">
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

                                const cellWidth = blockSize + blockMargin;
                                const position = weekNumber * cellWidth;

                                return (
                                    <div
                                        key={i}
                                        className="absolute text-sm font-boldy opacity-50 z-10 whitespace-nowrap"
                                        style={{
                                            left: `${position}px`,
                                            top: '-24px',
                                            fontSize: '12px'
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
                                columnGap: `${blockMargin}px`,
                                rowGap: `${blockMargin}px`,
                                padding: '1px'  // Add padding to ensure highlights are visible
                            }}
                        >
                            {data.map(({ date, stats }, i) => {
                                if (stats === null) {
                                    return (
                                        <Tippy
                                            content={
                                                <p className="text-xs font-boldy">
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
                                                    isToday(new Date(date)) && 'after:absolute after:inset-[-1px] after:rounded-sm after:border after:border-[#2C3A47] after:z-10'
                                                )}
                                                style={{
                                                    width: blockSize,
                                                    height: blockSize
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
                                                    <p className="text-xs font-boldy">
                                                        {new Date(date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </p>
                                                </div>

                                                <FormatNumber
                                                    nb={stats.totalPositions}
                                                    prefix="positions: "
                                                    prefixClassName={twMerge(
                                                        'font-mono opacity-50',
                                                        bubbleBy === 'position count' && 'text-[#F1C40F] opacity-100'
                                                    )}
                                                />

                                                <div className="flex items-center gap-2">
                                                    <FormatNumber
                                                        nb={stats.pnl}
                                                        prefix="pnl: "
                                                        format="currency"
                                                        prefixClassName={twMerge(
                                                            'font-mono opacity-50',
                                                            bubbleBy === 'pnl' && 'text-[#F1C40F] opacity-100'
                                                        )}
                                                    />
                                                    {stats.pnl !== 0 && (
                                                        <span className={stats.pnl > 0 ? 'text-[#17AC81]' : 'text-[#AB2E42]'}>
                                                            {stats.pnl > 0 ? '↑' : '↓'}
                                                        </span>
                                                    )}
                                                </div>

                                                <FormatNumber
                                                    nb={stats.size}
                                                    prefix="size: "
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
                                                    prefix="volume: "
                                                    format="currency"
                                                    prefixClassName={twMerge(
                                                        'font-mono opacity-50',
                                                        bubbleBy === 'volume' && 'text-[#F1C40F] opacity-100'
                                                    )}
                                                />
                                                <FormatNumber
                                                    nb={stats.totalFees}
                                                    prefix="fees: "
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
                                                    prefix="winrate: "
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
                                                isToday(new Date(date)) && 'after:absolute after:inset-[-1px] after:rounded-sm after:border after:border-[#2C3A47] after:z-10'
                                            )}
                                            style={{
                                                width: blockSize,
                                                height: blockSize
                                            }}
                                            onClick={() => {
                                                if (isUserActivity) return;
                                                const startDate = new Date(date);
                                                const endDate = startDate.setHours(
                                                    startDate.getHours() + 24,
                                                );
                                                setSelectedRange?.('Custom');
                                                setStartDate?.(new Date(date).toISOString());
                                                setEndDate?.(new Date(endDate).toISOString());
                                            }}
                                        >
                                            <svg height="100%" width="100%">
                                                <motion.circle
                                                    cx="50%"
                                                    cy="50%"
                                                    initial={{ r: 0 }}
                                                    animate={{
                                                        r: Math.min((stats.bubbleSize * scaleFactor) / 2, blockSize / 2)
                                                    }}
                                                    transition={{ duration: 0.3 }}
                                                    fill={stats.color}
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
                                <p className="font-mono text-gray-500">pnl</p>
                                <div className="flex flex-row items-center gap-1">
                                    {[
                                        { color: '#AB2E42', label: 'Loss' },
                                        { color: '#BD773E', label: 'Below Avg' },
                                        { color: '#17AC81', label: 'Above Avg' }
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
                                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors duration-300 flex items-center gap-1"
                                >
                                    Export CSV
                                    <svg className="w-3 h-3 translate-y-[-0.35em]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a2 2 0 002 2h14a2 2 0 002-2v-3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
