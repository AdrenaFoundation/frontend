import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function StyledSubContainer({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={twMerge(
        'flex flex-col bg-third w-full h-full border rounded-lg p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
