import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export default function Bloc({
  className,
  title,
  children,
}: {
  className?: string;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className={twMerge(
        'flex flex-col border border-gray-400 bg-black',
        className,
      )}
    >
      <div className="w-full flex items-center">
        <div className="font-specialmonster text-xl ml-4 mt-2 mb-4 border-b-2 border-white">
          {title}
        </div>
      </div>

      <div className="flex flex-col">{children}</div>
    </div>
  );
}
