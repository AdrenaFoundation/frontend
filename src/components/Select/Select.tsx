import { useState } from "react";
import styles from "./Select.module.scss";

export default function Select<T extends string>({
  className,
  selected,
  options,
  onSelect,
}: {
  className?: string;
  selected: T;
  options: T[];
  onSelect: (opt: T) => void;
}) {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <div className={`${styles.select} ${className ?? ""}`}>
      <div
        className={styles.select__selected}
        onClick={() => setOpened(!opened)}
      >
        <span>{selected}</span>
        <img src="/images/chevron-down.svg" />
      </div>

      <div
        className={`${styles.select__list} ${
          opened ? styles.select__list_opened : ""
        }`}
      >
        {options
          .filter((option) => option !== selected)
          .map((option) => (
            <div
              onClick={() => {
                onSelect(option);
                setOpened(false);
              }}
              key={option}
            >
              {option}
            </div>
          ))}
      </div>
    </div>
  );
}
