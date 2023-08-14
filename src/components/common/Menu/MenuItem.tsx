import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function MenuItem({
  className,
  children,
  onClick,
  selected,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <li
      className={twMerge(
        'text-sm font-normal p-1 hover:bg-gray-200 duration-300 cursor-pointer px-3 opacity-50 hover:opacity-100 w-full whitespace-nowrap',
        selected && 'bg-gray-200 opacity-100',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </li>
  );
}
