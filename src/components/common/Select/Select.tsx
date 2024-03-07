import Image from 'next/image';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { ImageRef } from '@/types';

import chevronDownIcon from '../../../../public/images/Icons/chevron-down.svg';
import Menu from '../Menu/Menu';
import MenuItem from '../Menu/MenuItem';
import MenuItems from '../Menu/MenuItems';
import MenuSeperator from '../Menu/MenuSeperator';

export default function Select<T extends string>({
  className,
  selected,
  selectedClassName,
  options,
  onSelect,
}: {
  className?: string;
  selectedClassName?: string;
  selected: T;
  options: { title: T; img?: ImageRef }[];
  onSelect: (opt: T) => void;
}) {
  const selectedImg = options.find((option) => option.title === selected)?.img;

  // Option hovering on
  const [optionHover, setOptionHover] = useState<number | null>(null);

  return (
    <div className={className}>
      <Menu
        disabled={options.length <= 1}
        withBorder={true}
        trigger={
          <div
            className={twMerge(
              'flex justify-center items-center whitespace-nowrap hover:opacity-90 shadow-xl overflow-hidden relative h-full w-full',
              options.length > 1 ? 'cursor-pointer' : '',
            )}
          >
            <div
              className={twMerge(
                'flex flex-row gap-1 items-center',
                selectedClassName,
              )}
            >
              {selectedImg ? (
                <Image
                  src={selectedImg}
                  className="absolute top-auto left-[-32px] opacity-[15%] grayscale"
                  alt="logo"
                  width="80"
                  height="80"
                />
              ) : null}

              <span className="text-base font-semibold z-20 m-auto pl-2">
                {selected}
              </span>
            </div>

            {options.length > 1 ? (
              <div className="flex bg-gray-200 rounded-full p-1 h-5 w-5 items-center justify-center ml-2">
                <Image src={chevronDownIcon} alt="chevron down" />
              </div>
            ) : null}
          </div>
        }
        className="h-full w-full"
        openMenuClassName="w-full"
      >
        {options.length > 1 && (
          <MenuItems className="w-[8em] justify-center">
            {options
              .filter((option) => option.title !== selected)
              .map((option, i) => (
                <>
                  {!!i && <MenuSeperator key={'sep' + option.title} />}

                  <MenuItem
                    className="flex flex-row items-center justify-end text-center relative overflow-hidden h-14 grayscale hover:grayscale-0"
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
                          'absolute top-auto left-[-32px] z-10',
                          optionHover === i ? 'opacity-60' : 'opacity-20',
                        )}
                        alt="logo"
                        width="80"
                        height="80"
                      />
                    ) : null}
                    <span className="font-semibold z-20 m-auto text-base">
                      {option.title}
                    </span>
                  </MenuItem>
                </>
              ))}
          </MenuItems>
        )}
      </Menu>
    </div>
  );
}
