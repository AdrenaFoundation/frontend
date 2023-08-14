import { createRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TabSelect<T extends string>({
  selected,
  onClick,
  tabs,
}: {
  selected?: string;
  tabs: {
    title: T;
    icon?: string;
  }[];
  onClick: (title: T, index: number) => void;
}) {
  const [activeElement, setActiveElement] = useState({
    width: 0,
    height: 0,
    x: 0,
  });

  console.log('selected', tabs, selected);
  const [activeTab, setActiveTab] = useState(selected ? 0 : null);

  const refs: React.RefObject<HTMLDivElement>[] = tabs.map(() => createRef());

  useEffect(() => {
    console.log('activeTab', activeTab);
    if (activeTab !== null && refs[activeTab].current) {
      setActiveElement({
        width: refs[activeTab].current?.offsetWidth ?? 0,
        height: refs[activeTab].current?.offsetHeight ?? 0,
        x: refs[activeTab].current?.offsetLeft ?? 0,
      });
    }
  }, [refs, activeTab]);

  return (
    <div className="relative flex flex-row gap-3 justify-between w-full bg-dark border border-gray-200 rounded-xl p-1">
      <div
        className="absolute h-full bg-gray-300 rounded-lg cursor-pointer"
        style={{
          width: activeElement.width,
          height: activeElement.height,
          transform: `translatex(${activeElement.x - 3}px)`,
          transition: 'all 0.3s var(--bezier-smooth)',
        }}
      ></div>
      {tabs.map(({ title }, index) => (
        <div
          className={twMerge(
            'text-sm font-normal text-center p-1 w-full rounded-lg cursor-pointer capitalize z-10',

            activeTab !== null && index === activeTab
              ? 'opacity-100'
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
