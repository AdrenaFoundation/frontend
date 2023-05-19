import { twMerge } from 'tailwind-merge';

import { PageProps } from '@/types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function Earn(_: PageProps) {
  return (
    <div
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'p-4',
        'overflow-auto',
        'flex-col',
        'bg-main',
      )}
    >
      <div className="text-4xl font-bold mb-8 mt-4">TODO</div>
    </div>
  );
}
