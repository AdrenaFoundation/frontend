import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import Button from '../Button/Button';
import Menu from '../Menu/Menu';

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
        className={twMerge(
          'flex',
          'justify-center',
          'items-center',
          'cursor-pointer',
          'h-4',
          'whitespace-nowrap',
          'hover:opacity-90',
        )}
        onClick={() => setOpened(!opened)}
      >
        <span>{selected}</span>
        {options.length > 1 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-6 w-6"
            src="/images/chevron-down.svg"
            alt="chevron down"
          />
        ) : null}
      </div>

      <Menu
        className="right-1 mt-2"
        open={opened}
        onClose={() => {
          setOpened(false);
        }}
      >
        {options
          .filter((option) => option !== selected)
          .map((option) => (
            <Button
              className="whitespace-nowrap text-md text-txtfade hover:text-white mt-1 border-0 p-0"
              title={option}
              onClick={() => {
                onSelect(option);
                setOpened(false);
              }}
              key={option}
            />
          ))}
      </Menu>
    </div>
  );
}
