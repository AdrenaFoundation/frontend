import { createRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TextExplain({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'absolute top-[-1em] left-0 w-full z-20 flex flex-col justify-center items-center',
        className,
      )}
    >
      <span className="text-gray-600 whitespace-nowrap">{title}</span>

      <div className="h-1 border-t-2 border-l-2 border-r-2 border-gray-700 w-full mt-[0.15em]"></div>
    </div>
  );
}
