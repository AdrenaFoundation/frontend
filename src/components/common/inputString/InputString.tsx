import { twMerge } from 'tailwind-merge';

export default function InputString({
  value,
  disabled,
  onChange,
  placeholder,
  className,
  inputFontSize,
  maxLength,
}: {
  value?: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  inputFontSize?: string;
}) {
  return (
    <input
      type="string"
      disabled={disabled}
      onWheel={(e) => {
        // Disable the scroll changing input value
        (e.target as HTMLInputElement).blur();
      }}
      maxLength={maxLength}
      value={value}
      onChange={(v) => {
        if (!v.target.value.length) return onChange(null);

        onChange(v.target.value);
      }}
      placeholder={placeholder}
      className={twMerge(
        'bg-secondary border-0 outline-none w-full text-xl',
        className,
      )}
      style={{
        fontSize: inputFontSize ?? '1.4em',
      }}
    />
  );
}
