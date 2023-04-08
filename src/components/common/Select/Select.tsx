import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

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
        {
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="h-6 w-6"
            src="/images/chevron-down.svg"
            alt="chevron down"
          />
        }
      </div>

      <div
        className={twMerge(
          'flex-col',
          'absolute',
          'top-8',
          'right-0',
          'bg-secondary',
          'border',
          'border-grey',
          'z-[2]',
          opened ? 'flex' : 'hidden',
        )}
      >
        {options
          .filter((option) => option !== selected)
          .map((option) => (
            <div
              className={twMerge(
                'pt-2',
                'pb-2',
                'pl-4',
                'pr-4',
                'cursor-pointer',
                'flex',
                'items-center',
                'justify-center',
                'whitespace-nowrap',
                'border-b',
                'border-grey',
                'hover:opacity-90',
              )}
              onClick={() => {
                onSelect(option);
                setOpened(false);
              }}
              key={option}
            >
              {option}
            </div>
          ))}
      </div>
    </div>
  );
}
