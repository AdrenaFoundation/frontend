import { twMerge } from 'tailwind-merge';

export default function Switch({
  checked,
  onChange,
  className,
}: {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={twMerge(
        'relative inline-block w-6 h-3 rounded-full bg-third cursor-pointer',
        checked ? 'bg-green' : 'bg-third',
        className,
      )}
      onClick={() => onChange(!checked)}
    >
      <div
        className={twMerge(
          'absolute inline-block w-3 h-3 rounded-full bg-white shadow-sm transform transition-transform',
          checked ? 'translate-x-full' : 'translate-x-0',
        )}
      />
    </div>
  );
}
