import { twMerge } from 'tailwind-merge';

export default function InputString({
  value,
  disabled,
  onChange,
  placeholder,
  className,
  inputFontSize,
  maxLength,
  onEnterKeyPressed,
}: {
  value?: string;
  disabled?: boolean;
  onChange: (value: string | null) => void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  inputFontSize?: string;
  onEnterKeyPressed?: () => void;
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
      onKeyDown={(e) => {
        if (!onEnterKeyPressed) return;

        if (e.key === "Enter") {
          onEnterKeyPressed();
        }
      }}
      placeholder={placeholder}
      className={twMerge(
        'bg-third border-0 border-bcolor outline-none w-full text-xl',
        className,
      )}
      style={{
        fontSize: inputFontSize ?? '1.4em',
      }}
    />
  );
}
