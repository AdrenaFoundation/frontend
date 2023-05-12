import { twMerge } from 'tailwind-merge';

export default function InputNumber({
  value,
  disabled,
  onChange,
  placeholder,
  className,
}: {
  value?: number;
  disabled?: boolean;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      disabled={disabled}
      value={value ?? ''}
      onChange={(v) => {
        if (!v.target.value.length) {
          return onChange(null);
        }

        const nb = Math.abs(Number(v.target.value));

        // Set max input value to 500m
        onChange(Math.min(nb, 500_000_000));
      }}
      placeholder={placeholder}
      className={twMerge(
        'bg-secondary',
        'border-0',
        'outline-none',
        'w-full',
        'text-xl',
        className,
      )}
      style={{
        fontSize: '1.4em',
      }}
    />
  );
}
