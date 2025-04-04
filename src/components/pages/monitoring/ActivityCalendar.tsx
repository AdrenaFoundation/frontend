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

    if (!data) {
        return null;
    }

    if (isMobile) {
        data = data.slice(80);
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

    // Convert to array and sort chronologically
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

    console.log(sortedMonths);

    return (
        <div
            className={twMerge(
                'bg-[#040D14] border rounded-lg p-3',
                wrapperClassName,
            )}
        >
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
                <div className="hide-scrollbar overflow-auto">
                    <div className="relative flex flex-row mt-4">
                        {sortedMonths.map((monthData, i) => {
                            const blockMargin = 4;
                            const blockSize = 16;
                            const columnWidth = blockSize + blockMargin;

                            // Calculate position based on the first day's column in the grid
                            let startColumn = Math.floor(monthData.firstDayIndex / 7);

                            // Special case for first month overlap
                            if (i === 1 && sortedMonths[0]) {
                                const firstMonth = sortedMonths[0];
                                const firstMonthLastColumn = Math.floor(firstMonth.lastDayIndex / 7);
                                if (startColumn === firstMonthLastColumn) {
                                    startColumn += 1.3; // Shift second month if it overlaps with first month
                                }
                            }

                            const position = startColumn * columnWidth;

                            return (
                                <div
                                    key={i}
                                    className="absolute -top-5 text-sm font-boldy opacity-50 z-10 whitespace-nowrap"
                                    style={{
                                        left: position,
                                        transform: i === 0 ? 'translateX(0)' : 'translateX(-15%)'
                                    }}
                                >
                                    {monthData.month}
                                </div>
                            );
                        })}
                    </div>
                    <div className="relative grid w-fit grid-flow-col grid-rows-7 gap-1 overflow-auto">
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
                                            className="bg-third hover:bg-secondary rounded-sm size-4 transition duration-300"
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
                                                    bubbleBy === 'Position Count'
                                                        ? 'text-[#F1C40F] opacity-100'
                                                        : '',
                                                )}
                                            />

                                            <FormatNumber
                                                nb={stats.pnl}
                                                prefix="pnl: "
                                                format="currency"
                                                prefixClassName={twMerge(
                                                    'font-mono opacity-50',
                                                    bubbleBy === 'Pnl'
                                                        ? 'text-[#F1C40F] opacity-100'
                                                        : '',
                                                )}
                                            />
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
                                                    bubbleBy === 'Volume'
                                                        ? 'text-[#F1C40F] opacity-100'
                                                        : '',
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
                                        </div>
                                    }
                                    key={'cell-' + i}
                                >
                                    <div
                                        className={twMerge(
                                            'flex items-center justify-center bg-third hover:bg-secondary rounded-sm cursor-pointer size-4 transition duration-300',
                                        )}
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
                                                    r: Math.min(stats.bubbleSize / 2, 6)
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

                    <div className="flex flex-row gap-2 items-center justify-center mt-3">
                        <p className="font-mono text-gray-500">pnl</p>
                        <div className="flex flex-row items-center gap-1">
                            {['bg-[#AB2E42]', 'bg-[#BD773E]', 'bg-[#17AC81]'].map((bg, i) => (
                                <div
                                    key={i}
                                    className={twMerge('h-2 w-2 rounded-sm', bg)}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
