import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function MenuItems({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <ul
      className={twMerge(
        'w-full border border-dark rounded-xl overflow-hidden',
        className,
      )}
    >
      {children}
    </ul>
  );
}
