import React, { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function StyledSubContainer({
  className,
  children,
  id,
}: {
  className?: string;
  children?: ReactNode;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={twMerge(
        'flex flex-col bg-secondary w-full h-full border rounded-md p-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
