import Tippy from '@tippyjs/react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';

import clandarIcon from '@/../public/images/Icons/calendar.svg';
import Filter from '@/components/Filter/Filter';
import FormatNumber from '@/components/Number/FormatNumber';

export default function ActivityCalendar({
    data,
    setStartDate,
    setEndDate,
    bubbleBy,
    setBubbleBy,
    setSelectedRange,
    wrapperClassName,
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
}) {
    const scrollableDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollableDivRef.current) {
            scrollableDivRef.current.scrollLeft = scrollableDivRef.current.scrollWidth;
        }
    }, []);

    if (!data) {
        return null;
    }


    const monthsInActivityData = data.reduce((acc, curr) => {
        if (curr === null) {
            return acc;
        }
        const month = new Date(curr.date).toLocaleString('default', {
            month: 'short',
        });
        if (!acc.includes(month)) {
            acc.push(month);
        }
        return acc;
    }, [] as string[]);

    const daysCountByMonth = data.reduce((acc, curr) => {
        if (curr === null) {
            return acc;
        }
        const month = new Date(curr.date).getMonth();
        acc[month] = (acc[month] || 0) + 1;
        return acc;
    }, [] as number[]);

    return (
        <div className={twMerge("bg-[#040D14] border rounded-lg p-3", wrapperClassName)}>
            <Filter
                options={[
                    { name: 'Pnl' },
                    { name: 'Volume' },
                    { name: 'Position Count' },
                ]}
                activeFilter={bubbleBy}
                setFilter={setBubbleBy}
                className="flex-col sm:flex-row bg-transparent border-transparent p-0"
            />
            <div className=" gap-3 mt-4 flex items-center justify-center">
                <div className="hide-scrollbar overflow-auto" ref={scrollableDivRef}>
                    <div className="relative flex flex-row mt-4">
                        {monthsInActivityData.map((month, i) => {
                            const initSize = daysCountByMonth[i] / 7;
                            const blockMargin = 4;
                            const blockSize = 16;
                            const nbOfBlocksToSkip = initSize * (blockSize + blockMargin);

                            return (
                                <div
                                    key={i}
                                    className="absolute -top-5 text-sm text-gray-600 z-10"
                                    style={{ left: i * nbOfBlocksToSkip }}
                                >
                                    {month}
                                </div>
                            );
                        })}
                    </div>
                    <div className="relative grid w-fit grid-flow-col grid-rows-7 gap-1 overflow-auto">
                        {data.map(({ date, stats }, i) => {
                            if (stats === null) {
                                return (
                                    <div
                                        key={i}
                                        className="bg-third hover:bg-secondary border-b-2 border-r-2 border-[#040D14]  size-4 transition duration-300"
                                    />
                                );
                            }
                            return (
                                <Tippy
                                    content={
                                        <div className="flex flex-col gap-1">
                                            <div className="flex flex-row gap-1 items-center mb-1">
                                                <Image
                                                    src={clandarIcon}
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
                                                nb={stats.increaseSize}
                                                prefix="increase size: "
                                                format="currency"
                                                prefixClassName={twMerge(
                                                    'font-mono opacity-50',
                                                    bubbleBy === 'Increase size'
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
                                            'flex items-center justify-center bg-third hover:bg-secondary border-b-2 border-r-2 border-[#040D14] cursor-pointer group size-4 transition duration-300',
                                        )}
                                        onClick={() => {
                                            const startDate = new Date(date);
                                            const endDate = startDate.setHours(
                                                startDate.getHours() + 24,
                                            );
                                            setSelectedRange?.('Custom');
                                            setStartDate?.(new Date(date).toISOString());
                                            setEndDate?.(new Date(endDate).toISOString());
                                        }}
                                    >
                                        <motion.div
                                            className="m-auto rounded-full flex-none"
                                            animate={{
                                                width: stats.bubbleSize,
                                                height: stats.bubbleSize,
                                                backgroundColor: stats.color,
                                            }}
                                        />
                                    </div>
                                </Tippy>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between">
                <div className="flex flex-row gap-2 items-center justify-center mt-3">
                    <p className="font-mono text-gray-500">{bubbleBy}: </p>
                    <div className="flex flex-row items-center gap-1">
                        {[
                            'bg-gray-500',
                            'bg-gray-500',
                            'bg-gray-500',
                            'bg-gray-500',
                            'bg-gray-500',
                        ].map((bg, i) => (
                            <div
                                key={i}
                                className={twMerge('h-2 w-2 rounded-full', bg)}
                                style={{
                                    width: `${i + 5}px`,
                                    height: `${i + 5}px`,
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-row gap-2 items-center justify-center mt-3">
                    <p className="font-mono text-gray-500">pnl: less </p>
                    <div className="flex flex-row items-center gap-1">
                        {['bg-[#AB2E42]', 'bg-[#BD773E]', 'bg-[#17AC81]'].map((bg, i) => (
                            <div key={i} className={twMerge('h-2 w-2 rounded-sm', bg)}></div>
                        ))}
                    </div>
                    <p className="font-mono text-gray-500">more</p>
                </div>
            </div>
        </div>
    );
}
