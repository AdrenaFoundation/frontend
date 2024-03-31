import { twMerge } from 'tailwind-merge';

export default function InputNumber({
  value,
  disabled,
  onChange,
  placeholder,
  className,
  max,
  inputFontSize,
  decimalConstraint,
}: {
  value?: number;
  disabled?: boolean;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  max?: number;
  inputFontSize?: string;
  decimalConstraint?: number;
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

        const decimals = nb.toString().split('.')[1]?.length;

        if (Number(decimals) >= Number(decimalConstraint)) return;

        // Set max input value to 500m
        onChange(Math.min(nb, max ?? 500_000_000));
      }}
      placeholder={placeholder}
      className={twMerge(
        'bg-fourth border-0 outline-none w-full text-xl text-ellipsis placeholder-txtfade',
        className,
      )}
      style={{
        fontSize: inputFontSize ?? '1.4em',
      }}
    />
  );
}
