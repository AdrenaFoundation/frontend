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
  selectedTextClassName,
  menuClassName,
  menuOpenBorderClassName,
  menuItemClassName,
  menuTextClassName,
  options,
  onSelect,
  reversed,
  align = 'right',
}: {
  className?: string;
  selectedClassName?: string;
  selectedTextClassName?: string;
  menuClassName?: string;
  menuOpenBorderClassName?: string;
  menuItemClassName?: string;
  menuTextClassName?: string;
  selected: T;
  options: { title: T; img?: ImageRef | string; disabled?: boolean }[];
  onSelect: (opt: T) => void;

  // Reverse the image position
  reversed?: boolean;
  align?: 'right' | 'left';
}) {
  const selectedImg = options.find((option) => option.title === selected)?.img;

  // Option hovering on
  const [optionHover, setOptionHover] = useState<number | null>(null);

  const img = selectedImg ? typeof selectedImg === "string" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={selectedImg} className="w-[20px] h-[20px]" alt="logo" />
  ) : <Image src={selectedImg} className="w-[20px] h-[20px]" alt="logo" /> : null;

  const chevron =
    options.length > 1 ? (
      <div className="flex h-2 w-2 items-center justify-center shrink-0 mr-1 ml-1">
        <Image src={chevronDownIcon} alt="chevron down" />
      </div>
    ) : null;

  return (
    <div className={twMerge('select-none', className)}>
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
                'flex flex-row gap-x-1 items-center',
                options.length > 1 && !reversed && 'w-full pr-3',
                align === 'right' && 'justify-between',
                options.length > 1 && reversed && 'w-full justify-between',
                selectedClassName,
              )}
            >
              {reversed ? (
                <>
                  <div className="flex flex-row gap-2 items-center">
                    {img}
                    <span className={twMerge("text-lg font-boldy z-20 m-auto select-none", selectedTextClassName)}>
                      {selected}
                    </span>
                  </div>
                  {chevron}
                </>
              ) : (
                <>
                  {chevron}
                  <div className="flex flex-row gap-2 items-center">
                    <span className={twMerge("text-lg font-boldy z-20 m-auto select-none", selectedTextClassName)}>
                      {selected}
                    </span>
                    {img}
                  </div>
                </>
              )}
            </div>
          </div>
        }
        className="h-full w-full"
        menuOpenBorderClassName={menuOpenBorderClassName}
        openMenuClassName="w-full"
      >
        {options.length > 1 && (
          <MenuItems className="w-full justify-center">
            {options
              .filter((option) => option.title !== selected)
              .map((option, i) => (
                // Use Fragment to avoid key error
                <React.Fragment key={'container' + option.title}>
                  {!!i && <MenuSeparator key={'sep' + option.title} />}

                  <MenuItem
                    disabled={option.disabled}
                    className={twMerge("flex flex-row items-center relative overflow-hidden h-14", menuItemClassName, option?.img ? "justify-end" : "justify-center")}
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

                    <span className={twMerge("font-boldy text-lg z-20", menuTextClassName)}>
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
