import { twMerge } from 'tailwind-merge';

export default function MenuSeparator({ className }: { className?: string }) {
  return <li className={twMerge('w-full h-[1px] bg-third', className)} />;
}
