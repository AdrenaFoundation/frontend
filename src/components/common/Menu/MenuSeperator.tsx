import { twMerge } from 'tailwind-merge';

export default function MenuSeperator({ className }: { className?: string }) {
  return <li className={twMerge('w-full h-[1px] bg-gray-300', className)} />;
}
