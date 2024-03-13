import { createRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useResize } from '@/hooks/useResize';

export default function TabSelect<T extends string | number>({
  selected,
  onClick,
  tabs,
  wrapperClassName,
  className,
}: {
  selected?: T;
  tabs: {
    title: T;
    icon?: string;
  }[];
  onClick: (title: T, index: number) => void;
  className?: string;
  wrapperClassName?: string;
}) {
  const [activeElement, setActiveElement] = useState({
    width: 0,
    height: 0,
    x: 0,
  });

  const [size] = useResize();

  const [activeTab, setActiveTab] = useState<null | number>(
    selected !== undefined ? 0 : null,
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
  }, [activeTab, size.width]);

  return (
    <div
      className={twMerge(
        'relative flex flex-row gap-3 justify-between w-full bg-dark border border-gray-200 rounded-full p-1 mb-3',
        wrapperClassName,
      )}
    >
      <div
        className="absolute h-full bg-gray-200 rounded-full cursor-pointer"
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
            'text-sm font-normal text-center p-1 w-full rounded-full cursor-pointer capitalize z-10',
            className && className,
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
