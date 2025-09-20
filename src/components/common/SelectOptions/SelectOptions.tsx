import React from 'react';
import { twMerge } from 'tailwind-merge';

type OptionType<T> = T | { title: T; activeColor?: string; disabled?: boolean };

export default function SelectOptions<T>({
  title,
  selected,
  options,
  onClick,
  className,
  textClassName,
}: {
  title?: string;
  selected: T;
  options: OptionType<T>[];
  onClick: (option: T) => void;
  className?: string;
  textClassName?: string;
}) {
  const isObject = (option: OptionType<T>): option is { title: T } =>
    typeof option === 'object' && option !== null && 'title' in option;

  return (
    <div
      className={twMerge(
        'flex gap-4 w-full items-center justify-evenly border py-1 px-2 rounded-lg',
        className,
      )}
    >
      {title && (
        <p className="text-xs font-mono opacity-30 border-r border-bcolor pr-2">
          {title}
        </p>
      )}
      {options.map((option, index) => (
        <div
          className={twMerge(
            'text-sm font-medium cursor-pointer opacity-50 hover:opacity-100 transition duration-300',
            selected === (isObject(option) ? option.title : (option as T)) &&
            'opacity-100',
            isObject(option) && option.activeColor,
            isObject(option) &&
            option.disabled &&
            'opacity-30 cursor-not-allowed hover:opacity-30',
            textClassName,
          )}
          onClick={() => {
            if (isObject(option) && option.disabled) return;

            onClick(isObject(option) ? option.title : (option as T));
          }}
          key={index}
        >
          {String(isObject(option) ? option.title : (option as T))}
        </div>
      ))}
    </div>
  );
}
