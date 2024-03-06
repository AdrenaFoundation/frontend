import Image from 'next/image';
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

  return (
    <div className={className}>
      <Menu
        trigger={
          <div className="flex justify-center items-center cursor-pointer whitespace-nowrap hover:opacity-90 shadow-xl overflow-hidden relative h-full w-full">
            <div
              className={twMerge(
                'flex flex-row gap-1 items-center',
                selectedClassName,
              )}
            >
              {selectedImg ? (
                <Image
                  src={selectedImg}
                  className="absolute top-auto left-[-15px] opacity-[15%] grayscale"
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
        openMenuClassName="right-1 mt-2 w-fit"
      >
        {options.length > 1 && (
          <MenuItems className="w-[120px] justify-center border-2 border-[#ffffff20]">
            {options
              .filter((option) => option.title !== selected)
              .map((option, i) => (
                <>
                  {!!i && <MenuSeperator key={'sep' + option.title} />}

                  <MenuItem
                    className="flex flex-row items-center justify-end text-center text-lg relative overflow-hidden"
                    onClick={() => {
                      onSelect(option.title);
                    }}
                    key={option.title + i}
                  >
                    {option?.img ? (
                      <Image
                        src={option.img}
                        className="absolute top-auto left-[-15px] opacity-20 z-10"
                        alt="logo"
                        width="80"
                        height="80"
                      />
                    ) : null}
                    <span className="font-semibold z-20">{option.title}</span>
                  </MenuItem>
                </>
              ))}
          </MenuItems>
        )}
      </Menu>
    </div>
  );
}
