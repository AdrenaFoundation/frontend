import Image from 'next/image';

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
  options: T[];
  onSelect: (opt: T) => void;
}) {
  return (
    <div className={className}>
      <Menu
        trigger={
          <div className="flex justify-center items-center cursor-pointer h-4 whitespace-nowrap hover:opacity-90">
            <span className="text-lg font-medium">{selected}</span>
            {options.length > 1 ? (
              <Image
                className="ml-2"
                src={chevronDownIcon}
                alt="chevron down"
                width={12}
                height={12}
              />
            ) : null}
          </div>
        }
        className="right-1 mt-2 w-fit"
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
