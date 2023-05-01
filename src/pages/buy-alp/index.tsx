import { twMerge } from 'tailwind-merge';

export default function BuyALP() {
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
      <div className="text-4xl font-bold mb-8 mt-4">Buy ALP</div>
    </div>
  );
}
