import { twMerge } from 'tailwind-merge';

export default function InputNumber({
  value,
  disabled,
  onChange,
  placeholder,
  className,
  min,
  max,
  inputFontSize,
  decimalConstraint,
  onBlur,
}: {
  value?: number;
  disabled?: boolean;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  inputFontSize?: string;
  decimalConstraint?: number;
  onBlur?: () => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = val === '' ? null : parseFloat(val);
    onChange(num);
  };

  const stepValue = decimalConstraint
    ? `0.${'0'.repeat(decimalConstraint - 1)}1`
    : '0.01';

  return (
    <input
      type="number"
      disabled={disabled}
      onWheel={(e) => {
        // Disable the scroll changing input value
        (e.target as HTMLInputElement).blur();
      }}
      value={value !== undefined && value !== null ? value : ''}
      onChange={handleChange}
      placeholder={placeholder}
      className={twMerge(
        'bg-black border-0 outline-none w-full text-xl text-ellipsis placeholder-txtfade',
        className,
      )}
      style={{
        fontSize: inputFontSize ?? '1.4em',
      }}
      min={min}
      max={max}
      onBlur={onBlur} // Pass onBlur to the input element
      step={stepValue}
    />
  );
}
