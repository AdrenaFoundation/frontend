import { twMerge } from "tailwind-merge";

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
    <div className={twMerge("flex", className)}>
      {tabs.map(({ title, icon }, index) => (
        <div
          key={title}
          className={twMerge(
            "p-4",
            "capitalize",
            "cursor-pointer",
            "flex",
            "items-center",
            "justify-center",
            title === selected ? "bg-secondary" : "bg-main",
            "grow",
            "hover:opacity-90"
          )}
          onClick={() => onClick(title, index)}
        >
          {icon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="mr-4 h-4 w-4" src={icon} alt="tab icon" />
          ) : null}

          <span>{title}</span>
        </div>
      ))}
    </div>
  );
}
