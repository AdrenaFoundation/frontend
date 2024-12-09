import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ImageRef } from '@/types';

export default function Filter({
    options,
    activeFilter,
    setFilter,
    iconClassName,
}: {
    options: { name: string; icon?: ImageRef }[];
    activeFilter: string;
    setFilter: (filter: string) => void;
    iconClassName?: string;
}) {
    return (
        <ul className="flex flex-row gap-2 items-center border border-bcolor rounded-lg p-2 bg-main flex-1">
            {options.map((option) => (
                <li
                    className={twMerge(
                        'text-sm font-mono w-full text-center border border-bcolor rounded-lg p-1 px-4 text-txtfade bg-transparent hover:bg-third hover:text-white cursor-pointer transition duration-300 select-none capitalize',
                        option.name === activeFilter
                            ? 'text-white bg-third border-white'
                            : '',
                        option?.icon && 'flex flex-row items-center justify-center gap-2',
                        (option.name === 'profit' || option.name === 'long') &&
                        'text-green',
                        (option.name === 'loss' || option.name === 'short') && 'text-red',
                    )}
                    key={option.name}
                    onClick={() => setFilter(option.name)}
                >
                    {option?.icon ? (
                        <Image
                            src={option.icon}
                            alt={'icon'}
                            width="12"
                            height="12"
                            className={iconClassName}
                        />
                    ) : null}

                    {option.name}
                </li>
            ))}
        </ul>
    );
}
