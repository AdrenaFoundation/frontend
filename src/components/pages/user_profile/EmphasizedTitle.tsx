import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function EmphasizedTitle({
  title,
  className,
}: {
  title: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={twMerge('flex w-full justify-center items-center', className)}
    >
      <div className="flex h-[1px] grow bg-gray-300"></div>
      <div className="font-specialmonster text-sm text-txtfade opacity-70">
        {title}
      </div>
      <div className="flex h-[1px] grow bg-gray-300"></div>
    </div>
  );
}
