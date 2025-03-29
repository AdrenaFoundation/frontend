import { twMerge } from 'tailwind-merge';

export default function Checkbox({
  checked,
  onChange,
  className,
  variant = 'default',
}: {
  checked?: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  variant?: 'default' | 'white';
}) {
  return (
    <div
      className={twMerge(
        'h-3 w-3 border border-bcolor rounded-[0.2em] cursor-pointer flex justify-center items-center',
        checked
          ? "bg-[url('/images/check.svg')] bg-no-repeat bg-center bg-contain"
          : variant === 'white' ? 'bg-white' : '',
        className,
      )}
      onClick={() => onChange(!checked)}
    />
  );
}