import Tippy from '@tippyjs/react';
import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function OverviewVisualized({
    headers,
    data,
    setStartDate,
    setEndDate,
}: {
    headers: string[];
    data: {
        day: 'mon' | 'tue' | 'wed' | 'thu' | 'fri';
        stats: { total: number; color: string; date: string }[];
    }[];
    setEndDate: any;
    setStartDate: any;
}) {
    console.log(data);
    return (
        <div>
            <table className="w-full table-fixed border-collapse">
                <thead>
                    {/* <tr className="px-4 text-left w-full font-boldy">
                        {headers.map((header, index) => (
                            <th key={index} className="text-sm col-span-4 text-gray-600" colSpan={index === 0 ? "" : index === 1 ? "1" : "4"}>
                                {header}
                            </th>
                        ))}
                    </tr> */}
                </thead>
                <tbody>
                    {data.map((row, index) => (
                        <tr key={index} className="p-2">
                            {/* <td className="relative text-sm text-right capitalize font-boldy text-gray-600">
                                {row.day}
                            </td> */}
                            {row.stats.map((stat, index) => (
                                <td className="p-1 table-cell">
                                    <Tippy
                                        content={
                                            <p className="text-sm font-mono">
                                                {stat.total} positions opened on{' '}
                                                {new Date(stat.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </p>
                                        }
                                    >
                                        <div
                                            key={index}
                                            className={twMerge(
                                                'rounded-md border border-transparent hover:border-white/50 transition duration-300 p-1 px-2 cursor-pointer',
                                                stat.color,
                                            )}
                                            onClick={() => {
                                                const startDate = new Date(stat.date);
                                                const endDate = startDate.setHours(
                                                    startDate.getHours() + 24,
                                                );
                                                setStartDate(new Date(stat.date).toISOString());
                                                setEndDate(new Date(endDate).toISOString());
                                            }}
                                        >
                                            <div className='flex flex-row justify-between'>
                                                <p className="text-xs font-boldy opacity-50">
                                                    {new Date(stat.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </p>
                                                <p className='text-xs font-mono'>{stat.total}</p>
                                            </div>
                                        </div>
                                    </Tippy>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex flex-row gap-2 items-center justify-center mt-3">
                <p className="font-mono text-gray-500">less</p>
                <div className="flex flex-row items-center gap-1">
                    {[
                        'bg-third',
                        'bg-[#0D4429]',
                        'bg-[#016D32]',
                        'bg-[#34AA49]',
                        'bg-[#3AD353]',
                    ].map((bg, i) => (
                        <div key={i} className={twMerge('h-2 w-2 rounded-sm', bg)}></div>
                    ))}
                </div>
                <p className="font-mono text-gray-500">more</p>
            </div>
        </div>
    );
}
