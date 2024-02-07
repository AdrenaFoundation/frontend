import { twMerge } from 'tailwind-merge';

export default function InputNumber({
  value,
  disabled,
  onChange,
  placeholder,
  className,
  max,
  inputFontSize,
}: {
  value?: number;
  disabled?: boolean;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  max?: number;
  inputFontSize?: string;
}) {
  return (
    <input
      type="number"
      disabled={disabled}
      onWheel={(e) => {
        // Disable the scroll changing input value
        (e.target as HTMLInputElement).blur();
      }}
      value={value ?? ''}
      onChange={(v) => {
        if (!v.target.value.length) {
          return onChange(null);
        }

        const nb = Math.abs(Number(v.target.value));

        // Set max input value to 500m
        onChange(Math.min(nb, max ?? 500_000_000));
      }}
      placeholder={placeholder}
      className={twMerge(
        'bg-secondary border-0 outline-none w-full text-xl text-ellipsis',
        className,
      )}
      style={{
        fontSize: inputFontSize ?? '1.4em',
      }}
    />
  );
}
