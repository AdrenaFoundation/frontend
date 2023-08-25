import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

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
  options: T[];
  onSelect: (opt: T) => void;
}) {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <div className={twMerge('relative', className)}>
      <div
        className="flex justify-center items-center cursor-pointer h-4 whitespace-nowrap hover:opacity-90"
        onClick={() => setOpened(!opened)}
      >
        <span className="text-lg font-medium">{selected}</span>
        {options.length > 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="ml-2 h-3 w-3"
            src="/images/icons/chevron-down.svg"
            alt="chevron down"
          />
        ) : null}
      </div>

      <Menu
        className="right-1 mt-2 w-fit"
        open={opened}
        onClose={() => {
          setOpened(false);
        }}
      >
        <MenuItems>
          {options
            .filter((option) => option !== selected)
            .map((option, i) => (
              <>
                {!!i && <MenuSeperator key={'sep' + option} />}
                <MenuItem
                  className="text-center text-lg"
                  onClick={() => {
                    onSelect(option);
                    setOpened(false);
                  }}
                  key={option}
                >
                  {option}
                </MenuItem>
              </>
            ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
