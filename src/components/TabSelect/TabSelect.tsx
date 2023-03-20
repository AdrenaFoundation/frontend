import styles from "./TabSelect.module.scss";

export default function TabSelect<T extends string>({
  selected,
  onClick,
  className,
  tabs,
}: {
  selected: string;
  tabs: {
    title: T;
    icon?: string;
  }[];
  onClick: (title: T, index: number) => void;
  className?: string;
}) {
  return (
    <div className={`${styles.tabSelect} ${className ?? ""}`}>
      {tabs.map(({ title, icon }, index) => (
        <div
          key={title}
          className={`${styles.tabSelect__tab} ${
            title === selected ? styles.tabSelect__selected_tab : ""
          }`}
          onClick={() => onClick(title, index)}
        >
          {icon ? <img src={icon} alt="tab icon" /> : null}

          <span>{title}</span>
        </div>
      ))}
    </div>
  );
}
