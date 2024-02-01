import Image from 'next/image';

import { ImageRef } from '@/types';

import chevronDownIcon from '../../../../public/images/Icons/chevron-down.svg';
import Menu from '../Menu/Menu';
import MenuItem from '../Menu/MenuItem';
import MenuItems from '../Menu/MenuItems';
import MenuSeperator from '../Menu/MenuSeperator';

export default function Select<T extends string>({
  className,
  selected,
  options,
  onSelect,
}: {
  className?: string;
  selected: T;
  options: { title: T; img?: ImageRef }[];
  onSelect: (opt: T) => void;
}) {
  const selectedImg = options.find((option) => option.title === selected)?.img;

  return (
    <div className={className}>
      <Menu
        trigger={
          <div className="flex justify-center items-center cursor-pointer h-4 whitespace-nowrap hover:opacity-90 shadow-xl">
            <div className="flex flex-row gap-1 items-center">
              {selectedImg ? (
                <Image src={selectedImg} alt="logo" width="16" height="16" />
              ) : null}
              <span className="text-lg font-medium">{selected}</span>
            </div>

            {options.length > 1 ? (
              <div className="flex bg-gray-200 rounded-full p-1 h-5 w-5 items-center justify-center ml-2">
                <Image src={chevronDownIcon} alt="chevron down" />
              </div>
            ) : null}
          </div>
        }
        className="right-1 mt-2 w-fit"
      >
        <MenuItems className="w-[120px] justify-center">
          {options
            .filter((option) => option.title !== selected)
            .map((option, i) => (
              <>
                {!!i && <MenuSeperator key={'sep' + option.title} />}
                <MenuItem
                  className="flex flex-row gap-1 items-center text-center text-lg"
                  onClick={() => {
                    onSelect(option.title);
                  }}
                  key={option.title + i}
                >
                  {option?.img ? (
                    <Image src={option.img} alt="logo" width="16" height="16" />
                  ) : null}
                  {option.title}
                </MenuItem>
              </>
            ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
