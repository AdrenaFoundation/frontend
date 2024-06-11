import { twMerge } from 'tailwind-merge';

export default function TextExplain({
  title,
  className,
  position = 'top',
}: {
  title: string;
  className?: string;
  position?: 'top' | 'bottom';
}) {
  const titleDiv = (
    <span className="text-gray-500 whitespace-nowrap">{title}</span>
  );

  const barDiv = (
    <div
      className={twMerge(
        'h-1 border-l-2 border-r-2 border-gray-600 w-full',
        position === 'top'
          ? 'border-t-2 mt-[0.15em]'
          : 'border-b-2 mb-[0.15em]',
      )}
    />
  );

  return (
    <div
      className={twMerge(
        'absolute left-0 w-full z-20 flex flex-col justify-center items-center',
        position === 'top' ? 'top-[-1em]' : 'bottom-[-1em]',
        className,
      )}
    >
      {position === 'top' ? titleDiv : barDiv}
      {position === 'top' ? barDiv : titleDiv}
    </div>
  );
}
