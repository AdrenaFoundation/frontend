import styles from "./Input.module.scss";

export default function Input({
  value,
  onChange,
  placeholder,
  className,
}: {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(v) => onChange(v.target.value)}
      placeholder={placeholder}
      className={`${styles.input} ${className ?? ""}`}
    />
  );
}
