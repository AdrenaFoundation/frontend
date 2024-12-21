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
    <span className="text-gray-500 whitespace-nowrap text-xs">{title}</span>
  );

  const barDiv = (
    <div
      className={twMerge(
        'h-[0.3em] border-l-2 border-r-2 border-gray-600 w-full',
        position === 'top'
          ? 'border-t-2 mt-[0.1em]'
          : 'border-b-2 mb-[0.1em]',
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
