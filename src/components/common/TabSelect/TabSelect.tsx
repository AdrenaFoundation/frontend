import Image from 'next/image';
import { createRef, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export default function TabSelect<T extends string | number>({
  selected,
  initialSelectedIndex,
  onClick,
  tabs,
  wrapperClassName,
  className,
  titleClassName,
}: {
  selected?: T;
  initialSelectedIndex?: number;
  tabs: {
    title: T;
    displayTitle?: string;
    icon?: string;
    activeColor?: string;
    disabled?: boolean;
  }[];
  onClick: (title: T, index: number) => void;
  className?: string;
  wrapperClassName?: string;
  titleClassName?: string;
}) {
  const [activeTab, setActiveTab] = useState<null | number>(
    selected !== undefined ? (initialSelectedIndex ?? 0) : null,
  );

  const refs: React.RefObject<HTMLDivElement>[] = tabs.map(() => createRef());

  useEffect(() => {
    if (typeof selected !== 'undefined') {
      setActiveTab(tabs.findIndex((tab) => tab.title === selected));
    }
  }, [selected, tabs]);

  return (
    <div
      className={twMerge(
        'relative flex flex-row justify-between w-full pb-1 mb-1',
        wrapperClassName,
      )}
    >
      {tabs.map(({ title: title, displayTitle, activeColor, disabled }, index) => (
        <div
          className={twMerge(
            'p-1 w-full cursor-pointer z-10',
            className,
            activeTab !== null && index === activeTab
              ? activeColor
                ? `opacity-100 border-b-[0.2em] ${activeColor}`
                : 'opacity-100 border-b-[0.2em] border-highlight'
              : 'opacity-50 border-b-[1px]',
            disabled && 'opacity-25 cursor-not-allowed',
            tabs[index].icon &&
            'flex flex-row gap-1 items-center justify-center ',
          )}
          ref={refs[index]}
          key={title}
          onClick={() => {
            if (disabled) return;

            onClick(title, index);
            setActiveTab(index);
          }}
        >
          {tabs[index].icon && (
            <Image
              src={tabs[index].icon}
              alt={title as string}
              width={12}
              height={12}
            />
          )}
          <h5
            className={twMerge(
              'text-center uppercase select-none',
              titleClassName,
            )}
          >
            {displayTitle || title}
          </h5>
        </div>
      ))}
    </div>
  );
}
