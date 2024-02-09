import Link from 'next/link';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function MenuItem({
  className,
  linkClassName,
  children,
  onClick,
  selected,
  href,
  target,
}: {
  className?: string;
  linkClassName?: string;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  href?: string;
  target?: string;
}) {
  const item = (
    <li
      className={twMerge(
        'text-sm font-normal bg-gray-200 hover:bg-dark duration-300 cursor-pointer opacity-75 hover:opacity-100 w-full whitespace-nowrap',
        selected && 'bg-gray-300 opacity-100',
        href ? 'p-0' : 'p-1 px-3',
        className,
      )}
      onClick={onClick}
    >
      {!href && children}
      {href && (
        <Link
          className={twMerge('block p-1 px-3', linkClassName)}
          href={href}
          target={target}
        >
          {children}
        </Link>
      )}
    </li>
  );

  return item;
}
