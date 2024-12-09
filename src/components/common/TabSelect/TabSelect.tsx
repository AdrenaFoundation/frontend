import { createRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TabSelect<T extends string | number>({
  selected,
  initialSelectedIndex,
  onClick,
  tabs,
  className,
  titleClassName,
  wrapperClassName,
}: {
  selected?: T;
  initialSelectedIndex?: number;
  tabs: {
    title: T;
    icon?: string;
    activeColor?: string;
    disabled?: boolean;
  }[];
  onClick: (title: T, index: number) => void;
  className?: string;
  wrapperClassName?: string;
  titleClassName?: string;
}) {
  const [activeElement, setActiveElement] = useState({
    width: 0,
    height: 0,
    x: 0,
  });

  const [activeTab, setActiveTab] = useState<null | number>(
    selected !== undefined ? initialSelectedIndex ?? 0 : null,
  );

  const refs: React.RefObject<HTMLDivElement>[] = tabs.map(() => createRef());

  useEffect(() => {
    if (activeTab !== null && refs[activeTab].current) {
      setActiveElement({
        width: refs[activeTab].current?.offsetWidth ?? 0,
        height: refs[activeTab].current?.offsetHeight ?? 0,
        x: refs[activeTab].current?.offsetLeft ?? 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="relative flex flex-row gap-3 justify-between w-full border border-bcolor rounded-full p-1 mb-3 bg-third">
      <div
        className="absolute h-full bg-white rounded-full cursor-pointer"
        style={{
          width: activeElement.width,
          height: activeElement.height,
          transform: `translatex(${activeElement.x - 3}px)`,
          transition: 'all 0.3s var(--bezier-smooth)',
        }}
      />
      {tabs.map(({ title }, index) => (
        <div
          className={twMerge(
            'text-sm text-center p-1 w-full rounded-lg cursor-pointer capitalize z-10 font-boldy select-none',
            className && className,
            activeTab !== null && index === activeTab
              ? 'opacity-100 text-black'
              : 'opacity-50',
          )}
          ref={refs[index]}
          key={title}
          onClick={() => {
            onClick(title, index);
            setActiveTab(index);
          }}
        >
          {title}
        </div>
      ))}
    </div>
  );
}