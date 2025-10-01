import Link from 'next/link';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function MenuItem({
  className,
  linkClassName,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  selected,
  href,
  target,
  id,
}: {
  id?: string;
  className?: string;
  linkClassName?: string;
  children: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  href?: string;
  target?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  disabled?: boolean;
}) {
  const item = (
    <li
      className={twMerge(
        'font-semibold text-sm bg-third hover:bg-secondary duration-300 cursor-pointer w-full whitespace-nowrap',
        selected && 'bg-main',
        href ? 'p-0' : 'p-1 px-3',
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      id={id}
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
