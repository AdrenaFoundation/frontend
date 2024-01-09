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
      className={twMerge('w-full border border-gray-300 rounded-md', className)}
    >
      {children}
    </ul>
  );
}
