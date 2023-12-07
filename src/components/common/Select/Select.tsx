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
  const img = window.adrena.client.tokens.find(
    (token) => token.symbol === selected,
  )?.image;

  return (
    <div className={className}>
      <Menu
        trigger={
          <div className="flex justify-center items-center cursor-pointer h-4 whitespace-nowrap hover:opacity-90 shadow-xl">
            <div className="flex flex-row gap-1 items-center">
              {img ? (
                <Image src={img} alt="logo" width="16" height="16" />
              ) : null}
              <span className="text-lg font-medium">{selected}</span>
            </div>
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
        <MenuItems className="w-[120px] justify-center">
          {options
            .filter((option) => option !== selected)
            .map((option, i) => (
              <>
                {!!i && <MenuSeperator key={'sep' + option} />}
                <MenuItem
                  className="flex flex-row gap-1 items-center text-center text-lg"
                  onClick={() => {
                    onSelect(option);
                  }}
                  key={option}
                >
                  {img ? (
                    <Image src={img} alt="logo" width="16" height="16" />
                  ) : null}
                  {option}
                </MenuItem>
              </>
            ))}
        </MenuItems>
      </Menu>
    </div>
  );
}
