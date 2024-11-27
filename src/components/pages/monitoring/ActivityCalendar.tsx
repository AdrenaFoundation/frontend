import Tippy from '@tippyjs/react';
import Image from 'next/image';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import clandarIcon from '@/../public/images/Icons/calendar.svg'
import FormatNumber from '@/components/Number/FormatNumber';

export default function ActivityCalendar({
    headers,
    data,
    setStartDate,
    setEndDate,
}: {
    headers: string[];
    data: {
        [key: string]: ({
            total: number;
            color: string;
            size: number;
            date: Date;
            pnl: number;
            volume: number;
        } | null)[];
    }
    setEndDate: any;
    setStartDate: any;
}) {
    return (
        <div className="m-auto  max-w-[1500px] overflow-y-auto">
            <table className="w-full min-w-[1000px] table-fixed">
                <thead>
                    <tr className="text-left font-boldy">
                        <td></td>
                        {headers.map((header, i) => (
                            <th
                                key={i}
                                className="text-sm col-span-4 text-gray-600"
                                colSpan={i % 2 === 0 ? 4 : 5}
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).map((key) => (
                        <tr key={key} className="p-2">


                            <td className="relative table-cell text-sm text-right capitalize font-boldy text-gray-600 p-[3px] w-[15px] h-[15px] lg:w-[20px] lg:h-[20px]">
                                {key}
                            </td>

                            {data[key].map((stat, i) => {
                                if (stat === null) {
                                    return (
                                        <td
                                            key={i}
                                            className="bg-[#040D14] hover:bg-third border-b-2 border-r-2 border-[#061018] table-cell p-[3px] w-[15px] h-[15px]lg:w-[20px] lg:h-[20px] transition duration-300"
                                        ></td>
                                    );
                                }

                                return (
                                    <Tippy
                                        content={
                                            <div className="flex flex-col gap-1">
                                                <div className='flex flex-row gap-1 items-center mb-1'>
                                                    <Image src={clandarIcon} alt="calendar" width={10} height={10} />
                                                    <p className="text-xs font-boldy">
                                                        {new Date(stat.date).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            day: 'numeric',
                                                            month: 'short',
                                                        })}
                                                    </p>
                                                </div>

                                                <FormatNumber
                                                    nb={stat.pnl}
                                                    prefix="pnl: "
                                                    prefixClassName="font-mono opacity-50"
                                                />
                                                <FormatNumber
                                                    nb={stat.volume}
                                                    prefix="volume: "
                                                    prefixClassName="font-mono opacity-50"
                                                />
                                                <FormatNumber
                                                    nb={stat.total}
                                                    prefix="positions: "
                                                    prefixClassName="font-mono opacity-50"
                                                />
                                            </div>
                                        }
                                        key={'cell-' + i}
                                    >
                                        <td
                                            className={
                                                'bg-[#040D14] hover:bg-third border-b-2 border-r-2 border-[#061018] cursor-pointer group table-cell p-[3px] w-[15px] h-[15px]lg:w-[20px] lg:h-[20px] transition duration-300'
                                            }
                                            onClick={() => {
                                                const startDate = new Date(stat.date);
                                                const endDate = startDate.setHours(
                                                    startDate.getHours() + 24,
                                                );
                                                setStartDate(new Date(stat.date).toISOString());
                                                setEndDate(new Date(endDate).toISOString());
                                            }}
                                        >
                                            <div
                                                className={twMerge(
                                                    'rounded-full border border-transparent group-hover:border-white/50 transition duration-300 flex-none m-auto',
                                                    stat.color,
                                                )}
                                                style={{ width: `${stat.size}px`, height: `${stat.size}px` }}

                                            />
                                        </td>
                                    </Tippy>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex flex-row justify-between">
                <div className="flex flex-row gap-2 items-center justify-center mt-3">
                    <p className="font-mono text-gray-500">volume: </p>
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
                        {[
                            'bg-[#AB2E42]',
                            'bg-[#BD773E]',
                            'bg-[#17AC81]',
                        ].map((bg, i) => (
                            <div key={i} className={twMerge('h-2 w-2 rounded-sm', bg)}></div>
                        ))}
                    </div>
                    <p className="font-mono text-gray-500">more</p>
                </div>
            </div>
        </div>
    );
}
