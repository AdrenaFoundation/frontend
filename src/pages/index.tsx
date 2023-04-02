import { twMerge } from 'tailwind-merge';

export default function Home() {
  return (
    <main
      className={twMerge(
        'w-full',
        'h-full',
        'flex',
        'justify-center',
        'items-center',
        'bg-main',
      )}
    >
      Landing page
    </main>
  );
}
