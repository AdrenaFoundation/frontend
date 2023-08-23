import Link from 'next/link';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function MenuItem({
  className,
  children,
  onClick,
  selected,
  href,
  target,
}: {
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  href?: string;
  target?: string;
}) {
  const item = (
    <li
      className={twMerge(
        'text-sm font-normal hover:bg-gray-200 duration-300 cursor-pointer opacity-50 hover:opacity-100 w-full whitespace-nowrap',
        selected && 'bg-gray-200 opacity-100',
        href ? 'p-0' : 'p-1 px-3',
        className,
      )}
      onClick={onClick}
    >
      {!href && children}
      {href && (
        <Link className="block p-1 px-3" href={href} target={target}>
          {children}
        </Link>
      )}
    </li>
  );

  return item;
}
