import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function StyledSubSubContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={twMerge(
        'flex justify-between bg-third w-full h-full border rounded-lg p-3 z-10',
        className,
      )}
    >
      {children}
    </div>
  );
}
