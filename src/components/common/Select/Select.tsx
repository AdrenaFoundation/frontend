import Image from 'next/image';
import { useState } from 'react';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { ImageRef } from '@/types';

import chevronDownIcon from '../../../../public/images/Icons/chevron-down.svg';
import Menu from '../Menu/Menu';
import MenuItem from '../Menu/MenuItem';
import MenuItems from '../Menu/MenuItems';
import MenuSeparator from '../Menu/MenuSeparator';

export default function Select<T extends string>({
  className,
  selected,
  selectedClassName,
  menuClassName,
  menuOpenBorderClassName,
  options,
  onSelect,
  reversed,
}: {
  className?: string;
  selectedClassName?: string;
  menuClassName?: string;
  menuOpenBorderClassName?: string;
  selected: T;
  options: { title: T; img?: ImageRef }[];
  onSelect: (opt: T) => void;

  // Reverse the image position
  reversed?: boolean;
}) {
  const selectedImg = options.find((option) => option.title === selected)?.img;

  // Option hovering on
  const [optionHover, setOptionHover] = useState<number | null>(null);

  const img = selectedImg ? (
    <Image
      src={selectedImg}
      className="mr-1 ml-1"
      alt="logo"
      width="20"
      height="20"
    />
  ) : null;

  const chevron =
    options.length > 1 ? (
      <div className="flex h-2 w-2 items-center justify-center shrink-0 mr-1 ml-1">
        <Image src={chevronDownIcon} alt="chevron down" />
      </div>
    ) : null;

  return (
    <div className={className}>
      <Menu
        disabled={options.length <= 1}
        withBorder={true}
        trigger={
          <div
            className={twMerge(
              'flex items-center whitespace-nowrap hover:opacity-90 shadow-xl overflow-hidden relative h-full w-full',
              options.length > 1 ? 'cursor-pointer' : '',
              menuClassName,
            )}
          >
            <div
              className={twMerge(
                'flex flex-row gap-1 items-center',
                selectedClassName,
              )}
            >
              {reversed ? img : chevron}

              <span className="text-lg font-special z-20 m-auto">
                {selected}
              </span>

              {reversed ? chevron : img}
            </div>
          </div>
        }
        className="h-full w-full"
        menuOpenBorderClassName={menuOpenBorderClassName}
        openMenuClassName="w-full"
      >
        {options.length > 1 && (
          <MenuItems className="w-[8em] justify-center">
            {options
              .filter((option) => option.title !== selected)
              .map((option, i) => (
                // Use Fragment to avoid key error
                <React.Fragment key={'container' + option.title}>
                  {!!i && <MenuSeparator key={'sep' + option.title} />}

                  <MenuItem
                    className="flex flex-row items-center justify-end text-center relative overflow-hidden h-14"
                    onMouseEnter={() => setOptionHover(i)}
                    onMouseLeave={() => setOptionHover(null)}
                    onClick={() => {
                      onSelect(option.title);
                    }}
                    key={option.title + i}
                  >
                    {option?.img ? (
                      <Image
                        src={option.img}
                        className={twMerge(
                          'absolute top-auto left-[-32px] z-10 grayscale',
                          optionHover === i
                            ? 'opacity-60 grayscale-0'
                            : 'opacity-20',
                        )}
                        alt="logo"
                        width="80"
                        height="80"
                      />
                    ) : null}

                    <span className="font-special text-lg z-20 m-auto">
                      {option.title}
                    </span>
                  </MenuItem>
                </React.Fragment>
              ))}
          </MenuItems>
        )}
      </Menu>
    </div>
  );
}
