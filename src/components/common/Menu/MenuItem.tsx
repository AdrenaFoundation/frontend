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
  disabled,
}: {
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
        'text-sm bg-third hover:bg-secondary duration-300 w-full whitespace-nowrap',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
        selected && 'bg-main',
        href ? 'p-0' : 'p-1 px-3',
        className,
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={() => {
        if (!disabled && onClick) {
          onClick();
        }
      }}
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
