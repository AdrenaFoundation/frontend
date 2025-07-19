import React from 'react';
import { twMerge } from 'tailwind-merge';

export default function SelectOptions<T>({
  title,
  selected,
  options,
  onClick,
}: {
  title?: string;
  selected: T;
  options: T[];
  onClick: (option: T) => void;
}) {
  return (
    <div className="flex gap-4 w-full items-center justify-evenly border py-1 px-2 rounded-lg">
      {title && (
        <p className="text-xs font-mono opacity-30 border-r border-bcolor pr-2">
          {title}
        </p>
      )}
      {options.map((option, index) => (
        <div
          className={twMerge(
            'text-sm font-boldy cursor-pointer opacity-50 hover:opacity-100 transition duration-300',
            selected === option && 'opacity-100',
          )}
          onClick={() => onClick(option)}
          key={index}
        >
          {String(option)}
        </div>
      ))}
    </div>
  );
}
